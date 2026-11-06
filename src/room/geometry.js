// ─────────────────────────────────────────────────────────────────────────────
// The room's shape, in units of S (the room scale: the height of a desktop view).
//
// Top-down, x runs along the room and z across it. The door is in the middle of the x = 0 wall
// (W); the two long walls are N (z = 0) and S (z = D); the far wall is E (x = L). The room's text
// is on the hallway side of the entrance wall, beside the arch, like a gallery's sign. You walk
// a loop at distance `d` from whichever wall you face, turning at the corners.
//
// Yaw: 0 faces -z (the N wall), 90 faces +x (E), 180 faces +z (S), 270 faces -x (W).
// ─────────────────────────────────────────────────────────────────────────────

// The room's scale S for a view w × h: the height of a desktop view, or on a screen taller than
// it's wide, 1.6 times its width, so a phone sees about a photo and a half of wall at a time,
// big enough to look at. (Any smaller, the room would sit small in a band across the middle of
// a phone, with the camera looking far up and down past its walls.)
export const roomScale = (w, h) => Math.min(h, 1.6 * w);

export const GEO = {
  P: 0.95, // perspective: the eye's distance from the picture plane (the .room CSS repeats it)
  d: 0.95, // how far from a wall you stand to look at it (= P, so it's seen at scale 1, and a
  // 16:10 view takes in 1.6 S of wall); close, so the room can be small
  // The room is as big as its photos need, so they sit near the corners, and no smaller than
  // this (you stand d off a wall, so a room less than about 2 d across feels cramped)
  minD: 1.7, // the room's depth, between the two long walls, at least
  minL: 1.8, // its length, at least
  inset: 0.1, // bare wall before the first photo and after the last
  gap: 0.05, // space between two photo slots: close, so several are in view at once
  maxGap: 0.07, // and on a wall with room to spare, at most this, so three slots and their labels
  // fit in a 16:10 view
  eye: 0.44, // eye level, down the wall strip (which runs 0..1 S)
  arch: { w: 0.55, h: 0.58 }, // the archway in: its width; the height of its crown above the floor
  hall: { depth: 1.25, t: 0.15 }, // the hallway outside: how far back it runs; the wall's thickness
  doorCam: -1.1, // where you stand in the hallway, looking in through the arch, far enough back to
  // read the room's sign beside it (the .room CSS vars --archw and --archh repeat the arch's size)
  sign: { w: 0.3, gap: 0.06 }, // the room's sign on the hallway wall: its width; how far left of the arch
  turn: 0.6, // scroll distance per radian of turning at a corner
  cornerPad: 0.05, // spare wall past the photos a corner view takes in
  cornerFar: 1.4, // a corner view may stand at most this far off the walls (and stays in the room)
  // Big surfaces are built from pieces: the browser only draws the pieces in view, and sizes
  // each piece's bitmap by how close its corner is, so a piece near the camera must be small
  // or it costs hundreds of megabytes (and Chrome drops surfaces when it runs out). The floor
  // and ceiling tiles are canvases, drawn once at a fixed size, which sidesteps that.
  tile: 0.5, // floor and ceiling tiles, and at least tileMin px across (in a phone's small
  tileMin: 360, // room: Safari falls over with too many surfaces in one 3D scene)
  tilePx: 512, // at most this many pixels across a textured tile's canvas
  panel: 0.75, // wall panels
  panelNear: 0.3, // on the entrance wall, which you pass close by going in
  panelMin: 300, // but at least this many px (a phone's small room needs few, and Safari
  // falls over with too many surfaces in one 3D scene)
  nearFloor: 0.6, // floor nearer than this can't be seen on a desktop (you look 27° down at
  // most), so it's hidden; a taller view sees further down (Room.jsx works it out)
  nearCeil: 0.85, // likewise the ceiling (22° up)
};

// Which photos hang where. Each group (a photo, or a pair under one label) is one slot.
// The far wall takes 3 slots when the count is odd and 2 when it's even; once the long walls
// have seven each, the entrance wall gets one either side of the door; the rest split evenly
// (a small room is filled along its long walls, so their photos reach the corners).
// Walking left from the door you meet the walls in order: N wall, far wall, S wall, then the
// entrance wall (below the door first, then above it).
// Numbering starts on your left as you come in: with photos on the entrance wall, the first
// hangs there beside the door (the slot on the corner with the N wall, which the walk reaches
// last), then the N wall carries on from 2.
export function distribute(groups) {
  const n = groups.length;
  const far = Math.min(n, n % 2 ? 3 : 2);
  let rest = n - far;
  const ent = rest >= 14 ? 2 : 0;
  rest -= ent;
  const side = rest / 2;
  const hang = ent ? [...groups.slice(1), groups[0]] : groups;
  let i = 0;
  const take = (k) => hang.slice(i, (i += k));
  return { N: take(side), E: take(far), S: take(side), W: take(ent) };
}

// Each wall's place in the room (px): where its left end is, which way its length runs,
// which way it faces (into the room), and the yaw that looks straight at it.
export function wallsFor(L, D) {
  return {
    N: { len: L, x0: 0, z0: 0, rot: 0, dir: [1, 0], nrm: [0, 1], yaw: 0 },
    E: { len: D, x0: L, z0: 0, rot: -90, dir: [0, 1], nrm: [-1, 0], yaw: 90 },
    S: { len: L, x0: L, z0: D, rot: 180, dir: [-1, 0], nrm: [0, -1], yaw: 180 },
    W: { len: D, x0: 0, z0: D, rot: 90, dir: [0, -1], nrm: [1, 0], yaw: 270 },
  };
}

export const WALL_ORDER = ['N', 'E', 'S', 'W'];

// The CSS transform that puts a wall strip (or any vertical face) in the room.
export const placeFace = (x0, z0, rot) => `translate3d(${x0.toFixed(2)}px,0,${z0.toFixed(2)}px) rotateY(${rot}deg)`;

// Where you stand to look straight at the point `lx` along a wall, `dist` out from it.
export function standAt(wall, lx, dist) {
  return {
    x: wall.x0 + lx * wall.dir[0] + dist * wall.nrm[0],
    z: wall.z0 + lx * wall.dir[1] + dist * wall.nrm[1],
    yaw: wall.yaw,
  };
}

// Rotate a vector about y, in CSS's rotateY sense.
export function rotY(deg, [x, y, z]) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

// An element's layout box inside `root` (transforms ignored).
export function localBox(el, root) {
  let x = 0;
  let y = 0;
  for (let n = el; n && n !== root; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// How far an element stands off its wall (frames do, a little; more on a bay).
export function depthOf(el) {
  let z = 0;
  for (let n = el; n && !n.classList.contains('wall') && !n.classList.contains('face'); n = n.parentElement) {
    const m = getComputedStyle(n).transform;
    if (m && m !== 'none') z += new DOMMatrixReadOnly(m).m43;
  }
  return z;
}

// The short way round from heading a to heading b, in degrees (-180..180).
export const turnTo = (a, b) => ((((b - a) % 360) + 540) % 360) - 180;

// The hallway side of the entrance wall, which carries the room's sign, placed like a wall
// (facing the hallway, where you start).
export function hallFaceFor(S, D) {
  return { len: D, x0: -GEO.hall.t * S, z0: 0, rot: -90, dir: [0, 1], nrm: [-1, 0], yaw: 90 };
}

// Where to stand to look straight at the point (lx, ly) on a face from `dist` out, as a full
// pose (y runs down from the eye, which is `eye` down the strip).
export function poseFacing(face, lx, ly, dist, eye) {
  return {
    x: face.x0 + lx * face.dir[0] + dist * face.nrm[0],
    y: ly - eye,
    z: face.z0 + lx * face.dir[1] + dist * face.nrm[1],
    yaw: face.yaw,
  };
}

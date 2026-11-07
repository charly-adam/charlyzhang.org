import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { getViewMode } from '../viewMode.js';
import { getRoom, site, themes } from '../data/gallery.js';
import { Curtain, Lens } from '../components/Scene.jsx';
import { metaLine, titleLine } from '../components/Frame.jsx';
import { EdgeArrows, Hallway, Slab, Track, Wall } from '../components/RoomBox.jsx';
import { useRailCamera } from '../hooks/useRailCamera.js';
import { useDolly } from '../hooks/useDolly.js';
import { usePreload } from '../hooks/usePreload.js';
import { GEO, WALL_ORDER, depthOf, distribute, hallFaceFor, localBox, placeFace, roomScale, standAt, turnTo, wallsFor } from '../room/geometry.js';

export default function RoomRoute() {
  const { slug, photoId } = useParams();
  const { state } = useLocation();
  const room = getRoom(slug);
  if (!room) return <Navigate to="/" replace />;
  // someone who'd rather see rooms as collages gets one, coming in; not stepping back from a
  // photo they were sent a link to (state.gallery: stepping back within the gallery)
  if (!photoId && !state?.gallery && getViewMode() === 'collage') return <Navigate to={`/room/${slug}/collage`} replace />;
  return <Room room={room} />;
}

const FLY_MS = 2000;
const displayed = (el) => (el && el.offsetParent ? el : null); // an element, unless it's display: none

function Room({ room }) {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [atIntro, setAtIntro] = useState(false);
  // up close on a phone the arrows fade away to leave the photo; a touch brings them back a while
  const [wake, setWake] = useState(false);
  const wakeTimer = useRef(0);
  const [entered, setEntered] = useState(!!photoId); // past the doorway (a deep link lands inside)
  const [flying, setFlying] = useState(false);
  const [leaving, setLeaving] = useState(false); // going out: the room fades to black
  const [geo, setGeo] = useState(null); // { S, L, D, tall } in px, once the walls have been measured
  const [ready, setReady] = useState(false); // the room has loaded and had a moment to draw; the curtain lifts
  const [tick, setTick] = useState(0); // bumps on resize
  const stageRef = useRef(null);
  const dollyRef = useRef(null);
  const camRef = useRef(null);
  const worldRef = useRef(null);
  const hallRef = useRef(null); // the hallway side of the entrance wall, with the room's sign
  const wallRefs = { N: useRef(null), E: useRef(null), S: useRef(null), W: useRef(null) };
  const railRef = useRef(null);
  const wallsRef = useRef(null);
  const facesRef = useRef(null);
  const doorPoseRef = useRef({ x: 0, z: 0, yaw: 90 });
  const fromRef = useRef(null); // where you set off from to walk up to a photo: { t, pose }
  const cullRef = useRef(null); // hides the floor and ceiling right under and over the camera
  const geoRef = useRef(null);
  geoRef.current = geo;
  const builtFor = useRef(null);
  const theme = themes[room.theme];
  const hang = useMemo(() => distribute(room.groups), [room]);
  // the photos as they hang on the wall, and the room's surfaces
  const { done: loaded, progress } = usePreload(room.slug, [...room.photos.map((p) => p.wall), theme.floor.img, theme.ceil.img, '/textures/wall-grain.png', room.theme === 'salon' && '/textures/damask.svg']);

  // a new room: back to its doorway
  const [shown, setShown] = useState(room.slug);
  if (shown !== room.slug) {
    setShown(room.slug);
    setAtIntro(false);
    setEntered(!!photoId);
    setFlying(false);
    setLeaving(false);
    setReady(false);
    fromRef.current = null;
  }

  // What the camera has walked up to: a photo (in the URL), the room's introduction, or nothing.
  const near = room.photos.find((p) => p.id === photoId) || null;
  const focus = near ? near.id : atIntro ? 'intro' : null;
  const nearIndex = near ? room.photos.indexOf(near) : -1;
  // lamps switch off (and back on) in a ripple outward from the photo you walked up to
  const litGroup = useRef(0);
  if (near) litGroup.current = room.groups.findIndex((g) => g.includes(near));

  const chooseRef = useRef(null);
  const cam = useRailCamera({ stageRef, camRef, paused: !!focus || flying || leaving, onChoose: (dir) => chooseRef.current?.(dir), onPose: (p) => cullRef.current?.(p) });

  // up close, the arrows go to the photo either side. They hang in order round the room from
  // your right as you come in, so on any wall the next one is on the left.
  const n = room.photos.length;
  const leftPhoto = near ? room.photos[(nearIndex + 1) % n] : null;
  const rightPhoto = near ? room.photos[(nearIndex - 1 + n) % n] : null;

  // ── measuring: the walls are as long as their photos need, the long ones at least minL and
  // the far one at least minD ──
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const S = roomScale(stage.clientWidth, stage.clientHeight);
    const natural = (side) => {
      const w = wallRefs[side].current;
      if (!w) return 0;
      const cols = [...w.querySelectorAll('[data-stop="photo"]')];
      const sum = cols.reduce((a, c) => a + c.offsetWidth, 0);
      return 2 * GEO.inset * S + sum + Math.max(0, cols.length - 1) * GEO.gap * S;
    };
    const L = Math.max(GEO.minL * S, natural('N'), natural('S'));
    const D = Math.max(GEO.minD * S, natural('E'));
    // On a wall longer than its photos need, they'd spread out evenly, so far apart that you see
    // one at a time. Space them as evenly as that, but no further apart than maxGap; the spare
    // wall goes to the two ends alike, where the corner views still take in the photo there.
    // { gap, pad } in px.
    const spacingFor = (side, len) => {
      const w = wallRefs[side].current;
      if (!w || room.solo) return null;
      const cols = [...w.querySelectorAll('[data-stop="photo"]')];
      if (!cols.length) return null;
      const inset = GEO.inset * S;
      const sum = cols.reduce((a, c) => a + c.offsetWidth, 0);
      const even = (len - 2 * inset - sum) / (cols.length + 1);
      const gap = Math.max(GEO.gap * S, Math.min(GEO.maxGap * S, even));
      const spare = Math.max(0, len - 2 * inset - sum - (cols.length - 1) * gap);
      return { gap: Math.round(gap), pad: Math.round(inset + spare / 2) };
    };
    const gaps = { N: spacingFor('N', L), E: spacingFor('E', D), S: spacingFor('S', L) };
    // a view tall enough to see past the top and bottom of the entrance wall from the doorway
    // (a phone) needs the hallway's floor and ceiling there. A landscape view sees a sliver past
    // its foot (about 13% at P 0.95), which the dark threshold covers: drawing the floor and
    // ceiling right under and over the camera for that blows Chrome's tile budget at Retina and
    // it drops the entrance wall, so they come on only past `past`.
    const P = GEO.P * S;
    const out = (GEO.hall.t + GEO.doorCam) * -S; // from the doorway to the entrance wall
    const past = 1.2;
    const tall = (0.56 * stage.clientHeight) / P > (past * (0.78 - GEO.eye) * S) / out || (0.44 * stage.clientHeight) / P > (past * (GEO.eye - 0.07) * S) / out;
    const sameGaps = (a) => a && ['N', 'E', 'S'].every((k) => a[k]?.gap === gaps[k]?.gap && a[k]?.pad === gaps[k]?.pad);
    setGeo((g) => (g && g.S === S && g.L === L && g.D === D && g.tall === tall && sameGaps(g.gaps) ? g : { S, L, D, tall, gaps }));
  });

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // ── the loop: a corner view between walls showing the last photo of one and the first of the
  // next, a stop at each photo between, and a stop at the door ──
  useLayoutEffect(() => {
    if (!geo) return;
    const { S, L, D } = geo;
    const P = GEO.P * S;
    const d = GEO.d * S;
    const walls = wallsFor(L, D);
    wallsRef.current = walls;
    facesRef.current = { hall: hallFaceFor(S, D) };
    const stage = stageRef.current;
    // how far along each wall a corner view takes in, as a share of its distance from the corner
    const h = Math.atan(stage.clientWidth / 2 / P);
    const k = h >= Math.PI / 4 ? 1 : 1 - 1 / Math.tan(Math.PI / 4 + h);
    const byLeft = (a, b) => a.offsetLeft - b.offsetLeft;
    // a corner with a bare wall either side would show one photo and a blank wall: it's walked
    // through, and the photo it would have shown gets a stop of its own
    const count = (side) => wallRefs[side].current.querySelectorAll('[data-stop="photo"]').length;
    const passes = (a, b) => !(count(a) && count(b));
    // how far a corner view may stand off the walls: no further than cornerFar, and inside the room
    const amax = Math.min(GEO.cornerFar * S, Math.min(L, D) - 0.15 * S);
    const stops = [];
    WALL_ORDER.forEach((side, wi) => {
      const wall = walls[side];
      const el = wallRefs[side].current;
      const cols = [...el.querySelectorAll('[data-stop]')].sort(byLeft);
      const photoCols = cols.filter((c) => c.dataset.stop === 'photo');
      const doorCol = cols.find((c) => c.dataset.stop === 'door');
      const prevSide = WALL_ORDER[(wi + 3) % 4];
      const nextSide = WALL_ORDER[(wi + 1) % 4];
      // the first photo is seen from the corner before, the last from the corner after (unless
      // they're walked through); each of the rest is a stop, square on to it with its neighbours
      // in view either side. In a solo room every photo has a stop of its own, and the corners
      // show two at once as well.
      const from = passes(prevSide, side) ? 0 : 1;
      const to = passes(side, nextSide) ? photoCols.length : photoCols.length - 1;
      const between = room.solo ? photoCols : photoCols.slice(from, Math.max(from, to));
      const here = between.map((col) => {
        const f = col.querySelector('.frame') || col;
        const b = localBox(f, el);
        const lx = b.x + b.w / 2;
        return { kind: 'photo', side, cols: [col], lx, pose: standAt(wall, lx, d) };
      });
      if (doorCol) {
        const lx = doorCol.offsetLeft + doorCol.offsetWidth / 2;
        here.push({ kind: 'door', side, cols: [doorCol], lx, pose: standAt(wall, lx, d) });
      }
      here.sort((a, b) => a.lx - b.lx);
      stops.push(...here);
      // the corner on to the next wall: stand back far enough to see the last photo here and the
      // first one there
      const nw = walls[nextSide];
      const nel = wallRefs[nextSide].current;
      const nfirst = [...nel.querySelectorAll('[data-stop="photo"]')].sort(byLeft)[0];
      let reach = 0;
      const last = photoCols[photoCols.length - 1];
      if (last) {
        const b = localBox(last.querySelector('.frame') || last, el);
        reach = Math.max(reach, wall.len - b.x);
      }
      if (nfirst) {
        const b = localBox(displayed(nfirst.querySelector('.label')) || nfirst, nel);
        reach = Math.max(reach, b.x + b.w);
      }
      const a = Math.min(amax, Math.max(0.5 * S, (reach + GEO.cornerPad * S) / k));
      const cx = wall.x0 + wall.len * wall.dir[0];
      const cz = wall.z0 + wall.len * wall.dir[1];
      stops.push({ kind: 'corner', name: side + nextSide, pass: passes(side, nextSide), pose: { x: cx + a * (wall.nrm[0] + nw.nrm[0]), z: cz + a * (wall.nrm[1] + nw.nrm[1]), yaw: wall.yaw + 45 } });
    });
    // distance along the loop: the walk plus the turn, the loop closing where it began
    const keys = [];
    let t = 0;
    let yaw = stops[0].pose.yaw;
    const seq = [...stops, stops[0]];
    seq.forEach((st, i) => {
      if (i > 0) {
        const p = seq[i - 1].pose;
        const q = st.pose;
        const dy = turnTo(yaw, q.yaw);
        t += Math.hypot(q.x - p.x, q.z - p.z) + (Math.abs(dy) * Math.PI / 180) * GEO.turn * S;
        yaw += dy;
      }
      keys.push({ t, x: st.pose.x, z: st.pose.z, yaw });
      if (i < stops.length) {
        st.t = t;
        st.pose = { ...st.pose, yaw };
      }
    });
    const rail = { keys, T: t, stops };
    const doorPose = { x: GEO.doorCam * S, z: D / 2, yaw: 90 };
    doorPoseRef.current = doorPose;
    const keep = railRef.current ? cam.nearestStop()?.i ?? -1 : -1;
    railRef.current = rail;
    if (builtFor.current !== room.slug) {
      builtFor.current = room.slug;
      cam.reset(doorPose);
    }
    cam.setDoor(doorPose, P);
    cam.setRail(rail, keep);
    markUnseen(doorPose, walls, S, D);
    // The floor right under the camera and the ceiling right over it are never in view (on a
    // desktop you look 27° down and 22° up at most; a tall view sees further), but the browser
    // would still draw them at a huge magnification. Hide those tiles as the camera moves.
    const down = (0.56 * stage.clientHeight) / P; // how steeply you see down, and up
    const up = (0.44 * stage.clientHeight) / P;
    const nearFloor = Math.min(GEO.nearFloor * S, (0.9 * (0.78 - GEO.eye) * S) / down);
    const nearCeil = Math.min(GEO.nearCeil * S, (0.9 * (GEO.eye - 0.07) * S) / up);
    const tiles = [...worldRef.current.querySelectorAll('.tile')].map((el) => {
      const cx = +el.dataset.cx;
      const cz = +el.dataset.cz;
      const hw = parseFloat(el.style.width) / 2;
      const hh = parseFloat(el.style.height) / 2;
      const c = [[cx - hw, cz - hh], [cx + hw, cz - hh], [cx + hw, cz + hh], [cx - hw, cz + hh]];
      return { el, cx, cz, hw, hh, r: +el.dataset.r, edges: c.map((a, i) => [...a, ...c[(i + 1) % 4]]), R: el.classList.contains('ftile') ? nearFloor : nearCeil, hidden: el.style.visibility === 'hidden' };
    });
    // On a phone the view takes in a narrow slice of the room (S is 1.6 times the screen's
    // width), but Safari would still draw all of it and run out of memory, dropping photos and
    // floor. So there, whatever is well outside the view is hidden too: wall panels and photo
    // columns (with their lamps' light), and floor and ceiling tiles, each tested against a
    // wedge `spare` wider than the view either side, so it's drawn before it turns into view.
    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const spare = (30 * Math.PI) / 180;
    const wk = Math.tan(Math.min((80 * Math.PI) / 180, Math.atan(stage.clientWidth / 2 / P) + spare));
    // does the segment a–b (x, z) cross the wedge in front of pose p?
    const cross = (p, f, rt, ax, az, bx, bz) => {
      const af = (ax - p.x) * f[0] + (az - p.z) * f[1];
      const ar = (ax - p.x) * rt[0] + (az - p.z) * rt[1];
      const bf = (bx - p.x) * f[0] + (bz - p.z) * f[1];
      const br = (bx - p.x) * rt[0] + (bz - p.z) * rt[1];
      let t0 = 0;
      let t1 = 1;
      for (const s of [1, -1]) {
        const g0 = af * wk - s * ar;
        const g1 = bf * wk - s * br;
        if (g0 < 0 && g1 < 0) return false;
        if (g0 < 0) t0 = Math.max(t0, g0 / (g0 - g1));
        else if (g1 < 0) t1 = Math.min(t1, g0 / (g0 - g1));
      }
      return t0 <= t1;
    };
    const items = [];
    worldRef.current.querySelectorAll('[data-off]').forEach((n) => n.removeAttribute('data-off'));
    if (narrow) {
      WALL_ORDER.forEach((side) => {
        const w = walls[side];
        const el = wallRefs[side].current;
        const at = (lx, out) => [w.x0 + lx * w.dir[0] + out * w.nrm[0], w.z0 + lx * w.dir[1] + out * w.nrm[1]];
        const add = (node, a, b, out) => items.push({ el: node, segs: [[...at(a, 0), ...at(b, 0)], ...(out ? [[...at(a, out), ...at(b, out)]] : [])], off: false });
        el.querySelectorAll(':scope > .panel').forEach((n) => add(n, n.offsetLeft, n.offsetLeft + n.offsetWidth, 0));
        el.querySelectorAll(':scope > [data-stop="photo"]').forEach((n) => add(n, n.offsetLeft - 0.3 * S, n.offsetLeft + n.offsetWidth + 0.3 * S, 0.3 * S));
      });
    }
    cullRef.current = (p) => {
      const a = (p.yaw * Math.PI) / 180;
      const f = [Math.sin(a), -Math.cos(a)];
      const rt = [Math.cos(a), Math.sin(a)];
      for (const t of tiles) {
        let hide = Math.hypot(p.x - t.cx, p.z - t.cz) + t.r < t.R;
        if (!hide && narrow) {
          const inside = Math.abs(p.x - t.cx) <= t.hw && Math.abs(p.z - t.cz) <= t.hh;
          hide = !inside && !t.edges.some((e) => cross(p, f, rt, ...e));
        }
        if (hide !== t.hidden) {
          t.hidden = hide;
          t.el.style.visibility = hide ? 'hidden' : '';
        }
      }
      for (const it of items) {
        const off = !it.segs.some((e) => cross(p, f, rt, ...e));
        if (off !== it.off) {
          it.off = off;
          it.el.toggleAttribute('data-off', off);
        }
      }
    };
    cullRef.current(cam.getPose());
  }, [geo, room, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // From the doorway you see into the room only through the arch, but the browser would draw
  // everything in the view behind the entrance wall too, and in a big room that's more than it
  // has memory for: it drops surfaces. So mark what can't be seen through the opening (wall
  // panels, photo columns with their lamps, floor and ceiling tiles: each by its corners,
  // projected through the arch from where you stand); CSS hides it until you go in.
  const markUnseen = (pose, walls, S, D) => {
    const eye = GEO.eye * S;
    const ax = -GEO.hall.t * S; // the opening's outer face
    const aw = (GEO.arch.w * S) / 2;
    const top = (0.78 - GEO.arch.h) * S - eye; // its crown, down from the eye
    const bottom = 0.78 * S - eye;
    const seen = (pts) => {
      let z0 = Infinity;
      let z1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const [x, y, z] of pts) {
        if (x <= pose.x + 1) return true;
        const t = (ax - pose.x) / (x - pose.x);
        const pz = pose.z + (z - pose.z) * t;
        z0 = Math.min(z0, pz);
        z1 = Math.max(z1, pz);
        y0 = Math.min(y0, y * t);
        y1 = Math.max(y1, y * t);
      }
      return z1 > D / 2 - aw && z0 < D / 2 + aw && y1 > top && y0 < bottom;
    };
    const wallTop = 0.07 * S - eye;
    ['N', 'E', 'S'].forEach((side) => {
      const w = walls[side];
      const el = wallRefs[side].current;
      const at = (lx, y, out = 0) => [w.x0 + lx * w.dir[0] + out * w.nrm[0], y, w.z0 + lx * w.dir[1] + out * w.nrm[1]];
      const span = (a, b, out) => [at(a, wallTop), at(b, wallTop), at(a, bottom), at(b, bottom), at(a, wallTop, out), at(b, wallTop, out), at(a, bottom, out), at(b, bottom, out)];
      el.querySelectorAll(':scope > .panel').forEach((p) => p.toggleAttribute('data-unseen', !seen(span(p.offsetLeft, p.offsetLeft + p.offsetWidth, 0))));
      // a column's lamp and its light reach out past it and off the wall
      el.querySelectorAll(':scope > [data-stop="photo"]').forEach((c) => {
        c.toggleAttribute('data-unseen', !seen(span(c.offsetLeft - 0.3 * S, c.offsetLeft + c.offsetWidth + 0.3 * S, 0.25 * S)));
      });
    });
    // (the hallway's own tiles are this side of the entrance wall, in plain view)
    worldRef.current.querySelectorAll('.tile:not(.hall)').forEach((t) => {
      const cx = +t.dataset.cx;
      const cz = +t.dataset.cz;
      const r = +t.dataset.r;
      const y = t.classList.contains('ftile') ? bottom : wallTop;
      t.toggleAttribute('data-unseen', !seen([[cx - r, y, cz - r], [cx + r, y, cz - r], [cx - r, y, cz + r], [cx + r, y, cz + r]]));
    });
  };

  // the curtain lifts once the room has loaded and had a moment to draw
  useEffect(() => {
    if (!geo || !loaded || ready) return undefined;
    const id = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(id);
  }, [geo, loaded, ready]);

  // The stop a photo is seen from: its own, or for the first and last on a wall, the corner
  // view that takes it in.
  const stopFor = useCallback((frame) => {
    const rail = railRef.current;
    const col = frame.closest('[data-stop]');
    const wallEl = frame.closest('.wall');
    const side = wallEl.dataset.side;
    const own = rail.stops.find((s) => s.cols?.includes(col));
    if (own) return own;
    const cols = [...wallEl.querySelectorAll('[data-stop="photo"]')].sort((a, b) => a.offsetLeft - b.offsetLeft);
    const i = WALL_ORDER.indexOf(side);
    const name = cols.indexOf(col) === 0 ? WALL_ORDER[(i + 3) % 4] + side : side + WALL_ORDER[(i + 1) % 4];
    return rail.stops.find((s) => s.kind === 'corner' && s.name === name) || rail.stops[0];
  }, []);

  // ── the dolly: what to walk up to, and from where ──
  const measure = useCallback((id) => {
    const g = geoRef.current;
    const rail = railRef.current;
    if (!g || !rail) return null;
    const eye = GEO.eye * g.S;
    if (id === 'intro') {
      const faceEl = hallRef.current;
      const el = faceEl?.querySelector('.intro-inner');
      if (!el) return null;
      return { base: { t: null, pose: doorPoseRef.current }, face: facesRef.current.hall, box: localBox(el, faceEl), depth: depthOf(el), eye };
    }
    const frame = worldRef.current?.querySelector(`[data-photo="${id}"]`);
    const wallEl = frame?.closest('.wall');
    if (!wallEl) return null;
    const side = wallEl.dataset.side;
    // a photo is framed with its wall label beside it (where there is one: not on a phone)
    const col = frame.closest('[data-stop]');
    const boxes = [frame, displayed(col.querySelector('.label'))].filter(Boolean).map((e) => localBox(e, wallEl));
    const x0 = Math.min(...boxes.map((b) => b.x));
    const x1 = Math.max(...boxes.map((b) => b.x + b.w));
    const y0 = Math.min(...boxes.map((b) => b.y));
    const y1 = Math.max(...boxes.map((b) => b.y + b.h));
    const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    // from where you set off; moving on to another photo up close (or coming in by a deep
    // link), from the stop that photo is seen from, so stepping back leaves you there
    let base = fromRef.current;
    if (!base) {
      const st = stopFor(frame);
      base = { t: st.t, pose: st.pose };
      fromRef.current = base;
    }
    return { base, face: wallsRef.current[side], box, depth: depthOf(frame), eye };
  }, [stopFor]);
  // walking up to a photo waits a moment for the other lights to go out first
  const leadIn = useCallback((id) => (id === 'intro' ? 0 : 210), []);
  const getP = useCallback(() => GEO.P * (geoRef.current?.S || 0), []);
  useDolly({ stageRef, dollyRef, targetId: focus, measure, leadIn, resetKey: room.slug, getPose: cam.getPose, jumpTo: cam.jumpTo, getP });

  useEffect(() => {
    document.title = `${room.name} · ${site.name}`;
  }, [room]);

  const open = (p) => {
    if (flying || leaving) return;
    // setting off from the walk: remember where, to come back to; moving on up close: forget
    // it, and come back to wherever the new photo is seen from
    if (!focus) fromRef.current = cam.getMode() === 'rail' ? { t: cam.getT(), pose: { ...cam.getPose() } } : { t: null, pose: doorPoseRef.current };
    else fromRef.current = null;
    setAtIntro(false);
    navigate(`/room/${room.slug}/${p.id}`);
  };
  // going out: the room fades to black, then the front desk. (Walking out through the arch
  // would show the hallway, a closed box that isn't the lobby you came from.)
  const leave = () => {
    if (!geoRef.current || leaving || flying || focus) return;
    setLeaving(true);
  };
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => navigate('/'), 650);
    return () => clearTimeout(id);
  }, [leaving, navigate]);
  const stepBack = useCallback(() => {
    setAtIntro(false);
    if (photoId) navigate(`/room/${room.slug}`, { state: { gallery: true } });
  }, [navigate, room.slug, photoId]);
  const toggleIntro = () => {
    if (atIntro) return stepBack();
    if (cam.getMode() !== 'door') return;
    if (photoId) navigate(`/room/${room.slug}`, { state: { gallery: true } });
    setAtIntro(true);
  };
  // in the doorway: go in, turning to the right, where the first photo hangs
  const goIn = () => {
    const g = geoRef.current;
    if (!g || entered || flying || focus || leaving) return;
    if (cam.enter(1, { x: 0.6 * g.S, z: g.D / 2 }, FLY_MS, () => setFlying(false))) {
      setFlying(true);
      setEntered(true);
    }
  };
  chooseRef.current = goIn;

  // the arrows either side (inside the room): left and right along the wall you face, or up
  // close, the photo either side
  const arrow = (way) => {
    if (focus === 'intro' || flying || leaving || !entered) return;
    if (near) return open(way < 0 ? leftPhoto : rightPhoto);
    cam.step(way);
  };

  // Moving from one photo to the next up close, its lamp clicks on as the camera arrives.
  const prevNear = useRef(null);
  const switching = !!near && !!prevNear.current && prevNear.current !== near;
  useEffect(() => {
    prevNear.current = near;
  });

  // Enter walks up to whatever you're facing; up close, Escape steps back and the arrow keys move
  // to the photo either side. In the doorway Enter, Space or the up arrow go in.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('dialog')) return;
      if (!focus) {
        const mode = cam.getMode();
        if (mode === 'fly') return;
        if (mode === 'door') {
          if (e.key === 'ArrowUp' || ((e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button, a'))) goIn();
          else return;
          e.preventDefault();
          return;
        }
        if ((e.key !== 'Enter' && e.key !== ' ') || e.target.closest?.('button, a')) return;
        const st = cam.nearestStop()?.stop;
        if (st?.kind === 'photo') {
          const id = st.cols[0].querySelector('.frame')?.dataset.photo;
          if (id) open(room.photos.find((p) => p.id === id));
        } else if (st?.kind === 'door') leave();
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') stepBack();
      else if (e.key === 'ArrowLeft' && leftPhoto) open(leftPhoto);
      else if (e.key === 'ArrowRight' && rightPhoto) open(rightPhoto);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // up close, a click anywhere but on the wall's own things steps back
  const onStageClick = (e) => {
    if (focus && !e.target.closest('.frame, .label, .intro-inner, .doorbtn, .turn')) stepBack();
  };

  // lamps click off in a ripple round the loop from the photo you walked up to
  const offFor = (g) => {
    const gi = room.groups.indexOf(g);
    const m = room.groups.length;
    const di = Math.abs(gi - litGroup.current);
    return `${Math.min(di, m - di) * 35}ms`;
  };
  const onZoomGroup = (g) => (g.includes(near) ? stepBack() : open(g[0]));
  const onOpen = (p) => (p === near ? stepBack() : open(p));

  // ── placing the walls, floor and ceiling ──
  const S = geo ? geo.S : 0;
  const L = geo ? geo.L : 0;
  const D = geo ? geo.D : 0;
  const walls = geo ? wallsFor(L, D) : null;
  const wallStyle = (side) => {
    if (!walls) return undefined;
    const sp = geo.gaps?.[side];
    return { width: walls[side].len, transform: placeFace(walls[side].x0, walls[side].z0, walls[side].rot), ...(sp && { '--wgap': `${sp.gap}px`, '--wpad': `${sp.pad}px`, '--wjust': 'flex-start' }) };
  };

  const door = { to: '/', onLeave: leave };
  const wallProps = { S, near, solo: !!room.solo, offFor, onOpen, onZoom: onZoomGroup };
  const stageClass = `stage room t-${room.theme}${room.solo ? ' solo' : ''}${focus ? ' near' : ''}${near ? ' dark' : ''}${atIntro ? ' at-intro' : ''}${geo ? '' : ' unmeasured'}${ready ? ' ready' : ''}${leaving ? ' leaving' : ''}${entered ? ' in' : ' at-door'}${geo?.tall ? ' tall' : ''}`;
  const arrowLabels = near ? ['The photo to the left', 'The photo to the right'] : ['Walk left', 'Walk right'];

  return (
    <div ref={stageRef} className={stageClass} style={{ '--on': switching ? '0.43s' : '0s' }} onClick={onStageClick} onPointerDown={() => {
        if (!near) return;
        setWake(true);
        clearTimeout(wakeTimer.current);
        wakeTimer.current = setTimeout(() => setWake(false), 2500);
      }} role="region" aria-label={`${room.name}. Go in at the door, then scroll, drag or use the arrow keys to walk round the room.`}>
      <div ref={dollyRef} className="dolly">
        <div ref={camRef} className="cam">
          <div ref={worldRef} className="room3d">
            <Slab kind="ceiling" S={S} L={L} D={D} theme={theme} />
            {room.theme !== 'white' && <Track S={S} L={L} D={D} />}
            {WALL_ORDER.map((side) => (
              <Wall key={side} side={side} len={walls ? walls[side].len : 0} groups={hang[side]} style={wallStyle(side)} wallRef={wallRefs[side]} door={side === 'W' ? door : null} {...wallProps} />
            ))}
            <Slab kind="floor" S={S} L={L} D={D} theme={theme} />
            <Hallway S={S} D={D} theme={theme} room={room} onToggle={toggleIntro} onEnter={goIn} hallRef={hallRef} />
          </div>
        </div>
      </div>
      <Lens />
      {near && (
        <p key={near.id} className="caption">
          <span className="caption-title">{titleLine(near)}</span>
          <span className="caption-meta">{metaLine(near)}</span>
        </p>
      )}
      <Curtain key={room.slug} kicker={site.name} name={room.name} progress={progress} />
      <EdgeArrows onLeft={() => arrow(-1)} onRight={() => arrow(1)} hidden={!entered || focus === 'intro' || flying || leaving} wake={wake} leftLabel={arrowLabels[0]} rightLabel={arrowLabels[1]} />
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getRoom, nextRoom, site, themes } from '../data/gallery.js';
import { Curtain, Lens } from '../components/Scene.jsx';
import { EdgeArrows, Hallway, Pillar, Slab, Track, Wall } from '../components/RoomBox.jsx';
import { useRailCamera } from '../hooks/useRailCamera.js';
import { useDolly } from '../hooks/useDolly.js';
import { usePreload } from '../hooks/usePreload.js';
import { GEO, WALL_ORDER, depthOf, distribute, localBox, pillarFor, placeFace, standAt, turnTo, wallsFor } from '../room/geometry.js';

export default function RoomRoute() {
  const { slug } = useParams();
  const room = getRoom(slug);
  if (!room) return <Navigate to="/" replace />;
  return <Room room={room} />;
}

const FLY_MS = 2000;

function Room({ room }) {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [atIntro, setAtIntro] = useState(false);
  const [entered, setEntered] = useState(!!photoId); // past the doorway (a deep link lands inside)
  const [flying, setFlying] = useState(false);
  const [leaving, setLeaving] = useState(false); // walking out through the arch
  const [geo, setGeo] = useState(null); // { S, L, D } in px, once the walls have been measured
  const [ready, setReady] = useState(false); // the room has loaded and had a moment to draw; the curtain lifts
  const [tick, setTick] = useState(0); // bumps on resize
  const stageRef = useRef(null);
  const dollyRef = useRef(null);
  const camRef = useRef(null);
  const worldRef = useRef(null);
  const pillarRef = useRef(null);
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
  const next = nextRoom(room);
  const exit = next ? `/room/${next.slug}` : '/';
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

  // up close, the arrows go to the photo either side (they hang in order round the room)
  const n = room.photos.length;
  const prevPhoto = near ? room.photos[(nearIndex - 1 + n) % n] : null;
  const nextPhoto = near ? room.photos[(nearIndex + 1) % n] : null;

  // ── measuring: the walls are as long as their photos need, the long ones at least minL and
  // the far one at least D ──
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const S = Math.min(stage.clientHeight, stage.clientWidth / 1.6);
    const natural = (side) => {
      const w = wallRefs[side].current;
      if (!w) return 0;
      const cols = [...w.querySelectorAll('[data-stop="photo"]')];
      const sum = cols.reduce((a, c) => a + c.offsetWidth, 0);
      return 2 * GEO.inset * S + sum + Math.max(0, cols.length - 1) * GEO.gap * S;
    };
    const L = Math.max(GEO.minL * S, natural('N'), natural('S'));
    const D = Math.max(GEO.D * S, natural('E'));
    setGeo((g) => (g && g.S === S && g.L === L && g.D === D ? g : { S, L, D }));
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
    facesRef.current = pillarFor(S, D);
    const stage = stageRef.current;
    // how far along each wall a corner view takes in, as a share of its distance from the corner
    const h = Math.atan(stage.clientWidth / 2 / P);
    const k = h >= Math.PI / 4 ? 1 : 1 - 1 / Math.tan(Math.PI / 4 + h);
    const byLeft = (a, b) => a.offsetLeft - b.offsetLeft;
    const stops = [];
    WALL_ORDER.forEach((side, wi) => {
      const wall = walls[side];
      const el = wallRefs[side].current;
      const cols = [...el.querySelectorAll('[data-stop]')].sort(byLeft);
      const photoCols = cols.filter((c) => c.dataset.stop === 'photo');
      const doorCol = cols.find((c) => c.dataset.stop === 'door');
      // the first photo is seen from the corner before, the last from the corner after; each
      // of the rest is a stop, square on to it with its neighbours in view either side. In a
      // solo room every photo has a stop of its own, and the corners are only walked through.
      const between = room.solo ? photoCols : photoCols.length > 2 ? photoCols.slice(1, -1) : [];
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
      const nextSide = WALL_ORDER[(wi + 1) % 4];
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
        const b = localBox(nfirst.querySelector('.label') || nfirst, nel);
        reach = Math.max(reach, b.x + b.w);
      }
      // by the pillar the view keeps to the walk's distance, so it stays clear of it
      const amax = side === 'W' || nextSide === 'W' ? d : GEO.cornerFar * S;
      const a = Math.min(amax, Math.max(0.5 * S, (reach + GEO.cornerPad * S) / k));
      const cx = wall.x0 + wall.len * wall.dir[0];
      const cz = wall.z0 + wall.len * wall.dir[1];
      stops.push({ kind: 'corner', name: side + nextSide, pass: !!room.solo, pose: { x: cx + a * (wall.nrm[0] + nw.nrm[0]), z: cz + a * (wall.nrm[1] + nw.nrm[1]), yaw: wall.yaw + 45 } });
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
    // The floor right under the camera and the ceiling right over it are never in view (you
    // look 27° down and 22° up at most), but the browser would still draw them at a huge
    // magnification. Hide those tiles as the camera moves.
    const tiles = [...worldRef.current.querySelectorAll('.tile')].map((el) => ({
      el,
      cx: +el.dataset.cx,
      cz: +el.dataset.cz,
      r: +el.dataset.r,
      R: (el.classList.contains('ftile') ? GEO.nearFloor : GEO.nearCeil) * S,
      hidden: false,
    }));
    cullRef.current = (p) => {
      for (const t of tiles) {
        const hide = Math.hypot(p.x - t.cx, p.z - t.cz) + t.r < t.R;
        if (hide !== t.hidden) {
          t.hidden = hide;
          t.el.style.visibility = hide ? 'hidden' : '';
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
      el.querySelectorAll(':scope > [data-stop="photo"]').forEach((c) => c.toggleAttribute('data-unseen', !seen(span(c.offsetLeft - 0.3 * S, c.offsetLeft + c.offsetWidth + 0.3 * S, 0.25 * S))));
    });
    worldRef.current.querySelectorAll('.tile').forEach((t) => {
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
    const id = setTimeout(() => setReady(true), 300);
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
      const faceEl = pillarRef.current?.querySelector('.pface.front');
      const el = faceEl?.querySelector('.intro-inner');
      if (!el) return null;
      return { base: { t: null, pose: doorPoseRef.current }, face: facesRef.current.front, box: localBox(el, faceEl), depth: depthOf(el), eye };
    }
    const frame = worldRef.current?.querySelector(`[data-photo="${id}"]`);
    const wallEl = frame?.closest('.wall');
    if (!wallEl) return null;
    const side = wallEl.dataset.side;
    // a photo is framed with its wall label beside it
    const col = frame.closest('[data-stop]');
    const boxes = [frame, col.querySelector('.label')].filter(Boolean).map((e) => localBox(e, wallEl));
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
  const leadIn = useCallback((id) => (id === 'intro' ? 0 : 420), []);
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
  // out through the arch, the room fading to black behind you, then the lobby (or next room)
  const leave = () => {
    const g = geoRef.current;
    if (!g || leaving || flying || focus) return;
    const to = { x: -0.6 * g.S, z: g.D / 2, yaw: 270 };
    if (cam.leave(to, { x: 0.6 * g.S, z: g.D / 2 }, 1900, () => navigate(exit))) setLeaving(true);
  };
  const stepBack = useCallback(() => {
    setAtIntro(false);
    if (photoId) navigate(`/room/${room.slug}`);
  }, [navigate, room.slug, photoId]);
  const toggleIntro = () => {
    if (atIntro) return stepBack();
    if (cam.getMode() !== 'door') return;
    if (photoId) navigate(`/room/${room.slug}`);
    setAtIntro(true);
  };
  // in the doorway: pick a side and set off
  const choose = (side) => {
    const g = geoRef.current;
    if (!g || entered || flying || focus) return;
    if (cam.enter(side, { x: 0.6 * g.S, z: g.D / 2 }, FLY_MS, () => setFlying(false))) {
      setFlying(true);
      setEntered(true);
    }
  };
  chooseRef.current = choose;

  // the arrows either side: pick a way at the door; then left and right along the wall you
  // face, or up close, the photo either side
  const arrow = (way) => {
    if (focus === 'intro' || flying || leaving) return;
    if (near) return open(way < 0 ? prevPhoto : nextPhoto);
    if (!entered) return choose(way);
    cam.step(way);
  };

  // Moving from one photo to the next up close, its lamp clicks on as the camera arrives.
  const prevNear = useRef(null);
  const switching = !!near && !!prevNear.current && prevNear.current !== near;
  useEffect(() => {
    prevNear.current = near;
  });

  // Enter walks up to whatever you're facing; up close, Escape steps back and the arrow keys move
  // to the previous / next photo. In the doorway the arrow keys pick a side.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('dialog')) return;
      if (!focus) {
        const mode = cam.getMode();
        if (mode === 'fly') return;
        if (mode === 'door') {
          if (e.key === 'ArrowLeft') choose(-1);
          else if (e.key === 'ArrowRight') choose(1);
          else if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button, a')) toggleIntro();
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
      else if (e.key === 'ArrowLeft' && prevPhoto) open(prevPhoto);
      else if (e.key === 'ArrowRight' && nextPhoto) open(nextPhoto);
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
    return `${Math.min(di, m - di) * 70}ms`;
  };
  const onZoomGroup = (g) => (g.includes(near) ? stepBack() : open(g[0]));
  const onOpen = (p) => (p === near ? stepBack() : open(p));

  // ── placing the walls, floor, ceiling and pillar ──
  const S = geo ? geo.S : 0;
  const L = geo ? geo.L : 0;
  const D = geo ? geo.D : 0;
  const walls = geo ? wallsFor(L, D) : null;
  const wallStyle = (side) => (walls ? { width: walls[side].len, transform: placeFace(walls[side].x0, walls[side].z0, walls[side].rot) } : undefined);
  const faces = {};
  if (geo) Object.entries(pillarFor(S, D)).forEach(([k, f]) => (faces[k] = { ...f, transform: placeFace(f.x0, f.z0, f.rot) }));

  const door = { to: exit, next, onLeave: leave };
  const wallProps = { S, near, solo: !!room.solo, artist: site.name, offFor, onOpen, onZoom: onZoomGroup };
  const stageClass = `stage room t-${room.theme}${room.solo ? ' solo' : ''}${focus ? ' near' : ''}${near ? ' dark' : ''}${atIntro ? ' at-intro' : ''}${geo ? '' : ' unmeasured'}${ready ? ' ready' : ''}${leaving ? ' leaving' : ''}${entered ? ' in' : ' at-door'}`;
  const arrowLabels = near ? ['The photo to the left', 'The photo to the right'] : entered ? ['Walk left', 'Walk right'] : ['Go round to the left', 'Go round to the right'];

  return (
    <div ref={stageRef} className={stageClass} style={{ '--on': switching ? '0.85s' : '0s' }} onClick={onStageClick} role="region" aria-label={`${room.name}. Pick a side at the door, then scroll, drag or use the arrow keys to walk round the room.`}>
      <div ref={dollyRef} className="dolly">
        <div ref={camRef} className="cam">
          <div ref={worldRef} className="room3d">
            <Slab kind="ceiling" S={S} L={L} D={D} theme={theme} />
            {room.theme !== 'white' && <Track S={S} L={L} D={D} />}
            {WALL_ORDER.map((side) => (
              <Wall key={side} side={side} len={walls ? walls[side].len : 0} groups={hang[side]} style={wallStyle(side)} wallRef={wallRefs[side]} door={side === 'W' ? door : null} {...wallProps} />
            ))}
            <Pillar room={room} site={site} onToggle={toggleIntro} faces={faces} S={S} pillarRef={pillarRef} />
            <Slab kind="floor" S={S} L={L} D={D} theme={theme} />
            <Hallway S={S} D={D} theme={theme} />
          </div>
        </div>
      </div>
      <Lens />
      <Curtain kicker={`Room ${room.num}`} name={room.name} progress={progress} />
      <EdgeArrows onLeft={() => arrow(-1)} onRight={() => arrow(1)} hidden={focus === 'intro' || flying || leaving} leftLabel={arrowLabels[0]} rightLabel={arrowLabels[1]} />
    </div>
  );
}

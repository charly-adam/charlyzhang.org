import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getRoom, roomList } from '../data/gallery.js';
import { Curtain } from '../components/Scene.jsx';
import { metaLine, titleLine } from '../components/Frame.jsx';
import { usePreload } from '../hooks/usePreload.js';
import { bezier } from '../hooks/useDolly.js';
import { salonHang, seedOf, seeded, shuffled } from '../room/salon.js';

// Collage mode: a room's photos (or every photo on the site) hung salon-style on one flat wall,
// in the room's own paint and frames. Drag to look round, pinch or scroll to zoom; a photo
// clicked is zoomed in on, the rest of the wall going dark, as in a room.

// the All photos wall: plain gallery white, every photo once, scattered (the same each visit),
// with those from Charly's best rooms hung bigger
const ALL_FAVORED = new Set(['favorites', 'film', 'travel']);
const favored = (p) => ALL_FAVORED.has(p.room);
const ALL_THEME = 'white';
const allPhotos = (() => {
  const seen = new Set();
  const out = [];
  for (const r of roomList) {
    for (const p of r.photos) {
      // the same picture hung in two rooms: the same file, or the same title and year
      const v = p.file.split('?v=')[1];
      const keys = [v ? `v${v}` : p.file, `${p.title.trim().toLowerCase()}|${p.year}`];
      if (keys.some((k) => seen.has(k))) continue;
      keys.forEach((k) => seen.add(k));
      out.push(p);
    }
  }
  return shuffled(out, seeded(seedOf('all photos')));
})();
export const allPhotoCount = allPhotos.length;

export function RoomCollage() {
  const { slug } = useParams();
  const room = getRoom(slug);
  if (!room) return <Navigate to="/" replace />;
  return <Collage key={slug} id={slug} name={room.name} theme={room.theme} photos={room.photos} base={`/room/${slug}/collage`} />;
}

export function AllCollage() {
  return <Collage key="all" id="all" name="All photos" theme={ALL_THEME} photos={allPhotos} favored={favored} base="/collage" />;
}

const IN = { ms: 850, ease: bezier(0.62, 0, 0.18, 1) };
const OUT = { ms: 650, ease: bezier(0.5, 0, 0.2, 1) };
const EASY = { ms: 380, ease: bezier(0.3, 0, 0.2, 1) };
// a copy is swapped for the next size up once it shows this many device pixels across (long side)
const THUMB_PX = 560 * 1.15;
const WALL_PX = 1200 * 1.15;

// the screen, and the room the wall gets on it: under the switch at the top, over the map at the bottom
function measureBox(stage) {
  const vw = stage.clientWidth;
  const vh = stage.clientHeight;
  const phone = vw <= 700;
  return { vw, vh, phone, top: phone ? 62 : 74, bottom: phone ? 100 : 96, side: phone ? 14 : 44 };
}

// One framed photo on the wall. It starts with the small copy and moves up to a bigger one
// (`want`) once that has loaded, never back down.
const RANK = (p, src) => (src === p.file ? 2 : src === p.wall ? 1 : 0);
const CFrame = memo(function CFrame({ f, ox, oy, want, lit, onOpen }) {
  const p = f.photo;
  const [src, setSrc] = useState(p.thumb);
  useEffect(() => {
    if (RANK(p, want) <= RANK(p, src)) return undefined;
    let live = true;
    const im = new Image();
    im.src = want;
    im.decode().then(() => live && setSrc(want), () => {});
    return () => {
      live = false;
    };
  }, [want, src, p]);
  return (
    <div className={lit ? 'cfw lit' : 'cfw'} style={{ left: f.x + ox, top: f.y + oy, width: f.w, height: f.h, '--S': `${f.S}px` }}>
      <button type="button" className="frame" data-photo={p.id} onClick={(e) => onOpen(p, e)} aria-label={`View ${p.title}`}>
        <img src={src} alt={p.title} width={p.width} height={p.height} decoding="async" draggable="false" />
      </button>
    </div>
  );
});

function Collage({ id, name, theme, photos, favored, base }) {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const wallRef = useRef(null);
  const [box, setBox] = useState(null);
  const [ready, setReady] = useState(false);
  const [tiers, setTiers] = useState({}); // photo id → 1 (wall copy) or 2 (full size), once zoomed in enough
  const [hint, setHint] = useState(false);
  const { done: loaded, progress } = usePreload(`collage-${id}`, [...photos.map((p) => p.thumb), '/textures/wall-grain.png', theme === 'salon' && '/textures/damask.svg', theme === 'sky' && '/textures/birds.svg'], 350);

  // the hang: wide on a wide screen, tall on a tall one
  const aspect = box ? ((box.vw - 2 * box.side) / (box.vh - box.top - box.bottom) < 1 ? 0.62 : 1.55) : null;
  const hang = useMemo(() => (aspect ? salonHang(photos, { aspect, theme, favored, seed: seedOf(`${id}:${aspect}`) }) : null), [photos, aspect, theme, id, favored]);

  // The wall: the hang with a margin of bare wall round it, enough that at its smallest (the
  // whole hang in view) the wall still fills the screen.
  const geom = useMemo(() => {
    if (!hang || !box) return null;
    const { vw, vh, top, bottom, side } = box;
    const availH = vh - top - bottom;
    const fitZ = Math.min((vw - 2 * side) / hang.W, availH / hang.H);
    const M = 0.05 * Math.max(hang.W, hang.H);
    const mx = Math.max(M, vw / fitZ / 2 - hang.W / 2) + 2;
    const my = Math.max(M, (top + availH / 2) / fitZ - hang.H / 2, (vh - top - availH / 2) / fitZ - hang.H / 2) + 2;
    let maxZ = fitZ * 3;
    for (const f of hang.frames) maxZ = Math.max(maxZ, Math.min((0.96 * vw) / f.w, (0.96 * vh) / f.h) * 1.6);
    return { fitZ, maxZ, mx, my, Ww: hang.W + 2 * mx, Wh: hang.H + 2 * my };
  }, [hang, box]);
  const geomRef = useRef(geom);
  geomRef.current = geom;
  const boxRef = useRef(box);
  boxRef.current = box;

  // ── the view: wall units to screen pixels, screen = wall · z + t ──
  const view = useRef({ tx: 0, ty: 0, z: 1 }).current;
  const anim = useRef(0);
  const settleTimer = useRef(0);
  const apply = useCallback(() => {
    const w = wallRef.current;
    // a flat (2D) transform: at rest the wall is painted with the page, no layer of its own;
    // while it moves, .moving gives it one (index.css)
    if (w) w.style.transform = `translate(${view.tx.toFixed(2)}px,${view.ty.toFixed(2)}px) scale(${view.z.toFixed(5)})`;
  }, [view]);
  const clampView = useCallback((v) => {
    const g = geomRef.current;
    const b = boxRef.current;
    if (!g || !b) return v;
    const z = Math.min(g.maxZ, Math.max(g.fitZ, v.z));
    const cl = (t, size, vs) => Math.min(0, Math.max(vs - size * z, t));
    return { z, tx: cl(v.tx, g.Ww, b.vw), ty: cl(v.ty, g.Wh, b.vh) };
  }, []);
  const fitView = useCallback(() => {
    const g = geomRef.current;
    const b = boxRef.current;
    const z = g.fitZ;
    return { z, tx: b.vw / 2 - (g.mx + hang.W / 2) * z, ty: b.top + (b.vh - b.top - b.bottom) / 2 - (g.my + hang.H / 2) * z };
  }, [hang]);

  // after a move: the browser redraws the wall sharp at its new size, and photos now shown
  // big enough get their bigger copies
  const sharpen = useCallback(() => {
    const g = geomRef.current;
    const b = boxRef.current;
    if (!g || !hang) return;
    const dpr = window.devicePixelRatio || 1;
    const up = {};
    for (const f of hang.frames) {
      const x = (f.x + g.mx) * view.z + view.tx;
      const y = (f.y + g.my) * view.z + view.ty;
      const w = f.w * view.z;
      const h = f.h * view.z;
      if (x > b.vw || y > b.vh || x + w < 0 || y + h < 0) continue;
      const px = Math.max(w, h) * dpr;
      const t = px > WALL_PX ? 2 : px > THUMB_PX ? 1 : 0;
      if (t) up[f.photo.id] = t;
    }
    setTiers((cur) => {
      let changed = false;
      const next = { ...cur };
      for (const [k, t] of Object.entries(up)) {
        if ((cur[k] || 0) < t) {
          next[k] = t;
          changed = true;
        }
      }
      return changed ? next : cur;
    });
  }, [hang, view]);
  const moving = useCallback(() => {
    stageRef.current?.classList.add('moving');
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      stageRef.current?.classList.remove('moving');
      sharpen();
    }, 160);
  }, [sharpen]);
  const setView = useCallback((v, clamp = true) => {
    Object.assign(view, clamp ? clampView(v) : v);
    apply();
    moving();
  }, [view, clampView, apply, moving]);

  const stop = useCallback(() => cancelAnimationFrame(anim.current), []);
  // glide to a view: zoom in even steps (log scale), the point at the middle of the screen
  // moving straight across the wall
  const glide = useCallback((to, { ms, ease }) => {
    stop();
    const b = boxRef.current;
    const from = { ...view };
    const cx = b.vw / 2;
    const cy = b.vh / 2;
    const a = { x: (cx - from.tx) / from.z, y: (cy - from.ty) / from.z };
    const c = { x: (cx - to.tx) / to.z, y: (cy - to.ty) / to.z };
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = ease(k);
      const z = Math.exp(Math.log(from.z) + (Math.log(to.z) - Math.log(from.z)) * e);
      const x = a.x + (c.x - a.x) * e;
      const y = a.y + (c.y - a.y) * e;
      setView({ z, tx: cx - x * z, ty: cy - y * z }, false);
      if (k < 1) anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);
  }, [view, setView, stop]);
  const zoomAt = useCallback((sx, sy, factor) => {
    const g = geomRef.current;
    const z = Math.min(g.maxZ, Math.max(g.fitZ, view.z * factor));
    const wx = (sx - view.tx) / view.z;
    const wy = (sy - view.ty) / view.z;
    setView({ z, tx: sx - wx * z, ty: sy - wy * z });
  }, [view, setView]);

  // ── up close on a photo (in the URL) ──
  const near = photos.find((p) => p.id === photoId) || null;
  const nearRef = useRef(near);
  nearRef.current = near;
  const order = useMemo(() => (hang ? hang.frames.map((f) => f.photo) : photos), [hang, photos]);
  const frameOf = useCallback((p) => hang?.frames.find((f) => f.photo === p), [hang]);
  const closeView = useCallback((p) => {
    const f = frameOf(p);
    const g = geomRef.current;
    const b = boxRef.current;
    if (!f || !g) return null;
    const top = b.phone ? 40 : 28;
    const bottom = b.phone ? 170 : 128; // the caption and the map under it
    const availW = b.vw - (b.phone ? 16 : 96);
    const availH = b.vh - top - bottom;
    const z = Math.min((0.97 * availW) / f.w, (0.97 * availH) / f.h);
    return { z, tx: b.vw / 2 - (f.x + g.mx + f.w / 2) * z, ty: top + availH / 2 - (f.y + g.my + f.h / 2) * z };
  }, [frameOf]);
  const backRef = useRef(null); // the view to go back to
  const prevNear = useRef(undefined);

  const open = useCallback((p) => navigate(`${base}/${p.id}`), [navigate, base]);
  const stepBack = useCallback(() => navigate(base), [navigate, base]);
  const step = useCallback((way) => {
    const n = order.length;
    const i = order.indexOf(nearRef.current);
    if (i >= 0) open(order[(i + way + n) % n]);
  }, [order, open]);

  // measure the screen, now and on every resize
  useLayoutEffect(() => {
    const m = () => stageRef.current && setBox(measureBox(stageRef.current));
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);

  // a new wall size (first time, or a resize): back to the whole wall, or to the photo you're on
  useLayoutEffect(() => {
    if (!geom) return;
    stop();
    const v = nearRef.current ? closeView(nearRef.current) : fitView();
    Object.assign(view, nearRef.current ? v : clampView(v));
    apply();
    sharpen();
  }, [geom, closeView, fitView, clampView, apply, view, stop, sharpen]);

  // walking up to a photo, between photos, and back
  useEffect(() => {
    if (!geom) return;
    const was = prevNear.current;
    prevNear.current = near;
    if (was === undefined) return; // first showing: the layout effect has put the view there
    if (near && near !== was) {
      if (!was) backRef.current = { ...view };
      glide(closeView(near), IN);
    } else if (!near && was) {
      glide(clampView(backRef.current || fitView()), OUT);
      backRef.current = null;
    }
  }, [near, geom, glide, closeView, clampView, fitView, view]);

  // the curtain lifts once the small copies are in and the wall has had a frame to draw
  useEffect(() => {
    if (!loaded || !geom || ready) return undefined;
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [loaded, geom, ready]);
  // how to get about, the first moment the wall is up
  useEffect(() => {
    if (!ready || near) return undefined;
    setHint(true);
    const t = setTimeout(() => setHint(false), 4200);
    return () => clearTimeout(t);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── drag, pinch, scroll, keys ──
  const movedRef = useRef(false); // the last press turned into a drag: it isn't a click
  useEffect(() => {
    const stage = stageRef.current;
    const ptrs = new Map();
    let g = null; // the gesture: where it started, from what view
    let vel = { x: 0, y: 0, t: 0 };
    const baseline = () => {
      const pts = [...ptrs.values()];
      const mid = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
      const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
      g = { mid, dist, v: { ...view }, start: g?.start || mid };
    };
    const glideOn = () => {
      // let a flick carry on and slow down
      let { x: vx, y: vy } = vel;
      if (Math.hypot(vx, vy) < 0.15 || performance.now() - vel.t > 80) return;
      let last = performance.now();
      const tick = (t) => {
        const dt = Math.min(32, t - last);
        last = t;
        setView({ ...view, tx: view.tx + vx * dt, ty: view.ty + vy * dt });
        const k = Math.exp(-dt / 280);
        vx *= k;
        vy *= k;
        if (Math.hypot(vx, vy) > 0.02) anim.current = requestAnimationFrame(tick);
      };
      anim.current = requestAnimationFrame(tick);
    };
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('.turn, .cui')) return;
      if (!ptrs.size) {
        movedRef.current = false;
        g = null;
      }
      stop();
      setHint(false);
      if (!ptrs.size) vel = { x: 0, y: 0, t: 0 };
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      baseline();
    };
    const move = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const prev = ptrs.get(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pts = [...ptrs.values()];
      const mid = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
      if (Math.hypot(mid.x - g.start.x, mid.y - g.start.y) > 7 || ptrs.size > 1) movedRef.current = true;
      if (nearRef.current || !movedRef.current) return; // up close, a swipe steps (on release)
      let z = g.v.z;
      if (ptrs.size > 1 && g.dist) {
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        z = Math.min(geomRef.current.maxZ, Math.max(geomRef.current.fitZ * 0.92, (g.v.z * d) / g.dist));
      }
      const wx = (g.mid.x - g.v.tx) / g.v.z;
      const wy = (g.mid.y - g.v.ty) / g.v.z;
      setView({ z, tx: mid.x - wx * z, ty: mid.y - wy * z }, ptrs.size === 1);
      if (ptrs.size === 1) {
        const now = performance.now();
        const dt = Math.max(1, now - vel.t);
        vel = { x: 0.6 * vel.x + 0.4 * ((e.clientX - prev.x) / dt), y: 0.6 * vel.y + 0.4 * ((e.clientY - prev.y) / dt), t: now };
      }
    };
    const up = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const end = { x: e.clientX, y: e.clientY };
      const pinching = ptrs.size > 1;
      ptrs.delete(e.pointerId);
      if (ptrs.size) {
        baseline();
        return;
      }
      if (nearRef.current) {
        const dx = end.x - g.start.x;
        const dy = end.y - g.start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
        return;
      }
      if (pinching || view.z < geomRef.current.fitZ) setView({ ...view }); // settles back inside the limits
      else if (movedRef.current) glideOn();
    };
    const wheel = (e) => {
      e.preventDefault();
      if (nearRef.current || !geomRef.current) return;
      stop();
      setHint(false);
      const r = stage.getBoundingClientRect();
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      const dx = e.deltaMode === 1 ? e.deltaX * 32 : e.deltaX;
      // a pinch on a trackpad (ctrl), or a mouse wheel's notches, zoom; two fingers on a trackpad pan
      const notch = e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 50 && e.deltaX === 0 && Number.isInteger(e.deltaY));
      if (e.ctrlKey || notch) zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022)));
      else setView({ ...view, tx: view.tx - dx, ty: view.ty - dy });
    };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', wheel, { passive: false });
    return () => {
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      stage.removeEventListener('wheel', wheel);
    };
  }, [view, setView, stop, zoomAt, step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('dialog') || !geomRef.current) return;
      const b = boxRef.current;
      if (nearRef.current) {
        if (e.key === 'Escape') stepBack();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
        else return;
      } else {
        const pan = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (pan) glide(clampView({ ...view, tx: view.tx + pan[0] * b.vw * 0.3, ty: view.ty + pan[1] * b.vh * 0.3 }), EASY);
        else if (e.key === '+' || e.key === '=' || e.key === '-') {
          const f = e.key === '-' ? 1 / 1.6 : 1.6;
          const z = view.z * f;
          const cx = b.vw / 2;
          const cy = b.vh / 2;
          glide(clampView({ z, tx: cx - ((cx - view.tx) / view.z) * z, ty: cy - ((cy - view.ty) / view.z) * z }), EASY);
        } else if (e.key === '0') glide(fitView(), EASY);
        else return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, glide, clampView, fitView, step, stepBack]);

  useEffect(() => () => {
    cancelAnimationFrame(anim.current);
    clearTimeout(settleTimer.current);
  }, []);

  // a click on a photo zooms in on it; up close, a click anywhere else steps back
  const onOpen = useCallback((p, e) => {
    if (movedRef.current && e.detail !== 0) return; // (detail 0: Enter on a focused frame)
    if (nearRef.current) stepBack();
    else open(p);
  }, [open, stepBack]);
  const onStageClick = (e) => {
    if (movedRef.current || !near || e.target.closest('.frame, .turn, .cui')) return;
    stepBack();
  };
  // a double click on the bare wall moves in on that spot
  const onDouble = (e) => {
    if (near || e.target.closest('.frame, .turn, .cui') || !geom) return;
    const r = stageRef.current.getBoundingClientRect();
    const sx = e.clientX - r.left;
    const sy = e.clientY - r.top;
    const z = view.z * 2.2;
    glide(clampView({ z, tx: sx - ((sx - view.tx) / view.z) * z, ty: sy - ((sy - view.ty) / view.z) * z }), EASY);
  };

  const stageClass = `stage collage t-${theme}${near ? ' near' : ''}${ready ? ' ready' : ''}`;
  return (
    <div ref={stageRef} className={stageClass} onClick={onStageClick} onDoubleClick={onDouble} role="region" aria-label={`${name}: every photo on one wall. Drag to look round, pinch or scroll to zoom, click a photo to see it up close.`}>
      {geom && (
        <div ref={wallRef} className="cwall" style={{ width: geom.Ww, height: geom.Wh }}>
          {hang.frames.map((f) => {
            const p = f.photo;
            const t = near === p ? 2 : tiers[p.id] || 0;
            return <CFrame key={p.id} f={f} ox={geom.mx} oy={geom.my} want={t === 2 ? p.file : t === 1 ? p.wall : p.thumb} lit={near === p} onOpen={onOpen} />;
          })}
          <div className="cdim" aria-hidden="true" />
        </div>
      )}
      {near && (
        <p key={near.id} className="ccap">
          <span className="caption-title">{titleLine(near)}</span>
          <span className="caption-meta">{metaLine(near)}</span>
        </p>
      )}
      <p className={hint ? 'chint on' : 'chint'} aria-hidden="true">
        {box?.phone ? 'Drag to look around · pinch to zoom' : 'Drag to look around · scroll to zoom'}
      </p>
      <Curtain key={id} kicker={id === 'all' ? `${photos.length} photographs` : 'Collage'} name={name} progress={progress} />
    </div>
  );
}

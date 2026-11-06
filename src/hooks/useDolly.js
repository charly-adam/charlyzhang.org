import { useCallback, useEffect, useRef } from 'react';
import { poseFacing, rotY, turnTo } from '../room/geometry.js';

const IN = { ms: 1700, ease: bezier(0.62, 0, 0.18, 1) };
const OUT = { ms: 1300, ease: bezier(0.5, 0, 0.2, 1) };
const FILL = 0.8; // how much of the view the target fills when you're up close
const FILL_PHONE = 0.95; // on a phone, where there's no wall label beside it, more
const MAX_ZOOM = 2.8; // but never closer than this (small things like the room's title)

// A CSS-style cubic-bezier timing function.
function bezier(x1, y1, x2, y2) {
  const at = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (at(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return at(y1, y2, t);
  };
}

/**
 * Walks the camera up to something on a wall (a real move forward in perspective) and back.
 * The move is a turn about the eye plus a slide in the camera's own frame, laid over the
 * walking camera, which is first stood at the target's stop; this layer makes up the
 * difference, so nothing jumps on screen and stepping back leaves you facing the target.
 *
 * `measure(targetId)` says what to walk up to and from where: { base: { t, pose }, face, box,
 * depth, eye } (the stop to set off from, or t = null in the doorway; the face it hangs on; its
 * box on that face; how far it stands off; eye level down the face).
 * Driven frame by frame, so it plays the same in every browser. Setting off from the wall, it
 * waits `leadIn(targetId)` ms first.
 */
export function useDolly({ stageRef, dollyRef, targetId, measure, leadIn, resetKey, getPose, jumpTo, getP }) {
  const s = useRef({ yaw: 0, x: 0, y: 0, z: 0, raf: 0 }).current;

  const render = useCallback(() => {
    const d = dollyRef.current;
    if (!d) return;
    const { yaw, x, y, z } = s;
    const P = getP();
    const slide = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px)`;
    if (Math.abs(yaw) > 0.0005) d.style.transform = `translate3d(0,0,${P}px) rotateY(${yaw.toFixed(3)}deg) ${slide} translate3d(0,0,${-P}px)`;
    else d.style.transform = x || y || z ? slide : '';
  }, [dollyRef, s, getP]);

  const animate = useCallback((to, { ms, ease }, delay = 0) => {
    cancelAnimationFrame(s.raf);
    const from = { yaw: s.yaw, x: s.x, y: s.y, z: s.z };
    const t0 = performance.now() + delay;
    stageRef.current?.classList.add('moving');
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      const e = ease(k);
      s.yaw = from.yaw + (to.yaw - from.yaw) * e;
      s.x = from.x + (to.x - from.x) * e;
      s.y = from.y + (to.y - from.y) * e;
      s.z = from.z + (to.z - from.z) * e;
      render();
      if (k < 1) {
        s.raf = requestAnimationFrame(tick);
      } else {
        s.raf = 0;
        stageRef.current?.classList.remove('moving'); // lets the browser redraw sharp at rest
      }
    };
    s.raf = requestAnimationFrame(tick);
  }, [render, stageRef, s]);

  // Re-express this layer's offset against a new base pose for the walking camera, so the
  // picture stays put when the walking camera is moved there.
  const rebase = useCallback((pose) => {
    const cur = getPose();
    const psi = turnTo(pose.yaw, cur.yaw);
    const u = rotY(-psi, [s.x, s.y, s.z]);
    const v = rotY(pose.yaw, [pose.x - cur.x, 0, pose.z - cur.z]);
    s.yaw += psi;
    s.x = u[0] + v[0];
    s.y = u[1];
    s.z = u[2] + v[2];
  }, [getPose, s]);

  // a new room starts with the camera back on its feet
  useEffect(() => {
    cancelAnimationFrame(s.raf);
    s.yaw = s.x = s.y = s.z = 0;
    render();
    stageRef.current?.classList.remove('moving');
    return () => cancelAnimationFrame(s.raf);
  }, [resetKey, render, stageRef, s]);

  useEffect(() => {
    if (!targetId) {
      if (s.yaw || s.x || s.y || s.z) animate({ yaw: 0, x: 0, y: 0, z: 0 }, OUT);
      return undefined;
    }
    const go = (instant) => {
      const m = measure(targetId);
      if (!m) return;
      const stage = stageRef.current;
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const P = getP();
      const atRest = !s.yaw && !s.x && !s.y && !s.z;
      // where the camera ends up: square on to the target, close enough for it to fill the view
      const fill = window.matchMedia('(max-width: 700px)').matches ? FILL_PHONE : FILL;
      const zoom = Math.min((fill * H) / m.box.h, (fill * W) / m.box.w, MAX_ZOOM);
      const end = poseFacing(m.face, m.box.x + m.box.w / 2, m.box.y + m.box.h / 2, m.depth + P / zoom, m.eye);
      const b = m.base.pose;
      rebase(b);
      if (m.base.t !== null && m.base.t !== undefined) jumpTo(m.base.t);
      // that end pose, as this layer's turn and slide from the base
      const u = rotY(b.yaw, [b.x - end.x, -end.y, b.z - end.z]);
      const to = { yaw: turnTo(b.yaw, end.yaw), x: u[0], y: u[1], z: u[2] };
      if (instant) {
        cancelAnimationFrame(s.raf);
        Object.assign(s, to, { raf: 0 });
      }
      render(); // the re-based offset, in the same frame as the jump
      if (!instant) animate(to, IN, atRest && leadIn ? leadIn(targetId) : 0);
    };
    // after the walking camera's own first-frame setup (deep links land here on load)
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => go(false));
    });
    const onResize = () => go(true);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResize);
    };
  }, [targetId, measure, leadIn, animate, render, rebase, jumpTo, stageRef, getP, s]);
}

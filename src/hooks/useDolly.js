import { useCallback, useEffect, useRef } from 'react';

const IN = { ms: 1700, ease: bezier(0.62, 0, 0.18, 1) };
const OUT = { ms: 1300, ease: bezier(0.5, 0, 0.2, 1) };
const FILL = 0.8; // how much of the view the target fills when you're up close
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

// An element's layout box in world coordinates (transforms ignored).
export function worldBox(el, world) {
  let x = 0;
  let y = 0;
  for (let n = el; n && n !== world; n = n.offsetParent) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// How far an element stands off the wall (frames do, a little).
const depth = (el) => {
  const m = getComputedStyle(el).transform;
  return m && m !== 'none' ? new DOMMatrixReadOnly(m).m43 : 0;
};

/**
 * Walks the camera up to something on the wall (a real move forward in perspective) and back.
 * `resolve(targetId)` returns the elements to frame: the first one decides the stop and depth.
 * Before each move the walking camera jumps to the target's stop while this layer makes up the
 * difference, so nothing jumps on screen and stepping back leaves you facing it.
 * Driven frame by frame, so it plays the same in every browser. Setting off from the wall, it
 * waits `leadIn(targetId)` ms first.
 */
export function useDolly({ stageRef, dollyRef, worldRef, targetId, resolve, leadIn, resetKey, getX, stopFor, jumpTo }) {
  const s = useRef({ x: 0, y: 0, z: 0, raf: 0 });

  const render = useCallback(() => {
    const { x, y, z } = s.current;
    const d = dollyRef.current;
    if (d) d.style.transform = x || y || z ? `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px)` : '';
  }, [dollyRef]);

  const animate = useCallback((to, { ms, ease }, delay = 0) => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    const from = { x: st.x, y: st.y, z: st.z };
    const t0 = performance.now() + delay;
    stageRef.current?.classList.add('moving');
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      const e = ease(k);
      st.x = from.x + (to.x - from.x) * e;
      st.y = from.y + (to.y - from.y) * e;
      st.z = from.z + (to.z - from.z) * e;
      render();
      if (k < 1) {
        st.raf = requestAnimationFrame(tick);
      } else {
        st.raf = 0;
        stageRef.current?.classList.remove('moving'); // lets the browser redraw sharp at rest
      }
    };
    st.raf = requestAnimationFrame(tick);
  }, [render, stageRef]);

  const target = useCallback((els) => {
    const stage = stageRef.current;
    const world = worldRef.current;
    const boxes = els.filter(Boolean).map((el) => worldBox(el, world));
    const x0 = Math.min(...boxes.map((b) => b.x));
    const x1 = Math.max(...boxes.map((b) => b.x + b.w));
    const y0 = Math.min(...boxes.map((b) => b.y));
    const y1 = Math.max(...boxes.map((b) => b.y + b.h));
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const P = parseFloat(getComputedStyle(stage).perspective) || H * 2;
    const stop = stopFor(els[0]);
    const zoom = Math.min((FILL * H) / (y1 - y0), (FILL * W) / (x1 - x0), MAX_ZOOM);
    return {
      stop,
      to: {
        x: W * 0.5 - ((x0 + x1) / 2 - stop),
        y: H * 0.44 - ((y0 + y1) / 2 + world.offsetTop),
        z: P - depth(els[0]) - P / zoom,
      },
    };
  }, [stageRef, worldRef, stopFor]);

  // a new room starts with the camera back at the wall
  useEffect(() => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    st.x = st.y = st.z = 0;
    render();
    stageRef.current?.classList.remove('moving');
    return () => cancelAnimationFrame(st.raf);
  }, [resetKey, render, stageRef]);

  useEffect(() => {
    const st = s.current;
    if (!targetId) {
      if (st.x || st.y || st.z) animate({ x: 0, y: 0, z: 0 }, OUT);
      return undefined;
    }
    const go = (instant) => {
      const els = resolve(targetId);
      if (!els[0]) return;
      const { stop, to } = target(els);
      const atWall = !st.x && !st.y && !st.z;
      st.x += stop - getX();
      jumpTo(stop);
      if (instant) {
        cancelAnimationFrame(st.raf);
        Object.assign(st, to, { raf: 0 });
      }
      render(); // the re-based position, in the same frame as the jump
      if (!instant) animate(to, IN, atWall && leadIn ? leadIn(targetId) : 0);
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
  }, [targetId, resolve, leadIn, target, animate, render, getX, jumpTo]);
}

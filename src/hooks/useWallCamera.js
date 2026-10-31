import { useCallback, useEffect, useRef } from 'react';

const FLAT = '(max-width: 700px)';

/**
 * Walks a camera along the wall: wheel / trackpad / drag / keys set a target,
 * the camera glides toward it with eased momentum, then settles on the nearest
 * stop ([data-stop] elements). A slight turn of the head follows the motion.
 * On phones (FLAT) it does nothing and the wall scrolls natively instead.
 */
export function useWallCamera({ stageRef, camRef, worldRef, resetKey, paused }) {
  const s = useRef({ x: 0, tx: 0, sway: 0, raf: 0, last: 0, settle: 0, drag: null, dragged: false });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const flat = () => window.matchMedia(FLAT).matches;

  const bounds = useCallback(() => {
    const vw = stageRef.current ? stageRef.current.clientWidth : window.innerWidth;
    const W = worldRef.current ? worldRef.current.offsetWidth : vw;
    const min = -0.12 * vw;
    return { vw, min, max: Math.max(min, W - 0.88 * vw) };
  }, [stageRef, worldRef]);

  const clamp = useCallback((v) => {
    const b = bounds();
    return Math.min(b.max, Math.max(b.min, v));
  }, [bounds]);

  const stops = useCallback(() => {
    const w = worldRef.current;
    if (!w) return [];
    const vw = bounds().vw;
    return [...w.querySelectorAll('[data-stop]')].map((el) => clamp(el.offsetLeft + el.offsetWidth / 2 - vw / 2));
  }, [worldRef, bounds, clamp]);

  const apply = useCallback(() => {
    const st = s.current;
    if (!worldRef.current || flat()) return;
    worldRef.current.style.transform = `translate3d(${(-st.x).toFixed(2)}px,0,0)`;
    if (camRef.current) camRef.current.style.transform = `rotateY(${st.sway.toFixed(3)}deg)`;
  }, [worldRef, camRef]);

  const run = useCallback(() => {
    const st = s.current;
    if (st.raf) return;
    st.last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.05, (t - st.last) / 1000);
      st.last = t;
      const before = st.x;
      st.x += (st.tx - st.x) * (1 - Math.exp(-dt * (st.drag ? 16 : 6.5)));
      const vel = (st.x - before) / Math.max(dt, 0.001);
      const targetSway = Math.max(-0.9, Math.min(0.9, -vel * 0.0007));
      st.sway += (targetSway - st.sway) * (1 - Math.exp(-dt * 5));
      apply();
      if (!st.drag && Math.abs(st.tx - st.x) < 0.25 && Math.abs(st.sway) < 0.005) {
        st.x = st.tx;
        st.sway = 0;
        apply();
        st.raf = 0;
        return;
      }
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }, [apply]);

  const goTo = useCallback((v) => {
    s.current.tx = clamp(v);
    run();
  }, [clamp, run]);

  const settle = useCallback(() => {
    const st = stops();
    if (!st.length) return;
    const cur = s.current.tx;
    let best = st[0];
    st.forEach((v) => { if (Math.abs(v - cur) < Math.abs(best - cur)) best = v; });
    goTo(best);
  }, [stops, goTo]);

  const step = useCallback((dir) => {
    const st = stops();
    if (!st.length) return;
    const cur = s.current.tx;
    const n = dir > 0 ? st.find((v) => v > cur + 4) : [...st].reverse().find((v) => v < cur - 4);
    goTo(n === undefined ? (dir > 0 ? st[st.length - 1] : st[0]) : n);
  }, [stops, goTo]);

  const scheduleSettle = useCallback((ms = 170) => {
    clearTimeout(s.current.settle);
    s.current.settle = setTimeout(settle, ms);
  }, [settle]);

  // reset to the start of the room
  useEffect(() => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    st.raf = 0;
    const id = requestAnimationFrame(() => {
      st.x = st.tx = bounds().min;
      st.sway = 0;
      apply();
    });
    return () => cancelAnimationFrame(id);
  }, [resetKey, bounds, apply]);

  // wheel, drag, keys, resize
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const st = s.current;

    const onWheel = (e) => {
      if (flat() || pausedRef.current) return;
      e.preventDefault();
      let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) d *= 32;
      else if (e.deltaMode === 2) d *= bounds().vw;
      st.tx = clamp(st.tx + d * 1.15);
      run();
      scheduleSettle();
    };

    const onDown = (e) => {
      if (flat() || pausedRef.current || e.button !== 0) return;
      st.drag = { x0: e.clientX, tx0: st.tx, lastX: e.clientX, lastT: performance.now(), v: 0, id: e.pointerId, moved: false };
      st.dragged = false;
    };
    const onMove = (e) => {
      const d = st.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x0;
      if (!d.moved && Math.abs(dx) > 6) {
        d.moved = true;
        st.dragged = true;
        stage.setPointerCapture?.(e.pointerId);
        clearTimeout(st.settle);
      }
      if (!d.moved) return;
      const now = performance.now();
      d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
      d.lastX = e.clientX;
      d.lastT = now;
      st.tx = clamp(d.tx0 - dx);
      run();
    };
    const onUp = (e) => {
      const d = st.drag;
      if (!d || e.pointerId !== d.id) return;
      st.drag = null;
      if (d.moved) {
        st.tx = clamp(st.tx - d.v * 320); // fling
        run();
        scheduleSettle(90);
      }
    };
    // swallow the click that ends a drag so it doesn't open a photo
    const onClickCapture = (e) => {
      if (st.dragged) {
        e.stopPropagation();
        e.preventDefault();
        st.dragged = false;
      }
    };

    const onKey = (e) => {
      if (flat() || pausedRef.current || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(bounds().min); }
      else if (e.key === 'End') { e.preventDefault(); goTo(bounds().max); }
    };

    // The browser scrolls the (overflow: hidden) stage to reveal a focused or clicked element
    // that's partly out of view; undo that, and walk there instead when it came from the keyboard.
    const onScroll = () => {
      if (flat()) return;
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    };
    const onFocus = (e) => {
      if (flat() || pausedRef.current || !e.target.matches(':focus-visible')) return;
      const col = e.target.closest('[data-stop]');
      if (col) goTo(col.offsetLeft + col.offsetWidth / 2 - bounds().vw / 2);
    };

    const onResize = () => {
      if (flat()) {
        if (worldRef.current) worldRef.current.style.transform = '';
        return;
      }
      st.tx = clamp(st.tx);
      st.x = clamp(st.x);
      apply();
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('click', onClickCapture, true);
    stage.addEventListener('scroll', onScroll);
    stage.addEventListener('focusin', onFocus);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('click', onClickCapture, true);
      stage.removeEventListener('scroll', onScroll);
      stage.removeEventListener('focusin', onFocus);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      clearTimeout(st.settle);
    };
  }, [stageRef, worldRef, bounds, clamp, run, step, goTo, apply, scheduleSettle]);

  // Camera position, and the stop (walking position) that faces a given element.
  const getX = useCallback(() => s.current.x, []);
  const stopFor = useCallback((el) => {
    const col = el.closest('[data-stop]');
    return clamp(col.offsetLeft + col.offsetWidth / 2 - bounds().vw / 2);
  }, [clamp, bounds]);

  // Move there instantly, with no glide and no head turn.
  const jumpTo = useCallback((v) => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    st.raf = 0;
    clearTimeout(st.settle);
    st.x = st.tx = clamp(v);
    st.sway = 0;
    apply();
  }, [clamp, apply]);

  return { stepPrev: () => step(-1), stepNext: () => step(1), getX, stopFor, jumpTo };
}

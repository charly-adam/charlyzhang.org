import { useCallback, useEffect, useRef } from 'react';
import { turnTo } from '../room/geometry.js';

const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const resting = (r) => r.stops.filter((st) => !st.pass);


/**
 * The camera. It starts in the doorway ('door'), flies to a corner when you go in ('fly'),
 * then walks the loop round the room ('rail'): wheel / trackpad / drag / keys set a
 * target distance along the loop, the camera walks toward it as a slow eased pan, turning at
 * the corners, then settles on a stop. `dir` is the way round you chose: scrolling
 * on walks you that way, while the arrows, keys and a drag stay true to left and right. A
 * slight turn of the head follows the motion.
 *
 * A rail is { keys: [{ t, x, z, yaw }], T, stops: [{ t, kind, pose, pass, ... }] }: keys are
 * the poses along the loop (the last repeats the first at t = T), stops where it settles. A
 * stop with `pass` is only walked through, never settled on (the corners of a room where every
 * photo has a stop of its own).
 */
export function useRailCamera({ stageRef, camRef, paused, onChoose, onPose }) {
  const s = useRef({
    mode: 'door',
    rail: null,
    P: 1000,
    pose: { x: 0, z: 0, yaw: 90 },
    x: 0,
    tx: 0,
    v: 0, // the walk's speed along the loop (px/s)
    dir: 1,
    sway: 0,
    heading: 0, // the way the last scroll or fling went
    raf: 0,
    last: 0,
    settle: 0,
    drag: null,
    dragged: false,
    fly: null,
  }).current;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const chooseRef = useRef(onChoose);
  chooseRef.current = onChoose;
  const poseRef = useRef(onPose);
  poseRef.current = onPose;

  const poseAt = useCallback((t) => {
    const r = s.rail;
    if (!r) return s.pose;
    const { keys, T } = r;
    const u = ((t % T) + T) % T;
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1].t <= u) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const k = b.t > a.t ? (u - a.t) / (b.t - a.t) : 0;
    return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, yaw: a.yaw + (b.yaw - a.yaw) * k };
  }, [s]);

  const apply = useCallback(() => {
    const cam = camRef.current;
    if (!cam) return;
    const { x, z, yaw } = s.pose;
    cam.style.transform = `translate3d(0,0,${s.P.toFixed(1)}px) rotateY(${(yaw + s.sway).toFixed(3)}deg) translate3d(${(-x).toFixed(2)}px,0,${(-z).toFixed(2)}px)`;
    poseRef.current?.(s.pose);
  }, [camRef, s]);

  const run = useCallback(() => {
    if (s.raf) return;
    s.last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.05, (t - s.last) / 1000);
      s.last = t;
      if (s.mode === 'fly') {
        const f = s.fly;
        const k = Math.min(1, Math.max(0, (t - f.t0) / f.ms));
        const e = easeInOut(k);
        // a bend: straight in through the door first, then round to the corner
        const q = (a, c, b) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * b;
        s.pose = { x: q(f.from.x, f.via.x, f.to.x), z: q(f.from.z, f.via.z, f.to.z), yaw: f.from.yaw + f.dyaw * e };
        s.sway = 0;
        apply();
        if (k < 1) {
          s.raf = requestAnimationFrame(tick);
          return;
        }
        s.fly = null;
        if (f.toT === null) {
          // flown out of the loop (leaving): stand where it ended
          s.mode = 'door';
          s.pose = { ...f.to };
        } else {
          s.mode = 'rail';
          s.x = s.tx = f.toT;
          s.v = 0;
          s.pose = poseAt(s.x);
        }
        apply();
        s.raf = 0;
        f.then?.();
        return;
      }
      if (s.mode !== 'rail') {
        s.raf = 0;
        return;
      }
      // The walk is a critically damped spring toward the target: it sets off gently and eases
      // to a stop, the same slow pan whether you scrolled, pressed an arrow or let it settle.
      // Under the hand (a drag) it's much stiffer, so the room keeps up with it.
      const w = s.drag ? 14 : 3;
      s.v += (-(s.x - s.tx) * w * w - 2 * w * s.v) * dt;
      s.x += s.v * dt;
      const targetSway = Math.max(-0.9, Math.min(0.9, -s.v * 0.0007));
      s.sway += (targetSway - s.sway) * (1 - Math.exp(-dt * 5));
      s.pose = poseAt(s.x);
      apply();
      if (!s.drag && Math.abs(s.tx - s.x) < 0.3 && Math.abs(s.v) < 3 && Math.abs(s.sway) < 0.005) {
        s.x = s.tx;
        s.v = 0;
        s.sway = 0;
        s.pose = poseAt(s.x);
        apply();
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  }, [s, apply, poseAt]);

  const goTo = useCallback((v) => {
    s.tx = v;
    run();
  }, [s, run]);

  // the stop nearest a distance along the loop (the loop wrapping): { stop, i, t, d }
  const nearest = useCallback((v) => {
    const r = s.rail;
    if (!r || !r.stops.length) return null;
    let best = null;
    r.stops.forEach((st, i) => {
      if (st.pass) return;
      for (let k = -1; k <= 1; k++) {
        const t = st.t + k * r.T;
        const d = Math.abs(t - v);
        if (!best || d < best.d) best = { stop: st, i, t, d };
      }
    });
    return best;
  }, [s]);

  // Settle on a stop: the one ahead, the way you were going, once a few wheel notches toward
  // it, else the one behind. (Plain nearest would snap a short scroll back where it came from.)
  const settle = useCallback(() => {
    const r = s.rail;
    if (!r || !r.stops.length) return;
    const cur = s.tx;
    const base = Math.floor(cur / r.T) * r.T;
    const ts = [];
    for (let k = -1; k <= 1; k++) resting(r).forEach((st) => ts.push(st.t + base + k * r.T));
    ts.sort((a, b) => a - b);
    let behind = ts[0];
    let ahead = ts[ts.length - 1];
    ts.forEach((t) => {
      if (t <= cur) behind = t;
    });
    [...ts].reverse().forEach((t) => {
      if (t >= cur) ahead = t;
    });
    if (ahead === behind) return goTo(ahead);
    const gap = ahead - behind;
    const went = s.heading;
    const enough = Math.min(0.18 * gap, 220);
    const on = went > 0 ? cur - behind > enough : went < 0 ? ahead - cur > enough : cur - behind > 0.5 * gap;
    goTo(on ? (went < 0 ? behind : ahead) : went < 0 ? ahead : behind);
  }, [s, goTo]);

  // the next stop round the loop (dir > 0) or back
  const step = useCallback((dir) => {
    const r = s.rail;
    if (!r || !r.stops.length) return;
    const cur = s.tx;
    const base = Math.floor(cur / r.T) * r.T;
    const cands = [];
    for (let k = -1; k <= 1; k++) resting(r).forEach((st) => cands.push(st.t + base + k * r.T));
    cands.sort((a, b) => a - b);
    const n = dir > 0 ? cands.find((t) => t > cur + 4) : [...cands].reverse().find((t) => t < cur - 4);
    if (n !== undefined) goTo(n);
  }, [s, goTo]);

  const scheduleSettle = useCallback((ms = 170) => {
    clearTimeout(s.settle);
    s.settle = setTimeout(settle, ms);
  }, [s, settle]);

  // wheel, drag, keys, resize
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      // in the doorway, scrolling on takes you in
      if (s.mode === 'door' && !pausedRef.current && e.deltaY > 4) chooseRef.current?.();
      if (pausedRef.current || s.mode !== 'rail') return;
      let dy = e.deltaY;
      let dx = e.deltaX;
      if (e.deltaMode === 1) {
        dy *= 32;
        dx *= 32;
      } else if (e.deltaMode === 2) {
        dy *= stage.clientHeight;
        dx *= stage.clientWidth;
      }
      // scrolling on walks you on the way you chose; a sideways swipe moves the way the hand does
      const d = (dy * s.dir + dx) * 1.15;
      s.tx += d;
      if (d) s.heading = Math.sign(d);
      run();
      scheduleSettle();
    };

    const onDown = (e) => {
      if (pausedRef.current || e.button !== 0 || s.mode === 'fly') return;
      s.drag = { x0: e.clientX, tx0: s.tx, lastX: e.clientX, lastT: performance.now(), v: 0, id: e.pointerId, moved: false };
      s.dragged = false;
    };
    const onMove = (e) => {
      const d = s.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x0;
      if (!d.moved && Math.abs(dx) > 6) {
        d.moved = true;
        s.dragged = true;
        stage.setPointerCapture?.(e.pointerId);
        clearTimeout(s.settle);
      }
      if (!d.moved || s.mode !== 'rail') return;
      const now = performance.now();
      d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
      d.lastX = e.clientX;
      d.lastT = now;
      s.tx = d.tx0 - dx;
      run();
    };
    const onUp = (e) => {
      const d = s.drag;
      if (!d || e.pointerId !== d.id) return;
      s.drag = null;
      if (!d.moved || s.mode !== 'rail') return;
      s.tx -= d.v * 320; // fling
      s.heading = Math.sign(s.tx - d.tx0);
      run();
      scheduleSettle(90);
    };
    // swallow the click that ends a drag so it doesn't open a photo
    const onClickCapture = (e) => {
      if (s.dragged) {
        e.stopPropagation();
        e.preventDefault();
        s.dragged = false;
      }
    };

    const onKey = (e) => {
      if (pausedRef.current || s.mode !== 'rail' || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('dialog')) return;
      // the arrow keys walk you left and right along the wall you face
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        step(-1);
      }
    };

    // The browser scrolls the (overflow: hidden) stage to reveal a clicked element that's partly
    // out of view; undo that.
    const onScroll = () => {
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('click', onClickCapture, true);
    stage.addEventListener('scroll', onScroll);
    window.addEventListener('keydown', onKey);
    return () => {
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('click', onClickCapture, true);
      stage.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      clearTimeout(s.settle);
    };
  }, [stageRef, s, run, step, scheduleSettle]);

  // ── what the room drives ──

  // A new (or re-measured) loop. On the rail, the camera keeps to the stop it was nearest.
  const setRail = useCallback((rail, stopIndex = -1) => {
    s.rail = rail;
    if (s.mode === 'rail' && rail) {
      if (stopIndex >= 0 && rail.stops[stopIndex]) {
        s.x = s.tx = rail.stops[stopIndex].t;
        s.v = 0;
      }
      s.pose = poseAt(s.x);
      apply();
    }
  }, [s, poseAt, apply]);

  // Where you stand in the doorway, and the perspective in px.
  const setDoor = useCallback((pose, P) => {
    s.P = P;
    if (s.mode === 'door') {
      s.pose = pose;
      s.sway = 0;
    }
    apply();
  }, [s, apply]);

  // Back to the doorway (a new room).
  const reset = useCallback((pose) => {
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    clearTimeout(s.settle);
    s.mode = 'door';
    s.fly = null;
    s.drag = null;
    s.dir = 1;
    s.x = s.tx = 0;
    s.v = 0;
    s.sway = 0;
    s.pose = pose;
    apply();
  }, [s, apply]);

  // Fly from wherever the camera is to a pose, bending through `via`: on to the loop at
  // distance `toT`, or (toT null) off it, to stand there.
  const flyTo = useCallback((to, toT, via, ms, then) => {
    s.mode = 'fly';
    const from = { ...s.pose };
    s.fly = { from, via, to, dyaw: turnTo(from.yaw, to.yaw), toT, t0: performance.now(), ms, then };
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    clearTimeout(s.settle);
    run();
  }, [s, run]);

  // Go in at the door, to the left (dir < 0) or the right: fly to that corner, then walk. If
  // the corner is only walked through, fly on to the first stop that way.
  const enter = useCallback((dir, via, ms, then) => {
    const r = s.rail;
    if (s.mode !== 'door' || !r) return false;
    const name = dir < 0 ? 'WN' : 'SW';
    let to = r.stops.find((st) => st.kind === 'corner' && st.name === name) || r.stops[0];
    if (!to) return false;
    if (to.pass) {
      const live = resting(r);
      const at = to.t;
      to = dir < 0 ? live.find((st) => st.t > at) || live[0] : [...live].reverse().find((st) => st.t < at) || live[live.length - 1];
    }
    s.dir = -dir; // left sets off clockwise, which is the way the loop is measured
    flyTo(to.pose, to.t, via, ms, then);
    return true;
  }, [s, flyTo]);

  // Stand at a distance along the loop at once, no glide, no head turn.
  const jumpTo = useCallback((t) => {
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    clearTimeout(s.settle);
    s.mode = 'rail';
    s.fly = null;
    s.x = s.tx = t;
    s.v = 0;
    s.sway = 0;
    s.pose = poseAt(t);
    apply();
  }, [s, poseAt, apply]);

  const getPose = useCallback(() => s.pose, [s]);
  const getT = useCallback(() => s.x, [s]);
  const getMode = useCallback(() => s.mode, [s]);
  const getDir = useCallback(() => s.dir, [s]);
  const nearestStop = useCallback(() => nearest(s.x), [nearest, s]);

  return { setRail, setDoor, reset, enter, jumpTo, getPose, getT, getMode, getDir, nearestStop, step };
}

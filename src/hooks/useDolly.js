import { useCallback, useEffect } from 'react';

const IN_MS = 1700;
const IN = `transform ${IN_MS}ms cubic-bezier(0.62, 0, 0.18, 1)`;
const OUT = 'transform 1.3s cubic-bezier(0.5, 0, 0.2, 1)';
const FILL_H = 0.8; // how much of the view the frame fills when you're up close
const FILL_W = 0.72;

const offset = (el) => {
  const m = getComputedStyle(el).transform;
  if (!m || m === 'none') return { x: 0, y: 0, z: 0 };
  const d = new DOMMatrixReadOnly(m);
  return { x: d.m41, y: d.m42, z: d.m43 };
};

const place = (el, t, transition) => {
  el.style.transition = transition;
  el.style.transform = t ? `translate3d(${t.x.toFixed(2)}px,${t.y.toFixed(2)}px,${t.z.toFixed(2)}px)` : '';
};

/**
 * Walks the camera up to one photo (a real move forward in perspective, not a scale), and back.
 * Before each move the walking camera jumps to that photo's stop while this layer makes up the
 * difference, so nothing jumps on screen and stepping back leaves you facing the photo.
 *
 * Browsers draw content magnified through perspective at its original resolution, so once the
 * camera arrives, `printRef` (a flat copy of the framed print) is laid exactly over the frame and
 * faded in to show the photo sharp.
 */
export function useDolly({ stageRef, dollyRef, worldRef, printRef, targetId, resetKey, getX, stopFor, jumpTo }) {
  const target = useCallback((frame) => {
    const stage = stageRef.current;
    let x = 0;
    let y = 0;
    for (let n = frame; n && n !== worldRef.current; n = n.offsetParent) {
      x += n.offsetLeft;
      y += n.offsetTop;
    }
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const P = parseFloat(getComputedStyle(stage).perspective) || H * 2;
    const stop = stopFor(frame);
    const s = Math.min((FILL_H * H) / frame.offsetHeight, (FILL_W * W) / frame.offsetWidth);
    const ft = offset(frame).z; // the frame stands off the wall a little
    return {
      stop,
      t: { x: W * 0.5 - (x + frame.offsetWidth / 2 - stop), y: H * 0.44 - (y + frame.offsetHeight / 2), z: P - ft - P / s },
    };
  }, [stageRef, worldRef, stopFor]);

  // Lay the flat copy exactly over where the frame landed on screen, and show it.
  const showPrint = useCallback((frame) => {
    const print = printRef.current;
    if (!print || !print.offsetWidth) return;
    const r = frame.getBoundingClientRect();
    const sr = stageRef.current.getBoundingClientRect();
    print.style.left = `${r.left - sr.left + r.width / 2}px`;
    print.style.top = `${r.top - sr.top + r.height / 2}px`;
    print.style.transform = `translate(-50%, -50%) scale(${(r.width / print.offsetWidth).toFixed(5)})`;
    print.classList.add('shown');
  }, [printRef, stageRef]);

  useEffect(() => {
    const dolly = dollyRef.current;
    if (dolly) place(dolly, null, 'none');
  }, [resetKey, dollyRef]);

  useEffect(() => {
    const dolly = dollyRef.current;
    if (!dolly) return undefined;
    if (!targetId) {
      if (dolly.style.transform) place(dolly, null, OUT);
      return undefined;
    }
    let arrived = 0;
    let frame = null;
    const onArrive = (e) => {
      if (e && (e.target !== dolly || e.propertyName !== 'transform')) return;
      clearTimeout(arrived);
      if (frame) showPrint(frame);
    };
    const go = () => {
      frame = worldRef.current?.querySelector(`[data-photo="${targetId}"]`);
      if (!frame) return;
      const { stop, t } = target(frame);
      const cur = offset(dolly);
      const x0 = getX();
      jumpTo(stop);
      place(dolly, { ...cur, x: cur.x + (stop - x0) }, 'none');
      void dolly.offsetWidth; // commit the re-based position before animating from it
      place(dolly, t, IN);
      dolly.addEventListener('transitionend', onArrive);
      arrived = setTimeout(onArrive, IN_MS + 200); // in case no transition ran
    };
    // after the walking camera's own first-frame setup (deep links land here on load)
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(go);
    });
    const onResize = () => {
      if (!frame) return;
      const { stop, t } = target(frame);
      jumpTo(stop);
      place(dolly, t, 'none');
      if (printRef.current?.classList.contains('shown')) showPrint(frame);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(arrived);
      dolly.removeEventListener('transitionend', onArrive);
      window.removeEventListener('resize', onResize);
    };
  }, [targetId, dollyRef, worldRef, printRef, target, showPrint, getX, jumpTo]);
}

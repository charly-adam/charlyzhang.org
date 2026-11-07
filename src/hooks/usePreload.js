import { useEffect, useState } from 'react';

const decoded = new Set(); // images already loaded and decoded, so coming back is instant
const MIN_MS = 1000; // the loading screen stays at least this long, so it never just flickers
const WAIT_MS = 12000; // past this, show the page anyway

// Loads and decodes a page's images before it's shown, so it doesn't come up with pictures
// missing and the browser drawing them in one by one. `key` names the set (a new key starts
// over; `minMs` overrides how long it stays up at least). Gives how far along it is, 0..1, and whether it's done (never sooner than minMs).
export function usePreload(key, srcs, minMs = MIN_MS) {
  const [state, setState] = useState({ key: null, loaded: 0, total: 0, waited: false });
  useEffect(() => {
    const todo = [...new Set(srcs.filter(Boolean))].filter((src) => !decoded.has(src));
    let live = true;
    let loaded = 0;
    setState({ key, loaded: 0, total: todo.length, waited: false });
    const one = () => {
      loaded += 1;
      if (live) setState((st) => ({ ...st, loaded }));
    };
    todo.forEach((src) => {
      const im = new Image();
      im.src = src;
      im.decode().then(() => decoded.add(src), () => {}).then(one);
    });
    const min = setTimeout(() => live && setState((st) => ({ ...st, waited: true })), MIN_MS);
    const give = setTimeout(() => live && setState((st) => ({ ...st, loaded: st.total })), WAIT_MS);
    return () => {
      live = false;
      clearTimeout(min);
      clearTimeout(give);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = state.key === key;
  return {
    done: current && state.waited && state.loaded >= state.total,
    progress: current && state.total ? state.loaded / state.total : current ? 1 : 0,
  };
}

import { useEffect, useState } from 'react';

const decoded = new Set(); // images already loaded and decoded, so coming back is instant
const WAIT_MS = 12000; // past this, show the page anyway

// Loads and decodes a page's images before it's shown, so it doesn't come up with pictures
// missing and the browser drawing them in one by one. `key` names the set (a new key starts
// over). Gives how far along it is, 0..1, and whether it's done.
export function usePreload(key, srcs) {
  const [state, setState] = useState({ key: null, loaded: 0, total: 0 });
  useEffect(() => {
    const todo = [...new Set(srcs.filter(Boolean))].filter((src) => !decoded.has(src));
    let live = true;
    let loaded = 0;
    setState({ key, loaded: 0, total: todo.length });
    const one = () => {
      loaded += 1;
      if (live) setState({ key, loaded, total: todo.length });
    };
    todo.forEach((src) => {
      const im = new Image();
      im.src = src;
      im.decode().then(() => decoded.add(src), () => {}).then(one);
    });
    const give = setTimeout(() => live && setState({ key, loaded: todo.length, total: todo.length }), WAIT_MS);
    return () => {
      live = false;
      clearTimeout(give);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = state.key === key;
  return {
    done: current && state.loaded >= state.total,
    progress: current && state.total ? state.loaded / state.total : current ? 1 : 0,
  };
}

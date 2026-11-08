// How you like to see a room: 'gallery' (walk round it) or 'collage' (every photo on one wall).
// Kept in the browser, so it carries from room to room and visit to visit. Until you pick one,
// it's collage on a phone (the same 700 px line as the CSS), where the walk-round shows one
// photo at a time, and gallery elsewhere. Storage can be missing or blocked (a private window);
// then it's that default, and the switch still works.
const KEY = 'charlyzhang.view';

const fallback = () => (window.matchMedia?.('(max-width: 700px)').matches ? 'collage' : 'gallery');

export function getViewMode() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'collage' || v === 'gallery' ? v : fallback();
  } catch {
    return fallback();
  }
}

export function setViewMode(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // not remembered; this visit still switches
  }
}

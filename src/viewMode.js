// How you like to see a room: 'gallery' (walk round it) or 'collage' (every photo on one wall).
// Kept in the browser, so it carries from room to room and visit to visit. Storage can be
// missing or blocked (a private window); then it's gallery, and the switch still works.
const KEY = 'charlyzhang.view';

export function getViewMode() {
  try {
    return localStorage.getItem(KEY) === 'collage' ? 'collage' : 'gallery';
  } catch {
    return 'gallery';
  }
}

export function setViewMode(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // not remembered; this visit still switches
  }
}

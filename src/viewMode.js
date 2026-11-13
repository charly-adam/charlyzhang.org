// How you like to see a room: 'gallery' (walk round it) or 'collage' (every photo on one wall).
// Each visit starts from the device's own: collage on a phone (the same 700 px line as the
// CSS), where the walk-round shows one photo at a time, and gallery elsewhere. Switching with
// the Gallery|Collage pill is remembered for the rest of the visit (sessionStorage), so it
// carries from room to room, but not to the next visit: a choice kept for good had a desktop
// opening in collage long after a single switch. Storage can be missing or blocked (a private
// window); then it's the default, and the switch still works page by page.
const KEY = 'charlyzhang.view';

const fallback = () => (window.matchMedia?.('(max-width: 700px)').matches ? 'collage' : 'gallery');

// (the old, kept-for-good choice is cleared, so it can't stick on browsers that saved one)
try {
  localStorage.removeItem(KEY);
} catch {
  // nothing to clear
}

export function getViewMode() {
  try {
    const v = sessionStorage.getItem(KEY);
    return v === 'collage' || v === 'gallery' ? v : fallback();
  } catch {
    return fallback();
  }
}

export function setViewMode(mode) {
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    // not remembered; this page still switches
  }
}

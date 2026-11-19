// How you like to see a room: 'gallery' (walk round it) or 'collage' (every photo on one wall).
// Each visit starts from the device's own: collage on a phone (the same 700 px line as the
// CSS), where the walk-round shows one photo at a time, and gallery elsewhere. That's decided
// once, at the visit's first room, so turning a phone on its side (wider than 700 px) doesn't
// flip it. Switching with the Gallery|Collage pill is remembered for the rest of the visit
// (sessionStorage), so it carries from room to room, but not to the next visit: a choice kept
// for good had a desktop opening in collage long after a single switch. Storage can be missing
// or blocked (a private window); then the choice is kept in memory, until a reload.
const KEY = 'charlyzhang.view';
const valid = (v) => v === 'collage' || v === 'gallery';

// (the old, kept-for-good choice is cleared, so it can't stick on browsers that saved one.
// Don't reuse this key in localStorage.)
try {
  localStorage.removeItem(KEY);
} catch {
  // nothing to clear
}

let mode = null; // this visit's, once known
try {
  const v = sessionStorage.getItem(KEY);
  if (valid(v)) mode = v;
} catch {
  // not stored: decided at the first room
}

export function getViewMode() {
  if (!mode) setViewMode(window.matchMedia?.('(max-width: 700px)').matches ? 'collage' : 'gallery');
  return mode;
}

export function setViewMode(m) {
  mode = m;
  try {
    sessionStorage.setItem(KEY, m);
  } catch {
    // kept in memory only
  }
}

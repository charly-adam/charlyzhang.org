// ─────────────────────────────────────────────────────────────────────────────
// ALL GALLERY CONTENT LIVES IN THIS FILE.
//
// Add a photo:
//   1. Put the full-size original in photos-originals/<room-slug>/ (gitignored) and run
//      `npm run photos`. That writes the web copies to public/photos/<room-slug>/ and records
//      their pixel sizes, so no width/height is needed here.
//   2. Add an entry to `photos` below.
//   3. `pair: true` hangs a photo right next to the one before it, sharing one wall label.
//
// Photos hang in order round the room: along the left-hand wall from the door, across the far
// wall, back along the right-hand wall, and the last two either side of the door. The far wall
// takes 3 when the count is odd and 2 when it's even, so the long walls always match; the room
// grows with them.
//
// Add a room: add an entry to `rooms` (slug, name, theme, blurb) and a folder in photos-originals.
// Themes: 'white' (bright, even light), 'spot' (spotlit, wood frames),
//         'teal' and 'violet' (colored walls, gold frames).
// ─────────────────────────────────────────────────────────────────────────────

import sizes from './photo-sizes.json';

export const site = {
  name: 'Charly Zhang',
  subtitle: 'Photography',
};

export const rooms = [
  {
    slug: 'benches',
    name: 'Benches',
    theme: 'spot',
    icon: 'bench',
    blurb: 'Empty seats, facing the view.',
    intro: '', // optional longer paragraph, printed on the wall under the blurb
  },
];

export const photos = [
  // Benches: Charly's photos. Titles describe the picture; year, place and notes are still to fill in.
  { room: 'benches', file: '/photos/benches/01.jpg', title: 'Green bench, snow on the lake', year: '', place: '', camera: 'Medium format film', note: '' },
  { room: 'benches', file: '/photos/benches/02.jpg', title: 'Weathered bench, wetland', year: '', place: '', camera: '35 mm film', note: '' },
  { room: 'benches', file: '/photos/benches/03.jpg', title: 'Bench in the woods', year: '', place: '', camera: '35 mm black-and-white film', note: '' },
  { room: 'benches', file: '/photos/benches/04.jpg', title: 'First snow', year: '', place: '', camera: '35 mm film', note: '' },
  { room: 'benches', file: '/photos/benches/05.jpg', title: 'Bench, dry grass', year: '', place: '', camera: 'Medium format film', note: '' },
  { room: 'benches', file: '/photos/benches/06.jpg', title: 'Bench on the hill', year: '', place: '', camera: 'Medium format film', note: '' },
  { room: 'benches', file: '/photos/benches/07.jpg', title: 'Bench above the marsh', year: '', place: '', camera: 'Medium format film', note: '' },
  { room: 'benches', file: '/photos/benches/08.jpg', title: 'Bench facing the shore', year: '', place: '', camera: '35 mm black-and-white film', note: '' },
  { room: 'benches', file: '/photos/benches/09.jpg', title: 'Log bench, turquoise lake', year: '', place: '', camera: 'Medium format film', note: '' },
  { room: 'benches', file: '/photos/benches/10.jpg', title: 'Bench in tall grass', year: '', place: '', camera: '35 mm film', note: '' },
  { room: 'benches', file: '/photos/benches/11.jpg', title: 'Bench above the bay', year: '', place: '', camera: '35 mm film', note: '' },

];

// ── derived helpers (no need to edit below) ─────────────────────────────────

// Arrow direction on the lobby sign for each room, in order.
const ARROWS = [-90, -135, -45, 180, 0, 90];

// floor / ceil: the texture tiled over it (size in S, the room scale) and the colour it
// shows until that loads.
export const themes = {
  white: { wall: '#efefec', boxBg: '#141414', boxFg: '#f4f3f0', floor: { img: '/textures/floor-stone.jpg', size: 0.77, color: '#b4b4b1' }, ceil: { img: null, size: 1, color: '#e4e4e1' } },
  spot: { wall: '#acaca9', boxBg: '#141414', boxFg: '#f4f3f0', floor: { img: '/textures/floor-concrete.jpg', size: 1.05, color: '#4f4f4f' }, ceil: { img: '/textures/ceiling-tile.jpg', size: 0.27, color: '#dadad7' } },
  teal: { wall: '#173e49', boxBg: '#eceae3', boxFg: '#173f4a', floor: { img: '/textures/floor-oak.jpg', size: 0.49, color: '#6b4e32' }, ceil: { img: null, size: 1, color: '#262828' } },
  violet: { wall: '#24234c', boxBg: '#ecebf2', boxFg: '#24234a', floor: { img: '/textures/floor-walnut.jpg', size: 0.45, color: '#4a3326' }, ceil: { img: null, size: 1, color: '#1c1b25' } },
};

export const roomList = rooms.map((r, i) => {
  const list = photos
    .filter((p) => p.room === r.slug)
    .map((p, k) => {
      const sz = sizes[p.file] || {};
      const width = p.width || sz.width || 1500;
      const height = p.height || sz.height || 1000;
      // `wall` is the lighter copy hung on the wall; `file` is the full-size one shown up close
      return { ...p, width, height, wall: sz.wall || p.file, id: `${r.slug}-${k + 1}`, index: k, portrait: height > width };
    });
  const groups = [];
  list.forEach((p) => {
    if (p.pair && groups.length) groups[groups.length - 1].push(p);
    else groups.push([p]);
  });
  return { ...r, num: i + 1, arrow: ARROWS[i % ARROWS.length], photos: list, groups };
});

export const getRoom = (slug) => roomList.find((r) => r.slug === slug);
// The room the doorway at the end leads to; after the last room it leads back to the lobby.
export const nextRoom = (room) => roomList[room.num] || null;

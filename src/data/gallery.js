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
// Add a room: add an entry to `rooms` (slug, name, theme, blurb) and a folder in photos-originals.
// Themes: 'white' (bright, even light), 'spot' (spotlit, wood frames),
//         'teal' and 'violet' (colored walls, gold frames).
// ─────────────────────────────────────────────────────────────────────────────

import sizes from './photo-sizes.json';

export const site = {
  name: 'Charly Zhang',
  subtitle: 'Photography',
};

// Every room uses the 'spot' look for now.
export const rooms = [
  {
    slug: 'benches',
    name: 'Benches',
    theme: 'spot',
    icon: 'bench',
    blurb: 'Empty seats, facing the view.',
    intro: '',
  },
  {
    slug: 'landscapes',
    name: 'Landscapes',
    theme: 'spot',
    icon: 'landscape',
    blurb: 'Open country, water and weather.',
    intro: '', // optional longer paragraph shown on the wall panel and in its close-up
  },
  {
    slug: 'city',
    name: 'City',
    theme: 'spot',
    icon: 'city',
    blurb: 'Streets, rooftops and night light.',
    intro: '',
  },
  {
    slug: 'people',
    name: 'People',
    theme: 'spot',
    icon: 'person',
    blurb: 'Portraits and candid moments.',
    intro: '',
  },
  {
    slug: 'details',
    name: 'Details',
    theme: 'spot',
    icon: 'detail',
    blurb: 'Texture, pattern and close-up.',
    intro: '',
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

  // Placeholder photos and text below: replace with Charly's own.
  // Landscapes
  { room: 'landscapes', file: '/photos/landscapes/01.jpg', width: 1500, height: 1000, title: 'Dusk over the ridge', year: '2025', place: 'Lakeshore', camera: '35 mm, f/2.8', note: 'Shot just after the sun dropped behind the hills.' },
  { room: 'landscapes', file: '/photos/landscapes/02.jpg', width: 900, height: 1350, title: 'Still water', year: '2025', place: 'Lakeshore', camera: '50 mm, f/1.8', note: 'Waited an hour for the water to go still.' },
  { room: 'landscapes', file: '/photos/landscapes/03.jpg', width: 1500, height: 1000, title: 'First light', year: '2025', place: 'Lakeshore', camera: '24 mm, f/4', note: 'The only clear minute of the morning.', pair: true },
  { room: 'landscapes', file: '/photos/landscapes/04.jpg', width: 1500, height: 1000, title: 'Haze', year: '2025', place: 'Lakeshore', camera: '85 mm, f/2', note: 'Layers of hills fading into the mist.' },
  { room: 'landscapes', file: '/photos/landscapes/05.jpg', width: 900, height: 1350, title: 'Quiet shoreline', year: '2026', place: 'Lakeshore', camera: '35 mm, f/1.8', note: 'Nobody else on the beach.' },
  { room: 'landscapes', file: '/photos/landscapes/06.jpg', width: 1500, height: 1000, title: 'Far ridges', year: '2026', place: 'Lakeshore', camera: '70 mm, f/5.6', note: 'The last ridge before the weather came in.', pair: true },

  // City
  { room: 'city', file: '/photos/city/01.jpg', width: 1500, height: 1000, title: 'Skyline at night', year: '2025', place: 'Downtown', camera: '35 mm, f/2.8', note: 'Long exposure from the bridge.' },
  { room: 'city', file: '/photos/city/02.jpg', width: 900, height: 1350, title: 'Towers in fog', year: '2025', place: 'Downtown', camera: '50 mm, f/1.8', note: 'The tops disappeared into the cloud.' },
  { room: 'city', file: '/photos/city/03.jpg', width: 1500, height: 1000, title: 'Last train', year: '2025', place: 'Downtown', camera: '24 mm, f/4', note: 'The platform emptied right after.' },
  { room: 'city', file: '/photos/city/04.jpg', width: 1500, height: 1000, title: 'Wet pavement', year: '2025', place: 'Downtown', camera: '85 mm, f/2', note: 'Headlights doubled in the puddles.' },
  { room: 'city', file: '/photos/city/05.jpg', width: 900, height: 1350, title: 'Morning fog', year: '2026', place: 'Downtown', camera: '35 mm, f/1.8', note: 'Fog burned off ten minutes later.' },
  { room: 'city', file: '/photos/city/06.jpg', width: 1500, height: 1000, title: 'Late traffic', year: '2026', place: 'Downtown', camera: '70 mm, f/5.6', note: 'Out of focus on purpose.' },

  // People
  { room: 'people', file: '/photos/people/01.jpg', width: 1500, height: 1000, title: 'Window seat', year: '2025', place: 'Studio', camera: '35 mm, f/2.8', note: 'Soft light from the left window.' },
  { room: 'people', file: '/photos/people/02.jpg', width: 900, height: 1350, title: 'Backlit', year: '2025', place: 'Studio', camera: '50 mm, f/1.8', note: 'Exposed for the window, not the face.' },
  { room: 'people', file: '/photos/people/03.jpg', width: 1500, height: 1000, title: 'Between sets', year: '2025', place: 'Studio', camera: '24 mm, f/4', note: 'Backstage, before the second set.' },
  { room: 'people', file: '/photos/people/04.jpg', width: 1500, height: 1000, title: 'Waiting', year: '2025', place: 'Studio', camera: '85 mm, f/2', note: 'A long pause before the door opened.' },
  { room: 'people', file: '/photos/people/05.jpg', width: 900, height: 1350, title: 'Portrait in profile', year: '2026', place: 'Studio', camera: '35 mm, f/1.8', note: 'Single lamp, plain wall.' },
  { room: 'people', file: '/photos/people/06.jpg', width: 1500, height: 1000, title: 'Afternoon', year: '2026', place: 'Studio', camera: '70 mm, f/5.6', note: 'Nothing staged.' },

  // Details
  { room: 'details', file: '/photos/details/01.jpg', width: 1500, height: 1000, title: 'Rust and paint', year: '2025', place: 'Home', camera: '35 mm, f/2.8', note: 'Peeling layers on an old door.' },
  { room: 'details', file: '/photos/details/02.jpg', width: 900, height: 1350, title: 'Fabric', year: '2025', place: 'Home', camera: '50 mm, f/1.8', note: 'Folds in the afternoon light.' },
  { room: 'details', file: '/photos/details/03.jpg', width: 1500, height: 1000, title: 'Frost', year: '2025', place: 'Home', camera: '24 mm, f/4', note: 'Ice crystals on a window.' },
  { room: 'details', file: '/photos/details/04.jpg', width: 1500, height: 1000, title: 'Glass', year: '2025', place: 'Home', camera: '85 mm, f/2', note: 'Refraction through a bottle.' },
  { room: 'details', file: '/photos/details/05.jpg', width: 900, height: 1350, title: 'Tile', year: '2026', place: 'Home', camera: '35 mm, f/1.8', note: 'Tiles repeating down the hall.' },
  { room: 'details', file: '/photos/details/06.jpg', width: 1500, height: 1000, title: 'Bark', year: '2026', place: 'Home', camera: '70 mm, f/5.6', note: 'Close on the north side of the trunk.' },
];

// ── derived helpers (no need to edit below) ─────────────────────────────────

// Arrow direction on the lobby sign, matching the floor-plan layout (from the entrance).
const ARROWS = [-135, -45, 180, 0, -90, 90];

export const themes = {
  white: { wall: '#efefec', boxBg: '#141414', boxFg: '#f4f3f0' },
  spot: { wall: '#acaca9', boxBg: '#141414', boxFg: '#f4f3f0' },
  teal: { wall: '#173e49', boxBg: '#eceae3', boxFg: '#173f4a' },
  violet: { wall: '#24234c', boxBg: '#ecebf2', boxFg: '#24234a' },
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
export const nextRoom = (room) => roomList[room.num % roomList.length];

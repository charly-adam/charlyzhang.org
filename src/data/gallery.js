// ─────────────────────────────────────────────────────────────────────────────
// ALL GALLERY CONTENT LIVES IN THIS FILE.
//
// Add a photo:
//   1. Put the full-size original in photos-originals/<room-slug>/ (gitignored), named 01.jpg,
//      02.jpg… in hanging order, and run
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
// Add a room: add an entry to `rooms` (slug, name, theme, icon, blurb) and a folder in
// photos-originals. The icon is a pictogram from components/Icons.jsx. The lobby's wall, the
// map and the dock all follow this list.
// Themes: 'white' (bright, even light), 'spot' (spotlit, wood frames),
//         'teal' and 'violet' (colored walls, gold frames),
//         'salon' (claret damask walls, ornate gilt frames).
// `solo: true` gives every photo a wall of its own: it hangs on a bay standing out from the
// wall, bigger, with a stop of its own, and none is seen from a corner. For a few photos.
// ─────────────────────────────────────────────────────────────────────────────

import sizes from './photo-sizes.json';

export const site = {
  name: 'Charly Zhang',
  subtitle: 'Photography',
};

export const rooms = [
  { slug: 'favorites', name: 'Favorites', theme: 'salon', solo: true, icon: 'star', blurb: "A few of Charly's own favorites.", intro: '' },
  { slug: 'nature', name: 'Nature', theme: 'teal', icon: 'landscape', blurb: 'Parks, peaks and night skies.', intro: '' },
  { slug: 'birds', name: 'Birds', theme: 'white', icon: 'bird', blurb: 'Wetlands and refuges around the Bay and the Valley.', intro: '' },
  { slug: 'travel', name: 'Travel', theme: 'violet', icon: 'globe', blurb: 'Streets and cities abroad.', intro: '' },
  { slug: 'benches', name: 'Benches', theme: 'spot', icon: 'bench', blurb: 'Empty seats, facing the view.', intro: '' },
  { slug: 'cars', name: 'Cars', theme: 'spot', icon: 'car', blurb: 'Race days and student race teams.', intro: '' },
  { slug: 'film', name: 'Film', theme: 'violet', icon: 'film', blurb: 'Shot on film.', intro: '' },
];

// Titles describe each picture; place, year, camera and film come from Charly's own file names
// (photos-originals/_sources.json maps each numbered file back to its original). Check them with him.
const P67 = 'Pentax 67';
export const photos = [
  // Favorites
  { room: 'favorites', file: '/photos/favorites/01.jpg', title: 'Arch at dusk', year: '', place: 'Arches National Park', camera: 'Nikon D750', note: '' },
  { room: 'favorites', file: '/photos/favorites/02.jpg', title: 'Arch under the Milky Way', year: '', place: 'Arches National Park', camera: 'Nikon D750', note: '' },
  { room: 'favorites', file: '/photos/favorites/03.jpg', title: 'Moon rose', year: '', place: '', camera: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/04.jpg', title: 'Still lake at sunset', year: '', place: 'Sequoia & Kings Canyon', camera: 'Nikon D750', note: '' },
  { room: 'favorites', file: '/photos/favorites/05.jpg', title: 'Turret Arch with a rainbow', year: '', place: 'Arches National Park', camera: 'Nikon D750', note: '' },
  { room: 'favorites', file: '/photos/favorites/06.jpg', title: 'Valley, reflected', year: '', place: 'Yosemite', camera: 'Nikon D750', note: '' },

  // Nature
  { room: 'nature', file: '/photos/nature/01.jpg', title: 'Golden hour on the hills', year: '', place: '', camera: 'Film', note: '' },
  { room: 'nature', file: '/photos/nature/02.jpg', title: 'Afternoon on the lawn', year: '', place: '', camera: 'Film', note: '' },
  { room: 'nature', file: '/photos/nature/03.jpg', title: 'Frozen lake below the peaks', year: '2024', place: 'Banff', camera: 'Film', note: '' },
  { room: 'nature', file: '/photos/nature/04.jpg', title: 'Dunes', year: '2024', place: 'Death Valley', camera: 'Nikon D850', note: '' },
  { room: 'nature', file: '/photos/nature/05.jpg', title: 'Half Dome, last light', year: '2024', place: 'Yosemite', camera: 'Film', note: '' },
  { room: 'nature', file: '/photos/nature/06.jpg', title: 'Steam vents', year: '2025', place: 'Lassen', camera: 'Nikon D850', note: '' },
  { room: 'nature', file: '/photos/nature/07.jpg', title: 'Boardwalk through the steam', year: '2025', place: 'Lassen', camera: `${P67} · Portra 400`, note: '' },
  { room: 'nature', file: '/photos/nature/08.jpg', title: 'Mountain goat', year: '', place: 'Alaska', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/09.jpg', title: 'Fireweed', year: '', place: 'Alaska', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/10.jpg', title: 'Climbers on the glacier', year: '', place: 'Alaska', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/11.jpg', title: 'Through the arch', year: '', place: 'Arches National Park', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/12.jpg', title: 'Headlamp under the Milky Way', year: '', place: 'Badlands', camera: '', note: '' },
  { room: 'nature', file: '/photos/nature/13.jpg', title: 'Island in the lake', year: '', place: 'Sequoia & Kings Canyon', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/14.jpg', title: 'Ridgeline at dusk', year: '', place: 'Sequoia & Kings Canyon', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/15.jpg', title: 'Night over the canyon', year: '', place: 'Sequoia & Kings Canyon', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/16.jpg', title: 'Last light on the ridge', year: '', place: 'Sequoia & Kings Canyon', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/17.jpg', title: 'Lit arch at night', year: '', place: 'The Windows, Arches', camera: '', note: '' },
  { room: 'nature', file: '/photos/nature/18.jpg', title: 'Rainbow in the falls', year: '', place: 'Yosemite', camera: 'Nikon D750', note: '' },
  { room: 'nature', file: '/photos/nature/19.jpg', title: 'Canyon from above', year: '', place: 'Zion', camera: 'Nikon D750', note: '' },

  // Birds
  { room: 'birds', file: '/photos/birds/01.jpg', title: 'Bald eagle on a post', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/02.jpg', title: 'Heron taking off', year: '2025', place: 'Baylands', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/03.jpg', title: 'Egret in the reeds', year: '', place: 'Baylands', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/04.jpg', title: 'Birds on the pylon', year: '', place: 'Baylands', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/05.jpg', title: 'Sandpiper on a rock', year: '', place: 'Don Edwards Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/06.jpg', title: 'Heron, wading', year: '', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/07.jpg', title: 'Fog over the marsh', year: '', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/08.jpg', title: 'Small bird on a stem', year: '', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/09.jpg', title: 'Bald eagle on a branch', year: '', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/10.jpg', title: 'Bluebird', year: '', place: '', camera: 'Nikon D850', note: '' },
  { room: 'birds', file: '/photos/birds/11.jpg', title: 'Hummingbird against the sky', year: '', place: '', camera: 'Nikon D850', note: '' },

  // Travel
  { room: 'travel', file: '/photos/travel/01.jpg', title: 'Festival night', year: '2023', place: 'Japan', camera: 'Film', note: '' },
  { room: 'travel', file: '/photos/travel/02.jpg', title: 'Castle in autumn', year: '2023', place: 'Japan', camera: 'Film', note: '' },
  { room: 'travel', file: '/photos/travel/03.jpg', title: 'Café window', year: '2024', place: 'Korea', camera: 'HP5', note: '' },
  { room: 'travel', file: '/photos/travel/04.jpg', title: 'Sidewalk above the traffic', year: '2024', place: 'Korea', camera: 'CineStill 400D', note: '' },
  { room: 'travel', file: '/photos/travel/05.jpg', title: 'Fountain under the canopy', year: '2025', place: 'Mexico', camera: 'Nikon L35AF · ColorPlus 200', note: '' },
  { room: 'travel', file: '/photos/travel/06.jpg', title: 'On the trail below the mountain', year: '2025', place: 'Washington', camera: 'ColorPlus 200', note: '' },
  { room: 'travel', file: '/photos/travel/07.jpg', title: 'Waterfront pier', year: '2025', place: 'Seattle', camera: 'T-Max', note: '' },
  { room: 'travel', file: '/photos/travel/08.jpg', title: 'Neon after rain', year: '2026', place: 'China', camera: 'CineStill 800T', note: '' },
  { room: 'travel', file: '/photos/travel/09.jpg', title: 'Towers over the river', year: '2026', place: 'China', camera: 'T-Max 400', note: '' },
  { room: 'travel', file: '/photos/travel/10.jpg', title: 'Lit terraces at night', year: '2026', place: 'China', camera: 'T-Max 400', note: '' },
  { room: 'travel', file: '/photos/travel/11.jpg', title: 'Light into the hall', year: '2026', place: '', camera: 'T-Max 400', note: '' },

  // Benches (Charly's own set)
  { room: 'benches', file: '/photos/benches/01.jpg', title: 'Bench over the bay', year: '2023', place: '', camera: 'Film', note: '' },
  { room: 'benches', file: '/photos/benches/02.jpg', title: 'Bench in the dry grass', year: '2023', place: '', camera: 'Film', note: '' },
  { room: 'benches', file: '/photos/benches/03.jpg', title: 'Log bench, turquoise lake', year: '2024', place: 'Banff', camera: 'Film', note: '' },
  { room: 'benches', file: '/photos/benches/04.jpg', title: 'Bench above the marsh', year: '2024', place: '', camera: 'Nikon F3 · Tri-X', note: '' },
  { room: 'benches', file: '/photos/benches/05.jpg', title: 'Bench under a blue sky', year: '2024', place: '', camera: `${P67} · Portra 400`, note: '' },
  { room: 'benches', file: '/photos/benches/06.jpg', title: 'Bench on the hilltop', year: '2024', place: '', camera: `${P67} · Portra 400`, note: '' },
  { room: 'benches', file: '/photos/benches/07.jpg', title: 'Bench facing the marsh', year: '2024', place: '', camera: `${P67} · Portra 400`, note: '' },
  { room: 'benches', file: '/photos/benches/08.jpg', title: 'First snow', year: '2024', place: '', camera: 'Nikon F100 · Fujicolor C200', note: '' },
  { room: 'benches', file: '/photos/benches/09.jpg', title: 'Bench in the woods', year: '2024', place: 'Korea', camera: 'HP5', note: '' },
  { room: 'benches', file: '/photos/benches/10.jpg', title: 'Bench in the wetland', year: '2024', place: '', camera: 'Nikon F100 · ColorPlus 200', note: '' },
  { room: 'benches', file: '/photos/benches/11.jpg', title: 'Bench above the lake, snow', year: '2024', place: 'Tahoe', camera: `${P67} · Pro 400H`, note: '' },

  // Cars
  { room: 'cars', file: '/photos/cars/01.jpg', title: 'Leaning in', year: '2023', place: 'Sonoma', camera: 'Nikon D850', note: '' },
  { room: 'cars', file: '/photos/cars/02.jpg', title: 'From the grandstand', year: '2023', place: 'Sonoma', camera: `${P67} · Double-X`, note: '' },
  { room: 'cars', file: '/photos/cars/03.jpg', title: 'GT car, panned', year: '2023', place: 'Sonoma', camera: 'Nikon D850', note: '' },
  { room: 'cars', file: '/photos/cars/04.jpg', title: 'IndyCar at speed', year: '2021', place: 'Laguna Seca', camera: 'Nikon D750', note: '' },
  { room: 'cars', file: '/photos/cars/05.jpg', title: 'Through the corner', year: '2021', place: 'Laguna Seca', camera: 'Nikon D750', note: '' },
  { room: 'cars', file: '/photos/cars/06.jpg', title: 'Baja car in the Big House', year: '', place: 'Michigan Stadium', camera: 'Nikon D750', note: '' },
  { room: 'cars', file: '/photos/cars/07.jpg', title: 'Formula car on the course', year: '2021', place: 'Michigan International Speedway', camera: 'Nikon D750', note: '' },
  { room: 'cars', file: '/photos/cars/08.jpg', title: 'The team at the car', year: '2021', place: 'Michigan International Speedway', camera: 'Nikon D750', note: '' },
  { room: 'cars', file: '/photos/cars/09.jpg', title: 'Two cars in the tunnel', year: '2021', place: 'Michigan Stadium', camera: 'Nikon D750', note: '' },

  // Film
  { room: 'film', file: '/photos/film/01.jpg', title: 'Pool at night', year: '', place: '', camera: 'Film', note: '' },
  { room: 'film', file: '/photos/film/02.jpg', title: 'Lookout booth', year: '', place: '', camera: 'Film', note: '' },
  { room: 'film', file: '/photos/film/03.jpg', title: 'Observatory', year: '', place: '', camera: 'Film', note: '' },
  { room: 'film', file: '/photos/film/04.jpg', title: 'House above the beach', year: '2023', place: 'Point Reyes', camera: `${P67} · Gold 200`, note: '' },
  { room: 'film', file: '/photos/film/05.jpg', title: 'Lighthouse', year: '2023', place: 'Redwood coast', camera: `${P67} · HP5`, note: '' },
  { room: 'film', file: '/photos/film/06.jpg', title: 'Doorway', year: '2024', place: '', camera: 'Nikon F3 · Tri-X', note: '' },
  { room: 'film', file: '/photos/film/07.jpg', title: 'Bridge and vines', year: '2024', place: 'Korea', camera: 'ColorPlus 200', note: '' },
  { room: 'film', file: '/photos/film/08.jpg', title: 'Roses', year: '2024', place: 'Rose garden', camera: `${P67} · Portra 400`, note: '' },
  { room: 'film', file: '/photos/film/09.jpg', title: 'Lifeguard tower in snow', year: '2024', place: 'Tahoe', camera: `${P67} · Pro 400H`, note: '' },
  { room: 'film', file: '/photos/film/10.jpg', title: 'Roses against the sky', year: '2022', place: '', camera: 'Portra 160', note: '' },
  { room: 'film', file: '/photos/film/11.jpg', title: 'Dragon lanterns', year: '', place: '', camera: 'Film', note: '' },
  { room: 'film', file: '/photos/film/12.jpg', title: 'Posts along the path', year: '', place: '', camera: 'Film', note: '' },
  { room: 'film', file: '/photos/film/13.jpg', title: 'Dome at dusk', year: '', place: '', camera: 'Film', note: '' },
];

// ── derived helpers (no need to edit below) ─────────────────────────────────

// floor / ceil: the texture tiled over it (size in S, the room scale) and the colour it
// shows until that loads. A floor's sheen is the wall's reflection in it, as light added near
// the walls: (wall − stage colour) × (1 − floor opacity) / floor opacity × reflection opacity,
// with those from the theme in index.css (none where it's too faint to see).
export const themes = {
  white: { wall: '#efefec', boxBg: '#141414', boxFg: '#f4f3f0', floor: { img: '/textures/floor-stone.jpg', size: 0.77, color: '#b4b4b1' }, ceil: { img: null, size: 1, color: '#e4e4e1' } },
  spot: { wall: '#acaca9', boxBg: '#141414', boxFg: '#f4f3f0', floor: { img: '/textures/floor-concrete.jpg', size: 1.05, color: '#4f4f4f', sheen: '#838380' }, ceil: { img: '/textures/ceiling-tile.jpg', size: 0.27, color: '#dadad7' } },
  teal: { wall: '#173e49', boxBg: '#eceae3', boxFg: '#173f4a', floor: { img: '/textures/floor-oak.jpg', size: 0.49, color: '#6b4e32', sheen: '#000709' }, ceil: { img: null, size: 1, color: '#262828' } },
  salon: { wall: '#4f1a23', boxBg: '#f1e6d6', boxFg: '#4f1a23', floor: { img: '/textures/floor-walnut.jpg', size: 0.45, color: '#3a2620' }, ceil: { img: null, size: 1, color: '#1c1214' } },
  violet: { wall: '#24234c', boxBg: '#ecebf2', boxFg: '#24234a', floor: { img: '/textures/floor-walnut.jpg', size: 0.45, color: '#4a3326', sheen: '#070715' }, ceil: { img: null, size: 1, color: '#1c1b25' } },
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
  return { ...r, num: i + 1, photos: list, groups };
});

export const getRoom = (slug) => roomList.find((r) => r.slug === slug);
// The room the doorway at the end leads to; after the last room it leads back to the lobby.
export const nextRoom = (room) => roomList[room.num] || null;

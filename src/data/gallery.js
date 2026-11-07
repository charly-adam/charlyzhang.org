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
// Photos hang in order round the room, starting on your right as you come in (you go in to the
// right): along the right-hand wall, across the far wall and back along the left-hand wall. In
// a room of 17 or more, the first hangs on the entrance wall beside the door, on your right as
// you come in, and the last beside the door on its other side.
// The far wall takes 3 when the count is odd and 2 when it's even, so the long walls always
// match; the room grows with them.
//
// Add a room: add an entry to `rooms` (slug, name, theme, icon, blurb) and a folder in
// photos-originals. The icon is a pictogram from components/Icons.jsx. The lobby's wall, the
// map and the dock all follow this list.
// Themes: 'white' (bright, even light), 'spot' (spotlit, wood frames),
//         'teal' and 'violet' (colored walls, gold frames),
//         'salon' (claret damask walls, ornate gilt frames),
//         'sky' (pale blue walls with a faint flock of birds, light oak floor).
// `solo: true` gives every photo a wall of its own: it hangs on a bay standing out from the
// wall, bigger, with a stop of its own; the corners show two at once. For a few photos.
// ─────────────────────────────────────────────────────────────────────────────

import sizes from './photo-sizes.json';

export const site = {
  name: 'Charly Zhang',
  subtitle: 'Photography',
};

export const rooms = [
  { slug: 'favorites', name: 'Favorites', theme: 'salon', solo: true, icon: 'star', blurb: "A few of Charly's own favorites.", intro: '' },
  { slug: 'nature', name: 'Nature', theme: 'teal', icon: 'landscape', blurb: 'Parks, peaks and night skies.', intro: '' },
  { slug: 'birds', name: 'Birds', theme: 'sky', icon: 'bird', blurb: 'Wetlands and refuges around the Bay and the Valley.', intro: '' },
  { slug: 'travel', name: 'Travel', theme: 'violet', icon: 'globe', blurb: 'Streets and cities abroad.', intro: '' },
  { slug: 'benches', name: 'Benches', theme: 'spot', icon: 'bench', blurb: 'Empty seats, facing the view.', intro: '' },
  { slug: 'cars', name: 'Cars', theme: 'spot', icon: 'car', blurb: 'Race days and student race teams.', intro: '' },
  { slug: 'film', name: 'Film', theme: 'violet', icon: 'film', blurb: 'Shot on film.', intro: '' },
];

// Titles, years, places, cameras, lenses and film stocks are Charly's own (Nov 2026); blank ones are left
// off the plaque. A room's photos hang in the order listed here, whatever their file numbers.
export const photos = [
  // Favorites
  { room: 'favorites', file: '/photos/favorites/01.jpg', title: 'Delicate Arch', year: '2018', place: 'Arches National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/03.jpg', title: 'Moon Rose', year: '2016', place: 'My driveway, Ballwin, Missouri', camera: 'Nikon D5100', lens: '', film: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/04.jpg', title: 'Hume lake at sunset', year: '2021', place: 'Kings Canyon National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/05.jpg', title: 'Turret Arch with a rainbow', year: '2018', place: 'Arches National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/02.jpg', title: 'Delicate Arch Under the Milky Way', year: '2022', place: 'Arches National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'favorites', file: '/photos/favorites/06.jpg', title: 'Valley View', year: '2021', place: 'Yosemite Valley', camera: 'Nikon D750', lens: '', film: '', note: '' },

  // Nature
  { room: 'nature', file: '/photos/nature/05.jpg', title: 'Half Dome, last light', year: '2024', place: 'Glacier Point, Yosemite', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'nature', file: '/photos/nature/01.jpg', title: 'Mission Peak at sunset', year: '2022', place: 'Mission Peak', camera: 'Nikon F3HP', lens: '', film: 'Gold 200', note: '' },
  { room: 'nature', file: '/photos/nature/02.jpg', title: 'Hippie Hill', year: '2022', place: 'Golden Gate Park', camera: 'Nikon F3HP', lens: '', film: 'ColorPlus 200', note: '' },
  { room: 'nature', file: '/photos/nature/03.jpg', title: 'Bow Lake', year: '2024', place: 'Banff National Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'nature', file: '/photos/nature/04.jpg', title: 'Mesquite Sand Dunes', year: '2024', place: 'Death Valley', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/06.jpg', title: 'Bumpass Hell', year: '2025', place: 'Lassen Volcanic National Park', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/07.jpg', title: 'Boardwalk through Bumpass Hell', year: '2025', place: 'Lassen Volcanic National Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'nature', file: '/photos/nature/08.jpg', title: 'Mountain goat', year: '2021', place: 'Exit Glacier', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/09.jpg', title: 'Fireweed', year: '2021', place: 'AK-3 Highway', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/10.jpg', title: 'Climbers on the Exit Glacier', year: '2021', place: 'Exit Glacier', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/11.jpg', title: 'North Window Arch', year: '2022', place: 'The Windows, Arches National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/12.jpg', title: 'Headlamp under the Milky Way', year: '2017', place: 'Badlands National Park', camera: 'Nikon D5100', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/13.jpg', title: 'Island in the lake', year: '2021', place: 'San Luis Reservoir Lake', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/14.jpg', title: 'Ridgeline at dusk', year: '2021', place: 'Kings Canyon National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/15.jpg', title: 'Night over the canyon', year: '2021', place: 'Kings Canyon National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/16.jpg', title: 'Morning light on the ridge', year: '2021', place: 'Kings Canyon National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/17.jpg', title: 'North Window Arch lit at night', year: '2018', place: 'The Windows, Arches National Park', camera: '', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/18.jpg', title: 'Rainbow in Yosemite Falls', year: '2021', place: 'Glacier Point, Yosemite', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'nature', file: '/photos/nature/19.jpg', title: 'Canyon from above', year: '2018', place: 'Zion National Park', camera: 'Nikon D750', lens: '', film: '', note: '' },

  // Birds
  { room: 'birds', file: '/photos/birds/01.jpg', title: 'Bald eagle on a post', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/02.jpg', title: 'Great Blue Heron taking off', year: '2025', place: 'Baylands Nature Preserve', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/03.jpg', title: 'Great Egret in the reeds', year: '2024', place: 'Stevens Creek Shoreline Nature Study Area Preserve', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/04.jpg', title: 'Cormorants on the pylon', year: '2024', place: 'Stevens Creek Shoreline Nature Study Area Preserve', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/05.jpg', title: 'Sandpiper on a rock', year: '2025', place: 'Don Edwards San Francisco Bay National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/06.jpg', title: 'Great Blue Heron, wading', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/07.jpg', title: 'Vulture over the marsh', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/08.jpg', title: 'Chipping Sparrow on a stem', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/09.jpg', title: 'Bald eagle on a branch', year: '2025', place: 'Sacramento National Wildlife Refuge', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/10.jpg', title: 'Bluebird', year: '2025', place: 'Mountain View', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'birds', file: '/photos/birds/11.jpg', title: 'Hummingbird against the sky', year: '2025', place: 'Mountain View', camera: 'Nikon D850', lens: '', film: '', note: '' },

  // Travel
  { room: 'travel', file: '/photos/travel/01.jpg', title: 'Kawagoe Festival', year: '2023', place: 'Kawagoe, Saitama', camera: 'Nikon F3HP', lens: '', film: 'Ilford HP5', note: '' },
  { room: 'travel', file: '/photos/travel/02.jpg', title: 'Osaka Castle', year: '2023', place: 'Osaka', camera: 'Nikon F3HP', lens: '', film: 'Fuji C200', note: '' },
  { room: 'travel', file: '/photos/travel/03.jpg', title: 'Starfield Library', year: '2024', place: 'Gangnam District, Seoul', camera: 'Nikon F100', lens: '', film: 'Ilford HP5', note: '' },
  { room: 'travel', file: '/photos/travel/04.jpg', title: 'Sidewalk above the traffic', year: '2024', place: 'Jung District, Seoul', camera: 'Nikon F100', lens: '', film: 'CineStill 400D', note: '' },
  { room: 'travel', file: '/photos/travel/05.jpg', title: 'Museo Nacional de Antropología', year: '2025', place: 'Mexico City', camera: 'Nikon L35AF', lens: '', film: 'ColorPlus 200', note: '' },
  { room: 'travel', file: '/photos/travel/06.jpg', title: 'On the trail below the mountain', year: '2025', place: 'Paradise, Mount Rainier', camera: 'Nikon F100', lens: '', film: 'ColorPlus 200', note: '' },
  { room: 'travel', file: '/photos/travel/07.jpg', title: 'The Seattle Great Wheel', year: '2025', place: 'Seattle', camera: 'Nikon F100', lens: '', film: 'T-Max 400', note: '' },
  { room: 'travel', file: '/photos/travel/08.jpg', title: 'Neon after rain', year: '2026', place: 'Muslim Dasi Residential Quarter, Xian', camera: 'Nikon L35AF', lens: '', film: 'CineStill 800T', note: '' },
  { room: 'travel', file: '/photos/travel/09.jpg', title: 'Fisherman on the Yangtze River', year: '2026', place: 'Chongqing', camera: 'Nikon L35AF', lens: '', film: 'T-Max 400', note: '' },
  { room: 'travel', file: '/photos/travel/10.jpg', title: 'Hongyadong Folk Custom Scene Area', year: '2026', place: 'Chongqing', camera: 'Nikon L35AF', lens: '', film: 'T-Max 400', note: '' },
  { room: 'travel', file: '/photos/travel/11.jpg', title: 'Terracotta Warriors Pit #1', year: '2026', place: 'Mausoleum of the First Qin Emperor, Xian', camera: 'Nikon L35AF', lens: '', film: 'T-Max 400', note: '' },

  // Benches
  { room: 'benches', file: '/photos/benches/03.jpg', title: 'Log bench at Emerald Lake', year: '2024', place: 'Emerald Lake, Banff National Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'benches', file: '/photos/benches/02.jpg', title: 'Bench in the dry grass', year: '2023', place: 'Byxbee Park', camera: 'Nikon F3HP', lens: '', film: 'Gold 200', note: '' },
  { room: 'benches', file: '/photos/benches/01.jpg', title: 'Bench over the bay', year: '2023', place: 'Angel Island', camera: 'Nikon F3HP', lens: '', film: 'Kodak Gold 200', note: '' },
  { room: 'benches', file: '/photos/benches/04.jpg', title: 'Bench above the marsh', year: '2024', place: 'Don Edwards San Francisco Bay National Wildlife Refuge', camera: 'Nikon F3HP', lens: '', film: 'Tri-X 400', note: '' },
  { room: 'benches', file: '/photos/benches/05.jpg', title: 'Bench under a blue sky', year: '2024', place: 'Byxbee Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'benches', file: '/photos/benches/06.jpg', title: 'Bench on the hilltop', year: '2024', place: 'Byxbee Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'benches', file: '/photos/benches/07.jpg', title: 'Bench facing the marsh', year: '2024', place: 'Byxbee Park', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'benches', file: '/photos/benches/08.jpg', title: 'Snowy Bench', year: '2024', place: 'Sand Harbor State Park, Lake Tahoe', camera: 'Nikon F100', lens: '', film: 'Fuji C200', note: '' },
  { room: 'benches', file: '/photos/benches/09.jpg', title: 'Bench in the woods', year: '2024', place: 'Bukhansan National Park', camera: 'Nikon F100', lens: '', film: 'Ilford HP5', note: '' },
  { room: 'benches', file: '/photos/benches/10.jpg', title: 'Bench in the wetland', year: '2024', place: 'Baylands Nature Preserve', camera: 'Nikon F100', lens: '', film: 'ColorPlus 200', note: '' },
  { room: 'benches', file: '/photos/benches/11.jpg', title: 'Bench above the lake', year: '2024', place: 'Sand Harbor State Park, Lake Tahoe', camera: 'Pentax 6x7', lens: '', film: 'Fuji Pro 400H', note: '' },

  // Cars
  { room: 'cars', file: '/photos/cars/01.jpg', title: 'MotoGP', year: '2023', place: 'Laguna Seca Raceway', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/02.jpg', title: 'Ferrari GT car', year: '2023', place: 'Sonoma Raceway', camera: 'Pentax 6x7', lens: '', film: 'Cinestill BWXX', note: '' },
  { room: 'cars', file: '/photos/cars/03.jpg', title: 'Mercedes GT car', year: '2023', place: 'Sonoma Raceway', camera: 'Nikon D850', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/04.jpg', title: 'IndyCar at speed', year: '2021', place: 'Laguna Seca Raceway', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/05.jpg', title: 'Laguna Seca Turn 6', year: '2021', place: 'Laguna Seca Raceway', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/06.jpg', title: 'Baja car in the Big House', year: '2021', place: 'Michigan Stadium, Ann Arbor', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/07.jpg', title: 'Formula car on the course', year: '2021', place: 'Michigan International Speedway', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/08.jpg', title: 'Race prep', year: '2021', place: 'Michigan International Speedway', camera: 'Nikon D750', lens: '', film: '', note: '' },
  { room: 'cars', file: '/photos/cars/09.jpg', title: 'Two cars in the tunnel', year: '2021', place: 'Michigan Stadium, Ann Arbor', camera: 'Nikon D750', lens: '', film: '', note: '' },

  // Film
  { room: 'film', file: '/photos/film/09.jpg', title: 'Lifeguard tower in snow', year: '2024', place: 'Sand Harbor State Park, Lake Tahoe', camera: 'Pentax 6x7', lens: '', film: 'Fuji Pro 400H', note: '' },
  { room: 'film', file: '/photos/film/01.jpg', title: 'Hot Tub at night', year: '2022', place: 'Mountain View', camera: 'Nikon F3HP', lens: 'Nikon 50mm F1.4 w/ 1/4 Promist', film: 'ColorPlus 200', note: '' },
  { room: 'film', file: '/photos/film/02.jpg', title: 'Empty booth', year: '2023', place: 'Mount Hamilton', camera: 'Nikon F3HP', lens: '', film: 'Gold 200', note: '' },
  { room: 'film', file: '/photos/film/03.jpg', title: 'Lick Observatory', year: '2023', place: 'Mount Hamilton', camera: 'Nikon F3HP', lens: '', film: 'Kodak Gold', note: '' },
  { room: 'film', file: '/photos/film/04.jpg', title: 'House above the beach', year: '2023', place: 'Point Reyes', camera: 'Pentax 6x7', lens: '', film: 'Gold 200', note: '' },
  { room: 'film', file: '/photos/film/05.jpg', title: 'Point Cabrillo Lighthouse', year: '2023', place: 'Mendocino', camera: 'Pentax 6x7', lens: '', film: 'Ilford HP5', note: '' },
  { room: 'film', file: '/photos/film/06.jpg', title: 'Doorway', year: '2024', place: 'Byxbee Park', camera: 'Nikon F3HP', lens: '', film: 'Tri-X 400', note: '' },
  { room: 'film', file: '/photos/film/07.jpg', title: 'Bridge and vines', year: '2024', place: 'Nakdong River Estuary Eco Center, Busan', camera: 'Nikon F100', lens: '', film: 'ColorPlus 200', note: '' },
  { room: 'film', file: '/photos/film/08.jpg', title: 'Roses', year: '2024', place: 'San Jose Rose Garden', camera: 'Pentax 6x7', lens: '', film: 'Portra 400', note: '' },
  { room: 'film', file: '/photos/film/10.jpg', title: 'Roses against the sky', year: '2022', place: 'San Jose Rose Garden', camera: 'Nikon F3HP', lens: '', film: 'Portra 160', note: '' },
  { room: 'film', file: '/photos/film/11.jpg', title: 'Gum Lung', year: '2023', place: 'Chinatown, San Francisco', camera: 'Nikon F3HP', lens: 'Zeiss Otus 55mm F1.4', film: 'Ilford HP5', note: '' },
  { room: 'film', file: '/photos/film/12.jpg', title: 'The Pole Field', year: '2023', place: 'Byxbee Park', camera: 'Nikon F3HP', lens: '', film: 'Portra 400', note: '' },
  { room: 'film', file: '/photos/film/13.jpg', title: 'Skateboarder at City Hall', year: '2023', place: 'San Jose', camera: 'Nikon F3HP', lens: '', film: 'Portra 400', note: '' },
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
  sky: { wall: '#c8dde9', boxBg: '#1b2d38', boxFg: '#f4f8fa', floor: { img: '/textures/floor-oak.jpg', size: 0.49, color: '#a98a66' }, ceil: { img: null, size: 1, color: '#eef3f6' } },
  violet: { wall: '#24234c', boxBg: '#ecebf2', boxFg: '#24234a', floor: { img: '/textures/floor-walnut.jpg', size: 0.45, color: '#4a3326', sheen: '#070715' }, ceil: { img: null, size: 1, color: '#1c1b25' } },
};

export const roomList = rooms.map((r, i) => {
  const list = photos
    .filter((p) => p.room === r.slug)
    .map((p, k) => {
      const sz = sizes[p.file] || {};
      const width = p.width || sz.width || 1500;
      const height = p.height || sz.height || 1000;
      // `wall` is the lighter copy hung on the wall; `file` is the full-size one shown up close;
      // `thumb`, a small one, is what a collage starts with (scripts/thumbs.js).
      // Both carry a fingerprint of their contents (sz.v), so a browser that has cached a file
      // under the same name before (photos get renumbered) fetches it afresh.
      const v = sz.v ? `?v=${sz.v}` : '';
      return { ...p, width, height, file: p.file + v, wall: (sz.wall || p.file) + v, thumb: (sz.thumb || sz.wall || p.file) + v, id: `${r.slug}-${k + 1}`, index: k, portrait: height > width };
    });
  const groups = [];
  list.forEach((p) => {
    if (p.pair && groups.length) groups[groups.length - 1].push(p);
    else groups.push([p]);
  });
  return { ...r, num: i + 1, photos: list, groups };
});

export const getRoom = (slug) => roomList.find((r) => r.slug === slug);

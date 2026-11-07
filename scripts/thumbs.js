// Small copies for the collage walls, made from the wall copies (so they need no originals):
//
//   public/photos/<room>/<name>-wall.jpg → public/photos/<room>/<name>-thumb.jpg  560 px long side
//
// A collage shows every photo at once, so it starts with these and swaps in the bigger copies
// only for the photos you zoom in on. Records `thumb` (and `tv`, the `v` it was made from) for
// each photo in src/data/photo-sizes.json; a photo whose `v` has changed gets a new thumb.
// Runs as part of `npm run photos`.

import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SIZES = 'src/data/photo-sizes.json';
const LONG = 560;

const sizes = JSON.parse(await readFile(SIZES, 'utf8'));
let made = 0;
for (const [file, s] of Object.entries(sizes)) {
  const thumb = file.replace(/\.jpg$/, '-thumb.jpg');
  const out = `public${thumb}`;
  if (s.thumb === thumb && s.tv === s.v && existsSync(out)) continue;
  await sharp(`public${s.wall}`).resize({ width: LONG, height: LONG, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  s.thumb = thumb;
  s.tv = s.v;
  made += 1;
}
await writeFile(SIZES, JSON.stringify(sizes, null, 2) + '\n');
console.log(made ? `Made ${made} collage thumb(s).` : 'Collage thumbs up to date.');

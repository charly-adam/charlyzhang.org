// Makes web copies of the full-size originals.
//
//   photos-originals/<room>/<name>.jpg   (gitignored, any size)
//     → public/photos/<room>/<name>.jpg       2400 px long side, shown when you zoom into a photo
//     → public/photos/<room>/<name>-wall.jpg  1200 px long side, hung on the wall
//
// and records each photo's pixel size in src/data/photo-sizes.json, so gallery.js
// doesn't need width/height typed in by hand. Run with: npm run photos

import sharp from 'sharp';
import { readdir, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = 'photos-originals';
const OUT = 'public/photos';
const SIZES = 'src/data/photo-sizes.json';
const FULL = 2400;
const WALL = 1200;
const QUALITY = 82;
const IMAGE = /\.(jpe?g|png|tiff?|webp)$/i;

const mb = (n) => `${(n / 1e6).toFixed(1)} MB`;

async function write(src, out, long) {
  await sharp(src)
    .rotate() // auto-orient from EXIF
    .resize({ width: long, height: long, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(out);
  return (await stat(out)).size;
}

async function main() {
  if (!existsSync(SRC)) {
    console.log(`Nothing to do: put originals in ${SRC}/<room>/ first.`);
    return;
  }
  const sizes = existsSync(SIZES) ? JSON.parse(await readFile(SIZES, 'utf8')) : {};
  const rooms = (await readdir(SRC, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

  for (const room of rooms.sort()) {
    await mkdir(path.join(OUT, room), { recursive: true });
    const files = (await readdir(path.join(SRC, room))).filter((f) => IMAGE.test(f)).sort();
    console.log(`${room}: ${files.length} photo(s)`);
    for (const f of files) {
      const src = path.join(SRC, room, f);
      const name = path.basename(f, path.extname(f));
      const full = path.join(OUT, room, `${name}.jpg`);
      const before = (await stat(src)).size;
      // a panorama (wider than 2:1) is sized by its height instead, so it stays sharp up close
      const meta = await sharp(src).rotate().metadata();
      const ratio = Math.max(meta.width, meta.height) / Math.min(meta.width, meta.height);
      const wide = ratio > 2 ? Math.min(Math.round(ratio * 1400), 7200) : 0;
      const after = await write(src, full, wide || FULL);
      await write(src, path.join(OUT, room, `${name}-wall.jpg`), wide ? Math.round(wide / 2) : WALL);
      const { width, height } = await sharp(full).metadata();
      sizes[`/photos/${room}/${name}.jpg`] = { width, height, wall: `/photos/${room}/${name}-wall.jpg` };
      console.log(`  ${f}  ${mb(before)} → ${mb(after)}  (${width}×${height})`);
    }
  }

  const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(SIZES, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`\nDone. Sizes recorded in ${SIZES}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

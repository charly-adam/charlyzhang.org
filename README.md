# charlyzhang.org

Charly Zhang's photography, hung as a walk-through museum gallery.

- **Lobby:** a wayfinding sign pointing to each room.
- **Rooms:** a 2.5D gallery room per section. Scroll, swipe, drag, or use the arrow keys to walk
  along the wall; it glides and settles on the nearest photo. Click a photo or its wall label (or
  press Enter) and the other lights click off, then the camera walks up to it (← → for the
  neighbours; Esc or a click anywhere else steps back). Click the room's title text to walk up to
  that. The doorway at the end leads to the next room, or back to the lobby after the last one.
- **Navigation:** the glass home button at the bottom opens sideways into the list of rooms.
- **Phones:** the same room, scaled to fit the screen.

Built with Vite, React 19, react-router 7 and Tailwind 4. Hosted on Vercel.

## Run it locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## Add or change photos (no coding needed)

1. Put the full-size original in `photos-originals/<room>/` (for example
   `photos-originals/benches/12.jpg`). This folder stays on your computer; git ignores it.
2. Run `npm run photos`. It writes two web copies to `public/photos/<room>/`: `12.jpg` (2400 px,
   shown up close) and `12-wall.jpg` (1200 px, hung on the wall), and records the pixel size in
   `src/data/photo-sizes.json`.
3. Open `src/data/gallery.js` and add a line to `photos`:

   ```js
   { room: 'benches', file: '/photos/benches/12.jpg',
     title: 'Bench at dawn', year: '2026', place: 'Lake Tahoe', camera: '35 mm film', note: 'One sentence about the shot.' },
   ```

   Leave out anything you don't know; the wall label skips empty fields. Add `pair: true` to hang
   it right next to the photo before it, sharing one wall label.
4. Commit and push to `main`. Vercel redeploys in about a minute.

To add a room, add it to `rooms` in the same file (`slug`, `name`, `theme`, `icon`, `blurb`) and
create `photos-originals/<slug>/`. Themes: `white`, `spot`, `teal`, `violet` (every room uses
`spot` for now).

For now there's one room, Benches, with Charly's photos.

## Deploy

GitHub → Vercel (import this repo; Vite is auto-detected) → add `charlyzhang.org` and
`www.charlyzhang.org` under Project → Settings → Domains → copy the A and CNAME records Vercel
shows into Cloudflare DNS with the proxy **off** (grey cloud).

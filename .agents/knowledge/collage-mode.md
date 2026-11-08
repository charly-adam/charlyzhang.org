# Collage mode

A second way to see a room (src/pages/Collage.jsx): every photo on one flat wall, packed
salon-style (src/room/salon.js), with free pan and zoom. Routes: `/room/:slug/collage[/:photoId]`
and `/collage[/:photoId]`, the All photos wall (every photo once, deduped by file hash or by
title + year, shuffled from a fixed seed, plain white theme).

- **The switch** (components/ModeSwitch.jsx, rendered by App) shows on a room's page in either
  mode, never up close on a photo. The choice is kept in localStorage (`charlyzhang.view`,
  src/viewMode.js). With "collage" kept, RoomRoute redirects `/room/x` to `/room/x/collage`,
  except when the gallery itself navigates back to `/room/x` (it passes `state: { gallery: true }`).
  Switching uses `replace`, so Back isn't trapped between the two. With nothing kept, it's collage
  on phones (max-width: 700px) and gallery elsewhere.
- **Up close**, a swipe or arrow key goes to the nearest photo whose middle lies that way on the
  wall (within about 60 degrees, favouring straight across); at the wall's edge it stays put.
- **Layout**: a binary cut tree whose pieces keep their photos' exact proportions (h = p·w + q
  per piece). Best of 160 random trees, then hill-climbing (flip a cut, swap two photos, change
  a weight). About 30 ms for 80 photos. Same seed, same wall; wide and tall screens get
  different hangs (aspect 1.55 or 0.62).
- **Frames** reuse the room's `.frame` styles: each `.cfw` sets its own `--S`, so the mat (0.02 S)
  and border (`--fbk`, a copy of each theme's `--fb` factor) come out right for its size. Keep
  `FB` in salon.js and `--fbk` in index.css in step with the themes' `--fb`.
- **Images**: `-thumb.jpg` (560 px, made from the wall copies by scripts/thumbs.js, part of
  `npm run photos`) to start; after each move, frames shown big enough get the wall copy, then
  the full file. Never back down.
- **Rendering**: the wall has a 2D transform at rest (so it's painted with the page, no layer),
  and `will-change: transform` only while moving (`.moving`). `.collage .frame` must keep
  `backface-visibility: visible`: the room's `hidden` made every one of 80 frames its own
  composited layer (172 layers, 42 M px at the phone's fit view; now 11 layers, 0.4 M).

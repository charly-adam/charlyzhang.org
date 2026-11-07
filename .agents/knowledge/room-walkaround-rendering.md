# Room walk-around rendering rules

Chrome rasterises each 3D plane at the magnification of its nearest corner and at device pixel ratio; past its tile memory budget it silently drops walls, floor or photos (usually first in the biggest room's doorway view, where the whole room is in view). What holds now (Nov 2026):
- floor/ceiling tiles are `<canvas>` (512px textured, 64px for a plain-colour ceiling), drawn once; walls are panels ~0.75 S (0.3 S on the entrance wall); tiles under/over the camera hidden per frame; hallway floor/ceiling/far wall `display: none` at the door.
- floor reflections: only frames are reflected, each `.refl .fw` its own small plane; the wall's sheen is painted into the floor tile canvases (additive, `floor.sheen` in gallery.js themes). A wall-length reflection plane — even split into windowed pieces — blew the budget.
- frames are flat (print + glass one layer), edge faces are siblings in `.fw`; the shadow is a box-shadow on the frame.
- at the doorway, anything the arch hides is marked `data-unseen` (projected through the opening, Room.jsx `markUnseen`) and hidden until you go in.
- the arch reveal (`.pjl/.pjr/.parch`) is solid colour: seen edge-on by the camera, a textured face rasterises at a huge scale.
- the hallway's floor and ceiling (`.hall`) are drawn at the doorway only in `tall` views (Room.jsx), where a real band of them shows past the entrance wall: a phone. Right under and over the camera they're huge; when a smaller P (0.95, Nov 2026) made every landscape screen count as tall, Retina Chrome dropped the entrance wall in Nature. A sliver past the wall's foot is left to the dark threshold.
- phones (max-width 700px, where S is 1.6× the screen width, Nov 2026): floor/ceiling tiles are 0.9 S (GEO.tilePhone), so there are as many canvases as at S = width; every canvas sets its size to 0 on unmount (Safari keeps canvas memory until GC and has a hard total cap: past it new canvases stay blank, which shows as dark patches in the floor); and Room.jsx culls per frame whatever is outside a wedge 30° wider than the view each side (wall panels and photo columns get `data-off`, tiles `visibility: hidden`). Desktop doesn't cull.
- with doorCam -1.1 a landscape view counts as `tall` too, so the hallway floor is drawn at the door on desktop (it carries the ENTER arrow); it's solid (opaque canvas, opacity 1), or the room's floor reflections show through it.
- photo URLs carry `?v=<hash>` from photo-sizes.json: photos/ is cached for a week (vercel.json), and renumbered files otherwise showed the old picture in the wrong slot.
- rooms skip the backdrop-filter depth of field and the mix-blend-mode grain (each forces the scene into an extra surface).
- no filter, mask-image or box-shadow blur on any 3D plane itself; no opacity on a preserve-3d container (it flattens everything into one surface) — put it on the leaf planes.

- **Phones run out far sooner than desktops** (Nov 2026, Charly's Pixel 10 in Chrome: black floor tiles, frames showing only their edges, the map brochure and the Gallery switch missing, at the doorway of most rooms). Reproduce it on Windows/Mac headless Chrome with `--force-gpu-mem-available-mb=64` at 412×770 @2.625: it fails exactly like the phone. What fixed it (phone only, all in the `max-width: 700px` block and RoomBox):
  - each `.fw` is `transform-style: flat`, with no `.side` faces and no translateZ on `.frame`: one layer a photo instead of about nine;
  - the lamps' light keeps still: an infinite `lamp-sway` animation kept every `.beam` and `.pool` a layer of its own. (A CSS fan in place of the SVG beam looked wrong, flat light sideways, so the real cone stays.) Without any lamp light every room passed at 56 MB; with it all pass at 64 and Nature is borderline at 56;
  - 16 arch facets instead of 48 (each facet is a layer);
  - textured floor canvases at most 288 px (`GEO.tilePxPhone`; canvases count against the same budget);
  - the hallway's tiles at 0.55 S (`GEO.tileNearPhone`): a tile is drawn as sharp as its nearest corner needs, and these are right by the camera.
  Results right at the limit vary a little between runs; compare at a few caps (64, 56, 48). Any running CSS animation on an element inside the room makes it a layer: don't add one to a per-photo element.
- the lobby's `.floor3d` and `.ceil3d` are only as deep as a screen shows (1.2 S and 0.9 S): at 1.8 S their near edges came within reach of the eye, drawn at ~10x, and iPhone browsers (WebKit) left them out.

Measure with CDP `LayerTree.enable` + `DOM.describeNode` (sum layer area by class), and A/B by injecting CSS that hides one group. Result: 1728×1117 @2x renders every room solidly; 2560×1440 @2x (5K) Nature's doorway is still borderline.

Clicks: all room wrappers and surfaces are `pointer-events: none` (scoped to `.room`); only `.frame`, `.label`, `.intro-inner`, `.doorbtn`, `.pface.front` are `auto`, with `backface-visibility: hidden`. Probe with `document.elementFromPoint`.

**Why:** Reproduced Adam's and his brother's Retina failures in headless Chrome with GPU on, Oct–Nov 2026.

**How to apply:** Any new large surface should be a canvas or small panels; any new per-photo element should paint into an existing layer rather than add one; test big rooms at dpr 2 with the CDP driver in [headless-chrome-3d-screenshots.md](headless-chrome-3d-screenshots.md).

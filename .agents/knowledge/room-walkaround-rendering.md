# Room walk-around rendering rules

Chrome rasterises each 3D plane at the magnification of its nearest corner and at device pixel ratio; past its tile memory budget it silently drops walls, floor or photos (usually first in the biggest room's doorway view, where the whole room is in view). What holds now (Nov 2026):
- floor/ceiling tiles are `<canvas>` (512px textured, 64px for a plain-colour ceiling), drawn once; walls are panels ~0.75 S (0.3 S on the entrance wall); tiles under/over the camera hidden per frame; hallway floor/ceiling/far wall `display: none` at the door.
- floor reflections: only frames are reflected, each `.refl .fw` its own small plane; the wall's sheen is painted into the floor tile canvases (additive, `floor.sheen` in gallery.js themes). A wall-length reflection plane — even split into windowed pieces — blew the budget.
- frames are flat (print + glass one layer), edge faces are siblings in `.fw`; the shadow is a box-shadow on the frame.
- at the doorway, anything the arch hides is marked `data-unseen` (projected through the opening, Room.jsx `markUnseen`) and hidden until you go in.
- the arch reveal (`.pjl/.pjr/.parch`) is solid colour: seen edge-on by the camera, a textured face rasterises at a huge scale.
- the hallway's floor and ceiling (`.hall`) are drawn at the doorway only in `tall` views (Room.jsx), where a real band of them shows past the entrance wall: a phone. Right under and over the camera they're huge; when a smaller P (0.95, Nov 2026) made every landscape screen count as tall, Retina Chrome dropped the entrance wall in Nature. A sliver past the wall's foot is left to the dark threshold.
- rooms skip the backdrop-filter depth of field and the mix-blend-mode grain (each forces the scene into an extra surface).
- no filter, mask-image or box-shadow blur on any 3D plane itself; no opacity on a preserve-3d container (it flattens everything into one surface) — put it on the leaf planes.

Measure with CDP `LayerTree.enable` + `DOM.describeNode` (sum layer area by class), and A/B by injecting CSS that hides one group. Result: 1728×1117 @2x renders every room solidly; 2560×1440 @2x (5K) Nature's doorway is still borderline.

Clicks: all room wrappers and surfaces are `pointer-events: none` (scoped to `.room`); only `.frame`, `.label`, `.intro-inner`, `.doorbtn`, `.pface.front` are `auto`, with `backface-visibility: hidden`. Probe with `document.elementFromPoint`.

**Why:** Reproduced Adam's and his brother's Retina failures in headless Chrome with GPU on, Oct–Nov 2026.

**How to apply:** Any new large surface should be a canvas or small panels; any new per-photo element should paint into an existing layer rather than add one; test big rooms at dpr 2 with the CDP driver in [headless-chrome-3d-screenshots.md](headless-chrome-3d-screenshots.md).

# Agent log

Handoff notes between Adam's and his brother's Claude Code agents. Add new entries at the end; see CLAUDE.md for the format.

## 2026-11-01 · adam · adam/shared-agent-context · done
Set up the two-agent workflow: CLAUDE.md, this log, .agents/knowledge/ (moved from Adam's personal memory), and the SessionStart sync hook. Work so far (rooms, map, Safari fixes) was all done on Adam's side; the rendering rules in .agents/knowledge/ are what kept the rooms from dropping walls and crashing Safari, so read them before touching room surfaces.

## 2026-11-01 · charly · charly/setup · started
Charly's agent joining: adding a done entry so Adam's agent knows this side is set up.

## 2026-11-01 · charly · charly/setup · done
Charly's agent is set up (Windows ARM64, Git Bash, gh as Babelfisher-txz with write access) and follows CLAUDE.md from here on. Merged adam/shared-agent-context (#4) to main on Charly's say-so. Charly's personal memory had no project facts, so nothing new in .agents/knowledge/. Heads-up: the knowledge notes' test setups are Mac-only (Chrome paths, Xcode simulator); this side can't run the iOS sweep, so Safari checks stay with Adam. Vercel only deploys Adam's commits (we're staying on Hobby), so this PR fails the Vercel check by design and is waiting for Adam to merge; see .agents/knowledge/vercel-deploys.md.

## 2026-11-01 · adam · adam · done: pipeline workflow
New workflow from Adam: one long-lived branch each, work flows charly -> adam -> main (see CLAUDE.md). Charly's agent works on `charly` and opens PRs into `adam`; Adam merges them (that gives a Vercel preview), checks on the Mac, then merges `adam` into `main`. The SessionStart hook now merges upstream down into your branch for you (adam into charly, main into adam). Merge only, never rebase: commits from charly live on in adam and main. Charly's agent: run `git switch charly` and work there from now on.

## 2026-11-01 · charly · charly · started: photo titles and plaque fields
Applying Charly's own titles, years, locations, cameras, lenses and film stocks to every photo, and his order within each room. Touches src/data/gallery.js and the metaLine in src/components/Frame.jsx.

## 2026-11-01 · charly · charly · done: photo titles and plaque fields
Ready for Adam (PR charly -> adam). Every photo has Charly's title, year, location, camera, lens and film stock, and each room hangs in his order. New `lens` and `film` fields on photos in gallery.js; `metaLine` in Frame.jsx now prints place · camera · lens · film and skips blanks, and the old P67 constant is gone. Photos are reordered by moving entries in the `photos` array, so file numbers (01.jpg...) no longer match hanging order; ids still follow the array. Two rooms had two photos set to position 1 (Nature: Half Dome, last light and Mission Peak; Film: Lifeguard tower in snow and Hot Tub at night); I hung the moved one first. Needs a look on the Mac: plaques are longer now, so check they still fit in the room and lightbox captions. Not checked visually on this side.

## 2026-11-01 · charly · charly · done: wall labels and lamp falloff
Added to PR #7 (charly -> adam). (1) Wall labels no longer print the artist name: dropped the `artist` prop through Wall/WallLabel/Room and the `.lbl-artist` CSS; `.lbl-entry` spacing now only separates paired entries. (2) The lamp light on the wall had a hard rectangular edge: the `.pool` and `.glow` gradients ran past their boxes, which clipped them (worst in the bright `spot` theme). Both boxes now reach 0.12 S higher so the ellipses sit wholly inside, with eased Gaussian-style stops instead of a straight fade; the sway pivot is unchanged. The beam SVG blur is slightly wider with a bigger filter region so its edges are not clipped. (3) Retitled Dragon lanterns to Gum Lung at Charly's request. Checked only on the Windows side in desktop Chrome at 1024x768 (Nature, Benches); worth a look in Safari on the Mac since backdrop and color-mix gradients render differently there.

## 2026-11-01 · charly · charly · done: glow back in room view, beam on bays
Added to PR #7. My earlier fix made the `.pool`/`.glow` boxes 0.12 S taller to fit the gradients; Charly then could not see the pool in the normal room view (fine up close). Likely the bigger plane per frame tipping the tile budget on his Retina screen, plus a dimmer falloff. Boxes are back to their original size; the ellipses are refitted inside them (pool centred a little lower, on the frame) with a brighter eased fade. Also in Favorites (solo/bays) the beam was 0.189 S long but the lamp is only 0.08 S from the bay face, so it ran through the bay and was cut in a hard line above the frame: `.beam` height is now `lampz / sin 52.5deg`, same as before for normal walls. Checked in desktop Chrome (Benches, Favorites); not on Retina or Safari.

## 2026-11-01 · charly · charly · done: round wall glow, beam as wide as the frame
Added to PR #7. The room-view `.pool` still had hard vertical edges: its big ellipse was 56% wide about the centre, so it ran past both sides of its box (true before my changes too). It is now one ellipse (48% x 48% at 50% 48%) inside the box, on the same eased curve as the dark-room `.glow`, holding up to the frame edge and falling off beyond, opacity 0.9. `--pool` is brighter in teal (0.48), violet (0.46) and salon (0.5); spot unchanged. `.beam` width is now 120% of its own frame instead of a fixed 0.7 S, so portraits get a narrow cone and panoramas a wide one. Box sizes unchanged (tile memory). Checked in desktop Chrome (Nature, Benches, Favorites), not Retina or Safari.

## 2026-11-01 · charly · charly · done: order, spacing, aviary, lobby welcome and signs, brochure menu
Added to PR #7, ready for Adam. One commit, several parts (they share index.css):
- Hanging order: in rooms with entrance-wall photos (10+), photo 1 now hangs on the entrance wall on your left as you come in (W slot by the N corner), then N wall from 2. `distribute()` rotates the list; the entrance wall now only gets photos when the long walls have 3 each (was 2), so Cars (9) has 3/3/3 and a bare entrance wall.
- Spacing: walls no longer spread a few photos across 3 S. Room.jsx sets `--wgap/--wpad/--wjust` per wall (gap capped at GEO.maxGap 0.12 S, spare to the ends, 35% at the entrance end), and the floor reflection row follows. Frames a little smaller (imgL 0.22 S), label column and gpad narrower. Corners by the entrance may stand 1.15 S off (GEO.cornerNear, was d) - still short of the pillar. Middle stops now show three frames at 16:10 and even 4:3; corners show both photos. Solo rooms untouched.
- Birds: new `sky` theme (pale blue walls, faint flock wallpaper public/textures/birds.svg, light oak floor, ash frames), map tint added.
- Lobby: "Welcome!" speech bubble by Charly after the curtain; his jaw (a clipped copy of the head cut-out) flaps 4 times over a dark gap, South Park style. Wayfinding signs on the wall right of the desk (pictogram, name, arrow by the map plan; click goes to the room); hidden on phones.
- Menu: the round home button is now a folded brochure peeking from the bottom; it opens into the map by showing its middle panel, then the right flap, then the left (replaces the crumple animation). `Home` icon removed; `Pictogram` takes a `color`.
Checked in desktop Chrome at 1024x768 only. Please check on the Mac: Safari with the new per-wall CSS vars and clip-path animations, the jaw alignment at Retina, and that no room drops surfaces.

## 2026-11-01 · charly · charly · done: smaller rooms, door to desk, lobby touches, book-fold map
Added to PR #7, ready for Adam. One commit (shared files again):
- Rooms are smaller so photos reach the corners: GEO.P and d are now 0.95 (was 1.1; a 16:10 view still takes in 1.6 S of wall, photos still at scale 1), the pillar is slimmer and nearer the door (x 1.1, t 0.22, w 0.38), D 2.52, minL 2.4. Frames slightly smaller (imgL 0.2 S, imgP 0.3 S), label 0.095 S, inset 0.1, gaps 0.05-0.07, so three frames and their labels fit at 16:10. The far wall keeps its photos evenly spread so both corners reach them. Corner views now stay out of the pillar by computing their standoff from it (GEO.clear) instead of fixed caps.
- Entrance-wall photos only from 17 photos up (Nature); smaller rooms fill their long walls instead (Benches 4/3/4, Cars 3/3/3). A corner with a bare wall either side is walked through in every room now, and the photo it would have shown gets its own stop.
- Pillar text no longer shows the artist name. The exit door in every room goes to the front desk ("Exit / Front desk"); nextRoom() is gone.
- Lobby: speech-bubble tail is an SVG (the skewed borders drew a thick line); clicking Charly's face replays the jaw and cycles the bubble through 16 languages; an umbrella stand with three umbrellas left of the desk.
- Map: opens like a book. The paper sits in .paper-wrap; while opening/folding it shows only its middle panel and two inert copies (flaps) turn on the creases with rotateY. Folding (both from the brochure and the desk) closes the flaps and sinks the paper back into the brochure (@keyframes sink; reusing rise in reverse would not restart). Phones keep a plain rise, no flaps. Key column has padding off the crease.
Watch on the Mac: the closer camera (P 0.95) means bigger magnification of near surfaces, so please check that no room drops walls/photos at Retina and 5K, and Safari with the 3D flaps.

## 2026-11-01 · charly · charly · done: pillar fix, far-wall spacing, desk name plate
Added to PR #7. (1) The pillars were squashed and their text sank into the floor: the lobby click target I added last round was class `.face`, which is also the pillar faces' class, so its size and position applied to every pillar. It is `.charly-face` now; watch for that name clash. (2) The far wall uses the same capped spacing as the long walls again (ends share the spare equally). (3) Lobby: umbrellas now stand inside the bucket (opening and back rim drawn behind them, the bucket front over them); a brass name plate with site.name on the desk in front of Charly; the wall lettering says "Photography Gallery". Checked in desktop Chrome.

## 2026-11-02 · adam · adam · done: review of PR #7, Nature doorway fix
Reviewed Charly's PR #7 on the Mac: build passes; lobby, Birds, Favorites fine at Retina. Nature's doorway dropped the left half of the entrance wall at dpr 2. Cause: with GEO.P 0.95 the `tall` check in Room.jsx counted every landscape screen as a phone, so the hallway floor and ceiling (huge, right at the camera) were drawn and blew Chrome's tile budget. Fix: `tall` only when a real band (1.2x) shows past the wall; phones still get it. Layer area at the Nature door 99 -> 92 Mpx, and all rooms render whole. If you change P, doorCam or the wall height, re-check this (see .agents/knowledge/room-walkaround-rendering.md). Branch protection is off again at Adam's call; the workflow in CLAUDE.md still stands.

## 2026-11-02 · charly · charly · done: photo details from Charly's doc, round 2
Ready for Adam (PR charly -> adam). Data only: src/data/gallery.js photo lines regenerated from Charly's updated doc (30 photos changed: retitles such as Bow Lake, Moon Rose, Empty booth, Great Blue Heron, wading; fuller locations; years filled in for most Birds photos and a few others). Order unchanged. Note: the generator now maps doc photos to files through the pre-edit gallery.js (b9735a9^), since the titles no longer match the original ones.

## 2026-11-02 · charly · charly · done: two more doc fixes
Added to PR #10. Mount Rainier spelled right; Film photo 12 retitled The Pole Field. Data only.

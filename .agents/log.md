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

## 2026-11-05 · charly · charly · done: no pillar, rooms fit their photos, phone view, phone map
Ready for Adam (PR charly -> adam). Charly chose to drop the pillar:
- The room's number, name and blurb are now a sign on the hallway side of the entrance wall, left of the arch (above it on phones). Hallway renders it; clicking it walks up to read it (measure('intro') uses hallFaceFor). GEO.pillar, pillarFor, the Pillar component, the Slab cuts at the pillar, the behind-pillar culling in markUnseen and all pillar CSS are gone. GEO.doorCam is -1.1 (was -0.8) so the sign fits beside the arch; Adam, your `tall` check uses doorCam, so please re-check the doorway at Retina, especially Nature, now that more of the room is in view through the arch with nothing in front of it.
- With no pillar to walk round, rooms are as small as their photos need (GEO.minD 1.7, minL 1.8 instead of D 2.52 / minL 2.4); corner views just stay inside the room. Benches is now 2.36 x 1.70 S, photos about 0.1 S from every corner. Spare wall is shared equally at both ends (spareW gone).
- Phones: roomScale is min(h, 1.6 w) (CSS --S min(--H, 160vw)), so photos are bigger in the walk; up close the photo fills 95% (FILL_PHONE) and the arrows fade out after a moment, a touch wakes them (.turn.wake). The map now opens and folds like a book on phones too; the flaps copy the paper's scroll when folding.
Checked in desktop Chrome and Chrome's 375x812 phone emulation, not on a real phone or Safari.

## 2026-11-05 · charly · charly · done: enter arrow, order from the right, phone stability, phone directory
Pushed to charly; no PR yet (Charly will ask for one when he's previewed it).
- Doorway: no side arrows or swipe. An ENTER arrow lies on the hallway floor (RoomBox EnterMark, GEO.enter); clicking it, Enter/Space/Up or a scroll down goes in, always to the right (cam.enter(1)). Inside, the arrows walk left/right as before.
- Hanging order starts on the right: distribute() fills S (right to left as you face it), then E, then N; with entrance photos (Nature) photo 1 is beside the door on the S side. Up close, the left arrow is photo n+1, the right n-1 (physical sides).
- Exit fades the room to black and goes to '/'; cam.leave is gone.
- Plaques: a line per detail (metaParts); labels are as wide as their longest line (max 0.16 S), with an invisible copy in the reflection row so reflections stay aligned.
- Benches "1st and 9th swapped": the same images were renumbered on Nov 1 and photos/ is cached for a week, so browsers showed old 03-wall.jpg (now 09). Photo URLs now carry ?v=<hash> (photo-sizes.json `v`; compress-photos.js writes it).
- Phone stability: tiles 0.9 S on phones, canvases freed on unmount, per-frame view culling on phones (see room-walkaround-rendering.md). Hallway floor is solid (desktop now draws it at the door, since doorCam -1.1 makes landscape count as `tall`, and room reflections showed through it). Adam: worth a Retina look at the door now that the hall floor shows on desktop.
- Phone lobby: the room signs are back, two columns under the lettering (smaller lettering, no counts, on short phones).
Checked in headless Chrome (390x844 @3, 375x667, 1440x900), not on a real phone or Safari.

## 2026-11-06 · charly · charly · done: quieter enter mark, seamless arch, map without numbers, faster zoom, doc fixes
Pushed to charly; no PR yet (Charly will ask).
- ENTER floor mark is a small thin-stroke arrow over spaced capitals (GEO.enter 0.15 S wide, 0.2 S deep), no pulse.
- Arch: ArchPanel is now an ordinary full-height .panel (same paint/grain/pattern, background lined up) with the opening cut by clip-path: path(); it overlaps each neighbour by 1px, so no seam or see-through gap. The reveal has 48 facets (was 14), shaded from the left jamb's tone through the crown to the right jamb's (--m per facet). The SVG arch and its .arch .s0/.s1 CSS are gone. Adam: clip-path on a 3D plane is new here; worth a Retina/Safari look at the door.
- Room numbers gone everywhere they showed: map plan (and its photo-count ticks; icon and name now centred in each box), map key and pick panel, the hallway sign, and the loading curtain (kicker is site.name). room.num still exists in data.
- Zoom twice as fast: dolly IN 850 / OUT 650 ms, lead-in 210 ms, lamp ripple 35 ms, lights back on sooner. Slab is memo'd and Tile's deps use dirs.join(): before, every route change redrew all floor/ceiling canvases and froze the start of each move ~0.4 s.
- Data from Charly's doc: Lifeguard tower camera Pentax 6x7, "Skateboarder at City Hall"; also fixed "Pentax 67" -> "Pentax 6x7" for Bench above the lake and Ferrari GT car (in the doc too).
Checked in headless Chrome (1440x900 @1/@2, 390x844 @3). A faint hairline is left where the arch springs.

## 2026-11-06 · charly · charly · done: enter arrow style, whole archway goes in
Pushed to charly; no PR yet. ENTER floor arrow: square caps and a mitred point like the lobby signs' Arrow, and its gentle pulse is back. The whole archway is a click target from the hallway (button.enter-door on the hall-wall, the arch's size; hidden once in). At the door the room's frames, labels and exit sign take no clicks (.stage.at-door), so a click on a photo seen through the arch goes in instead of zooming. Checked in headless Chrome (1440x900, 390x844).

## 2026-11-06 · charly · charly · done: enter arrow as one shape, dark on pale floors
Pushed to charly; no PR yet. The floor arrow was three stroked lines that the non-uniform SVG stretch pulled apart (the stem's square cap poked out past the tip); it's now one filled outline, stem and head together. On pale floors (themes white and sky) the mark is dark (--mark #2e2c28); elsewhere it stays off-white.

## 2026-11-06 · charly · charly · started: collage mode
A second way to see a room: every photo on one flat wall, packed salon-style, with free pan and zoom; tap a photo to zoom in on it. A Gallery | Collage switch in each room (the choice is remembered from room to room), and an "All photos" wall (every photo on the site, one wall, scattered) from the map's middle box, where "Hall" was. New page src/pages/Collage.jsx and routes /room/:slug/collage, /collage; touches App.jsx, Room.jsx (the switch), GalleryMap.jsx and index.css.

## 2026-11-06 · charly · charly · done: collage mode
Pushed to charly; no PR yet (Charly will ask). See .agents/knowledge/collage-mode.md.
- Gallery | Collage switch at the top of every room (App renders ModeSwitch); the choice is remembered (localStorage) and rooms open in it. Collage: the room's photos salon-hung on one flat wall in the room's paint and frames; drag, pinch, scroll/ctrl-scroll or +/-/0 keys; a click zooms in on a photo (850 ms, wall goes dark, caption under it, arrows/swipe/arrow keys step, Esc or a click off it goes back).
- The map's middle box (was "Hall") is now All photos -> /collage: every photo once, scattered, white wall. Also a row in the map key.
- New: scripts/thumbs.js makes public/photos/*/NN-thumb.jpg (560 px) from the wall copies and records `thumb`/`tv` in photo-sizes.json; `npm run photos` runs it after compress-photos.
- useDolly exports bezier; usePreload takes an optional minimum time.
Adam: worth an iOS Safari look at pinch and at the wall's sharpness after a zoom (it drops will-change at rest to redraw). Checked in headless Chrome (1440x900, 390x844 @3, touch emulation), not on a real phone.

## 2026-11-06 · charly · charly · done: All photos favours Favorites, Film, Travel
Pushed to charly; no PR yet. On the All photos wall, photos from Favorites, Film and Travel (Charly's picks) hang bigger: salonHang takes `favored(photo)`; favoured photos get weight 3, the rest 1 or 2, so they come out about 1.4-1.5x as wide (median) without breaking the packing. A swap in the hill-climb now carries the photo's weight with it. Room collages are unchanged in kind (no favoured photos: weights 1, 2 or 4 as before).

## 2026-11-06 · charly · charly · started: front desk props and a hidden Charly
Charly wants the lobby more serious: Charly and his name plate hidden by default, a call bell on the desk left of the maps (dings; three quick rings pop him up from behind the desk with the name plate, three more send him down). Clickable props, each with a small animation and a sound (Web Audio, no files): umbrellas drip into the bucket, a featured print on the wall behind the desk (picture light, goes to that photo), a wall clock above the signs (real time), a snake plant and a velvet rope on brass posts right of the desk. Touches Lobby.jsx, index.css (lobby section), gallery.js (site.featured), new src/sound.js.

## 2026-11-06 · charly · charly · done: front desk props and a hidden Charly
Pushed to charly; no PR yet. Lobby.jsx:
- Charly and his name plate are hidden by default (.charly .breathe translated 340px down, clipped at the desk top). A call bell (Bell) sits on the desk left of the maps; three rings within 1.3 s pop him up (sound.pop, .charly.up), and he waves, says welcome and the name plate rises 0.9 s later. Three more send him down. His wave/jaw/bubble animations now key on .charly.up instead of .stage.ready.
- New wall layer .dl-wall (drifts like the signs): a featured print (site.featured in gallery.js, now Favorites' Delicate Arch) under a brass picture light with a "Now showing" label; click: the light comes up, then it opens that photo in its room (in collage if that's the remembered mode). A wall clock above the signs showing local time; click: tick-tock and the second hand sweeps round once (its angle only ever increases, so no backwards spin).
- Floor: umbrellas shake and four drops run down into the bucket with ripples; a velvet rope on brass posts swings; a snake plant rustles. Clock, rope and plant are hidden on phones (outside the desk's width there); the print is 0.84x there to clear the signs.
- src/sound.js: every sound made with Web Audio on click (bell, drip, tick, rustle, clink, light click, pop); nothing loaded.
Checked in headless Chrome (1440x900, 390x844), sounds not heard (headless).

## 2026-11-06 · charly · charly · done: front desk layout tidy
Pushed to charly; no PR yet. Featured print bigger (296 px) and higher (top 214), no picture light (lamp and wash gone; hover/click just brighten it); its label now sits to its left. The clock moved off the ceiling to the wall between the lettering and the print, over the label. The signs are 42 px higher (top 118 dk), clear of the map stand. The snake plant is drawn back to front like the umbrella stand (soil and back rim, leaves, then the planter's front with the near half of the rim), so the leaves go down inside the pot.

## 2026-11-06 · charly · charly · done: clock and print label gone; "Start here" at the maps
Pushed to charly; no PR yet. The wall clock (and sound.tick) and the print's "Now showing" label are removed. The map stand stands out more, as Charly chose: on a first visit (localStorage `charlyzhang.seen-desk`) a red ink circle draws itself round the stand with "Start here" and an arrow (Lobby.jsx StartHere), fading after 6.5 s or at the first pointerdown; on every visit the top map sheet lifts and settles every 8 s (map-flutter, off for reduced motion). Note: `.desk-scene svg` sizes every svg in the scene to 100%, so a positioned svg needs a more specific selector (see .start-here .sh-ring).

## 2026-11-06 · charly · charly · done: one drift for the lobby, bigger print, Start here tidy
Pushed to charly; no PR yet. The lobby's pointer parallax is one movement now: wall, floor, lettering, signs and every desk-scene layer all drift by the wall's 6 px x / 3 px y (the desk at 28 px and Charly at 15 px looked like they slid on the floor; the floor's own 12 px is gone too). Featured print 336 px, top 172 (0.62x on phones). Start here: the stand's red dot hides while the ring is up, and the note and arrow sit clear of the ring (on phones the note is higher).

## 2026-11-06 · charly · charly · done: phone front desk layout
Pushed to charly; no PR yet. On phones the room signs are one column at the top right, beside the lettering and as tall as it (--lh, measured), instead of two columns under it. The featured print fills the wall below: Lobby.jsx fitPhoneWall sizes and places it (--fs, --fx, --fy on the stage) from under the lettering down to the welcome card, and from the lettering's left edge across to the map stand, measured on load, font load and resize. Short phones keep the counts now (lettering zoom 0.7, a little higher). Desktop unchanged. Checked at 412x915, 390x844, 375x667.

## 2026-11-06 · charly · charly · done: phone print centred
Pushed to charly; no PR yet. On phones the featured print is centred on the screen and the desk now (--fx gone): fitPhoneWall takes the bigger of two fits, down to the welcome card but narrow enough to clear the map stand on both sides, or full width but ending above the stand and the first visit's note.

## 2026-11-06 · charly · charly · done: ready for Adam (PR charly -> adam)
Everything since #12 is in one PR for Adam: the doorway/room fixes (2026-11-05 and the first 2026-11-06 entries), collage mode and the All photos wall, and the front desk props with Charly hidden behind the bell. Worth a Mac look: iOS Safari pinch and sharpness on the collage walls, the clip-path arch at the door, Web Audio sounds on Safari (they start from a click), and the phone front desk layout (measured in Lobby.jsx fitPhoneWall).

## 2026-11-07 · charly · charly · done: phone rendering, collage close-up, lobby on iPhone, a stop for every photo
Pushed to charly; no PR yet (Charly will ask).
- Phone rooms dropped layers (Charly's Pixel 10: black floor patches, empty frames, map brochure gone). Reproduced with headless Chrome `--force-gpu-mem-available-mb=64` at 412x770; fixed for phones only: flat frames (no edge faces), no lamp beams/pools, 16 arch facets, 288 px floor canvases, 0.55 S hallway tiles. All rooms draw whole at 56 MB now. Details and the test in room-walkaround-rendering.md. Visible change on phones: no light cones/pools on the walls (the lamps stay), frames flat to the wall.
- Collage close-up: the left/right arrow buttons are gone (swipe and arrow keys still step); the photo gets the width they took on desktop.
- Lobby floor/ceiling planes cut to the depth a screen shows (1.2 S / 0.9 S, were 1.8 S): Adam's brother's iPhone (Chrome = WebKit) drew no floor or ceiling at the front desk. Looks identical in Chrome. Adam: please confirm in the iOS simulator; I can't run WebKit 3D here.
- Every photo has a stop of its own now, including the first and last on each wall, which were only ever seen from the corner views; the corners stay as views on the way between walls (as in Favorites).

## 2026-11-07 · charly · charly · done: ready for Adam (PR charly -> adam)
The 2026-11-07 fixes are in a PR for Adam. Please check the front desk floor and ceiling in the iOS simulator (the reason for the change), and a room doorway on an iPhone.

## 2026-11-07 · charly · charly · done: lamp light back on phones
Pushed to charly (in PR #16). Charly wanted the lights back on phones. Pools are back, still (no sway); the beam on a phone is a CSS soft fan of light down the wall (`.fw::before`, in the max-width: 700px block) instead of the 3D SVG cone, which stays a layer a photo however it's set. All rooms draw whole at a 64 MB GPU cap with the lights; Nature is borderline at 56 (it passed without the lights).

## 2026-11-07 · charly · charly · done: lamp light PR ready for Adam
#16 was merged before the lamp light change landed, so it goes up in a PR of its own.

## 2026-11-07 · charly · charly · done: real light cone on phones
Pushed to charly; no PR yet. The CSS fan (`.fw::before`) from #18 is gone: Charly saw flat sideways light, not a cone. Phones draw the desktop's SVG beam again, still (no sway).

## 2026-11-07 · charly · charly · done: light cone PR ready for Adam
PR charly -> adam for the real light cone on phones (after #18's flat fan).

## 2026-11-07 · charly · charly · done: no beam haze over the photo in iPhone browsers
Pushed to charly; no PR yet. On an iPhone (Safari, and Chrome since it's WebKit too), opening a photo washed it in white haze. Up close on a phone the camera is nearer the wall than the lamp, so the lit frame's beam sits behind the camera. Chrome clips it, but WebKit draws it magnified across the photo. Phones now fade out the lit frame's beam while a photo is open (`.room.stage.dark .fw.lit .beam`, in the max-width: 700px block). Desktop is unchanged. Adam: please check a close-up in the iOS simulator, since I can't run WebKit here.

## 2026-11-07 · charly · charly · done: collage by default on phones, swipe by direction
Pushed to charly; no PR yet.
- `getViewMode()` (src/viewMode.js) now falls back to collage on phones (max-width: 700px) when nothing is stored, and to gallery elsewhere. Once someone picks with the switch, their choice is remembered as before.
- Up close in a collage, a swipe or arrow key (all four directions now) goes to the nearest photo on the wall that lies in that direction, favouring ones straight across. It used to go to the next photo in hang order, which jumped round the wall. At the wall's edge it stays put. The `order` list in Collage.jsx is gone.

## 2026-11-07 · charly · charly · done: collage default, swipe by direction and beam haze PR ready for Adam
PR charly -> adam with the iPhone beam haze fix, collage by default on phones, and swiping to the photo in that direction. Please check a gallery close-up in the iOS simulator; the haze only shows in WebKit.

## 2026-11-07 · charly · charly · done: iPhone lobby floor/ceiling, smooth room floors
Pushed to charly; no PR yet. From Charly's iPhone Safari screenshots:
- The front desk still had no floor or ceiling on iPhone after the shorter planes in #20. A phone's lobby doesn't move, so it no longer uses a 3D scene there. `.stage.lobby` has `perspective: none`, `.cam` and `.world` are flat, and `.floor3d` and `.ceil3d` each carry the stage's perspective in their own transform (`translateY(-d) perspective(2S) translateY(d) rotateX(...)`, with the eye 0.34 S above the floor line and 0.4 S below the ceiling line). In Chrome it looks the same as before. The ceiling line is raised to 0.04 S on phones (was 0.07 S) to give the lettering room under it.
- The Favorites floor came out in blocks on iPhone. Safari doesn't smooth a canvas pattern it shrinks by about 7x (a 1024 px texture into a repeat of about 140 canvas px). `Tile` in RoomBox.jsx now shrinks each texture in halving steps first (`shrinkImage`, sizes rounded up to 64 px and cached), and every room's floor and ceiling textures go through it.
- Charly's screenshot also showed the Favorites walls without photos at the doorway, which they have in Chrome. I couldn't find why without WebKit; Adam, please look in the iOS simulator.

## 2026-11-07 · charly · charly · done: iPhone lobby and floors PR ready for Adam
PR charly -> adam with the flat phone lobby floor and ceiling, the higher ceiling line, and smoothly shrunk floor textures. Please check in the iOS simulator: the front desk, the Favorites doorway (blocky floor, and photos missing in Charly's screenshot).

## 2026-11-07 · charly · charly · done: no glow haze over the photo on iPhone
Pushed to charly; no PR yet. With the beam hidden (#22), Charly's iPhone still showed a grey haze over an opened photo. My #22 note blamed it all on the beam, but it was mostly the lit frame's `.glow`. On phones the frames are flat to the wall (`.room .frame { transform: none }`), so the frame and its glow lie in one plane, and WebKit draws either on top. The lit frame now gets `translateZ(1px)` on phones while the room is dark (`.room.stage.dark .fw.lit .frame`). That's one extra layer, for the photo you're on only. Chrome looks the same. Adam: please check a close-up in the iOS simulator.

## 2026-11-07 · charly · charly · done: light cone back up close on phones
Pushed to charly; no PR yet. Charly wants the cone above the photo you're on. The `.room.stage.dark .fw.lit .beam { opacity: 0 }` phone rule from #22 is gone: the iPhone haze was the glow (fixed by the lit frame's `translateZ(1px)`), not the beam. Adam: in the iOS simulator, check that a close-up shows the cone above the photo and no haze over it.

## 2026-11-07 · charly · charly · done: glow haze and light cone PR ready for Adam
PR charly -> adam: on phones the photo you're on stands in front of its glow, and the light cone stays above it up close. Please check a close-up in the iOS simulator.

## 2026-11-08 · adam · adam · started: iPhone close-up glow haze
Picking up Charly's handoff. Touches the phone block in index.css (the lit frame's glow).

## 2026-11-08 · adam · adam · done: iPhone close-up glow haze
Fixed and checked in the iPhone 17 simulator (Moon Rose, Delicate Arch, Delicate Arch Under the Milky Way, Snowy Bench): the photo is clean up close, and the light cone above it stays. Hiding `.glow` in the simulator removed the haze, so it was the glow. `translateZ(1px)` (#26), `z-index` and `isolation` didn't help, because Safari drew the glow over the frame regardless. On phones `.room .glow` is `display: none` now, and the lit frame in a dark room gets the glow as an outer `box-shadow` instead (it fades in over 0.3 s at `--on`). The `translateZ(1px)` rule is gone. Desktop is unchanged. Charly: if you restyle the phone glow, change that box-shadow, not `.glow`. See ios-safari-testing.md.

## 2026-11-08 · adam · adam · done: Favorites photos missing from the doorway on iPhone/iPad
The Favorites bays stood empty from the doorway in Safari (iPhone and iPad simulators): each bay and its photos were both at `translateZ(var(--bay))`, the same plane, and WebKit drew the bay over them. Hiding `.bay` brought them back. `.solo .frames` now stands `0.004 S` in front of the bay's face, at all screen sizes. Checked the Favorites doorway on iPhone 17 and iPad Pro 11 simulators, a close-up on iPhone, and desktop Chrome. Only solo rooms have bays, which is why the other rooms were fine.

## 2026-11-12 · adam · adam · started: deploy from GitHub Actions, both of us ship to main
The repo moved to github.com/charlyzhang-org/charlyzhang.org (private, org-owned), where Vercel's Hobby Git integration can't deploy. Moving deploys to a GitHub Actions workflow with Adam's Vercel token, and changing the pipeline so Charly can merge his own work into main. Touches .github/workflows, .claude/hooks/sync.sh, CLAUDE.md, .agents/knowledge/vercel-deploys.md.

## 2026-11-12 · adam · adam · done: deploy from GitHub Actions, both of us ship to main
The repo is now github.com/charlyzhang-org/charlyzhang.org. Charly: point your clone at it (`git remote set-url origin https://github.com/charlyzhang-org/charlyzhang.org`); the sync hook warns if you haven't.
- Deploys go through `.github/workflows/deploy.yml` with Adam's Vercel token. Vercel's Git integration is disconnected, so the red `Vercel` check is gone for good.
- Every push to `charly` or `adam` deploys a preview to https://charlyzhang-charly.vercel.app / https://charlyzhang-adam.vercel.app (public, about 1 min). `main` deploys charlyzhang.org.
- **New pipeline:** `charly` → `main` and `adam` → `main`, each merged by its own person (merge commit only). The `charly` → `adam` step is gone, and `charly`'s upstream in sync.sh is now `main`. The steps are in CLAUDE.md under "Doing a piece of work".
- Charly can ship without the Mac checks. Flag rendering/3D/phone-CSS changes in your `done` entry for Adam to check in the iOS simulator.

## 2026-11-12 · adam · adam · started: move hosting from Vercel to Cloudflare Pages
Vercel Hobby blocks CLI deploys of commits Charly wrote (it reads the commit author from .git and he isn't on the team), so his previews and his own merges to main can't deploy there. Moving to Cloudflare Pages (free, unlimited deployers; the charlyzhang.org DNS is already on Cloudflare). Touches deploy.yml, vercel.json → public/_redirects + public/_headers, CLAUDE.md, knowledge docs.

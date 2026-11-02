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

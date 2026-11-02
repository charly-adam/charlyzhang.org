# charlyzhang.org

Charly Zhang's photography site: a walk-through 3D gallery (React 19, Vite, Tailwind 4, CSS 3D), deployed on Vercel.

## Two agents, one repo

Adam and his brother each run Claude Code on their own clone. You never talk to the other agent directly: **git is the only channel**. The other agent knows only what has been pushed, and you know only what you have pulled. So pull before you work, push as you go, and write down what the other agent needs to know.

### The pipeline: `charly` → `adam` → `main`

Each person has one long-lived branch, and work moves up a step at a time:

- **`charly`**: Charly's agent works here. Charly tests locally (`npm run dev`, `npm run build`, `npm run preview`). When a piece of work is ready, his agent opens a PR **`charly` → `adam`**.
- **`adam`**: Adam's agent works here, and it is where Charly's work gets checked. Adam merges Charly's PRs into `adam` with a merge commit. Because that commit is Adam's, Vercel builds a **preview** of `adam`, which is the only preview of Charly's work. Adam's side also runs the Mac-only checks (iOS Safari simulator, headless Chrome).
- **`main`**: production. Only a PR **`adam` → `main`**, merged by Adam with a merge commit, updates it, and that deploys the site.

Work also flows back down: whatever lands on `adam` gets merged into `charly`, and whatever lands on `main` gets merged into `adam`. The SessionStart hook does this for you.

### Every session

A SessionStart hook ([.claude/hooks/sync.sh](.claude/hooks/sync.sh)) fetches, then on your branch:
- fast-forwards to what's been pushed to it from elsewhere,
- merges in its upstream (`adam` for `charly`, `main` for `adam`) when the tree is clean, and stops without merging if that would conflict.

Then it prints what's **waiting at each step** of the pipeline (commits, files and log entries), any other open branches, and the end of the shared log.

Read that output before you do anything. If it pulled or merged, push (`git push`). If it reports a conflict or a diverged branch, sort that out first, or tell your human.

### Doing a piece of work

1. **Be on your own branch**: `charly` or `adam`, whichever matches your human (the first word of `git config user.name`, lowercase). If it doesn't exist locally yet, run `git switch <name>`. Never work on `main` or on the other person's branch.
2. **Check for overlap.** If work waiting in the pipeline touches the same files, keep your change away from those lines if you can. If you can't, say so in your log entry and tell your human before you go on.
3. **Claim the work.** Your first commit adds a `started` entry to [.agents/log.md](.agents/log.md). Push it right away so the other agent sees it.
4. **Commit and push at each working step.** Unpushed work is invisible to the other agent. Keep each commit to one thing and keep it building, because Adam may take your branch at any point.
5. **When it's ready**, check that `npm run build` passes and add a `done` entry to the log. Then:
   - **Charly's agent**: open (or update) a PR `charly` → `adam`, and say in the log entry that it's ready for Adam. Don't merge it yourself. Ignore the failing `Vercel` check on it (see [vercel-deploys.md](.agents/knowledge/vercel-deploys.md)).
   - **Adam's agent**: when Adam says so, open a PR `adam` → `main` and merge it with a merge commit (`gh pr merge --merge`), then check the production deploy.
6. **Reviewing Charly's PR** (Adam's agent): when Adam asks, read the diff, merge it into `adam` with `gh pr merge --merge`, run `npm run build`, and check the Vercel preview of `adam`. Run the Mac checks from [.agents/knowledge/](.agents/knowledge/) on whatever Charly changed. Fix problems on `adam`, log what you changed, and tell Adam.

Rules:
- **Merge, never rebase or squash.** Commits from `charly` live on in `adam` and `main`, so rewriting them duplicates them and causes conflicts. Bring in upstream changes with `git merge origin/<upstream>`.
- Never force-push `adam`, `charly` or `main`, and never commit straight to `main`.
- GitHub enforces most of this with rulesets: `main` changes only by a PR that Adam merges, `adam` takes pushes and merges only from Adam, no branch of the three can be force-pushed or deleted, and PRs merge only with a merge commit. If a push is rejected by a rule, that's the workflow working; don't look for a way round it, tell your human.
- Never push to the other person's branch. If you need their change before it reaches you, ask your human; don't cherry-pick it.
- For a big or risky experiment, you can branch off your own branch (`charly/<topic>`), then merge it back into yours when it works.
- When a conflict is about intent, not just text, don't guess. Keep their version, note it in the log, and ask your human.

### The shared log: [.agents/log.md](.agents/log.md)

This is the handoff between agents. Add entries only at the end, and never edit or delete someone else's entry. Git merges this file with `merge=union` ([.gitattributes](.gitattributes)), so two people adding entries at the same time never conflict. Use this format:

```
## 2026-11-01 · adam · adam · started: map labels
Moving the map labels under the room boxes. Touches GalleryMap.jsx and index.css.

## 2026-11-01 · adam · adam · done: map labels
Labels sit under the boxes now. Heads-up: .map-label is gone; use .map-room .name.
```

Write what the other agent couldn't get from the diff: why, what's half-done, what to avoid, and anything that would surprise them.

### Shared knowledge: [.agents/knowledge/](.agents/knowledge/)

Lasting project facts go here, one topic per file: things you learned the hard way, how to test, and rules that keep things from breaking. They do **not** go in your personal auto-memory (`~/.claude/projects/.../memory`), because the other agent can't see it. Personal memory is only for things about your own human, such as how they like to work. Add each new file to the index below, and update a file when it turns out to be wrong.

- [room-walkaround-rendering.md](.agents/knowledge/room-walkaround-rendering.md): Chrome tile memory limits for the 3D rooms: small planes, canvas tiles, doorway culling, and how to measure with LayerTree
- [headless-chrome-3d-screenshots.md](.agents/knowledge/headless-chrome-3d-screenshots.md): screenshotting and driving the rooms in headless Chrome; keep the GPU on
- [ios-safari-testing.md](.agents/knowledge/ios-safari-testing.md): testing in the Xcode iPhone/iPad simulator, and what Safari gets wrong with 3D planes
- [vercel-deploys.md](.agents/knowledge/vercel-deploys.md): only Adam's commits deploy (Hobby plan), so Charly's work gets previewed after Adam merges it into `adam`

Read the relevant file before changing room surfaces, rendering or anything you will test visually.

## Project

- `npm run dev` / `npm run build` / `npm run preview`
- All gallery content (rooms, photos, themes) lives in [src/data/gallery.js](src/data/gallery.js). Its header explains how to add photos and rooms.
- `photos-originals/` is gitignored, so each clone has its own (or none). `npm run photos` makes the web copies in `public/photos/` and records their sizes in `src/data/photo-sizes.json`, and both of those are committed. Without originals the script does nothing, which is safe. Only the person who has a photo's original should regenerate it.
- Room geometry: [src/room/geometry.js](src/room/geometry.js). Rooms: [src/pages/Room.jsx](src/pages/Room.jsx). Lobby: [src/pages/Lobby.jsx](src/pages/Lobby.jsx).
- **README stays as just the title and the site link.** Put guidance in code comments or here, never in the README.

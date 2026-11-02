# charlyzhang.org

Charly Zhang's photography site: a walk-through 3D gallery (React 19, Vite, Tailwind 4, CSS 3D), deployed on Vercel.

## Two agents, one repo

Adam and his brother each run Claude Code on their own clone. You never talk to the other agent directly: **git is the only channel**. The other agent knows only what has been pushed, and you know only what you have pulled. So pull before you work, push as you go, and write down what the other agent needs to know.

### Every session

A SessionStart hook ([.claude/hooks/sync.sh](.claude/hooks/sync.sh)) fetches, fast-forwards `main` when it safely can, and prints:
- new commits on `main`,
- the other agent's **in-flight branches**, with the files each one touches and its log entries,
- the end of the shared log.

Read that output before you do anything. If it says the pull failed or `main` diverged, sort that out first and tell your human.

### Doing a piece of work

1. **Start from fresh main**: `git fetch && git switch -c <name>/<topic> origin/main`. `<name>` is your human's first name in lowercase (from `git config user.name`), e.g. `adam/map-labels`.
2. **Check for overlap.** If an in-flight branch touches the same files, keep your change away from those lines if you can. If you can't, say so in your log entry and tell your human before you go on.
3. **Claim the work.** Your first commit adds a `started` entry to [.agents/log.md](.agents/log.md). Push the branch right away (`git push -u origin HEAD`) so the other agent sees it.
4. **Commit and push at each working step.** Unpushed work is invisible to the other agent.
5. **Before the PR**, run `git fetch && git rebase origin/main`, fix any conflicts, and check that `npm run build` passes.
6. **Open a PR into `main`** (`gh pr create`). Add a `done` entry to the log in the same PR. Merge only when your human says so. After the merge, delete the branch. Only Adam's commits deploy on Vercel, so Adam merges Charly's PRs (see [vercel-deploys.md](.agents/knowledge/vercel-deploys.md)).

Rules:
- Never commit straight to `main`, and never force-push it.
- Never push to, rebase or delete the other person's branch. To build on their work before it merges, branch off theirs and say so in the log.
- `git push --force-with-lease` is fine on your own branch after a rebase.
- When a conflict is about intent, not just text, don't guess. Keep their version, note it in the log, and ask your human.

### The shared log: [.agents/log.md](.agents/log.md)

This is the handoff between agents. Add entries only at the end, and never edit or delete someone else's entry. Git merges this file with `merge=union` ([.gitattributes](.gitattributes)), so two people adding entries at the same time never conflict. Use this format:

```
## 2026-11-01 · adam · adam/map-labels · started
Moving the map labels under the room boxes. Touches GalleryMap.jsx and index.css.

## 2026-11-01 · adam · adam/map-labels · done
Labels sit under the boxes now. Heads-up: .map-label is gone; use .map-room .name.
```

Write what the other agent couldn't get from the diff: why, what's half-done, what to avoid, and anything that would surprise them.

### Shared knowledge: [.agents/knowledge/](.agents/knowledge/)

Lasting project facts go here, one topic per file: things you learned the hard way, how to test, and rules that keep things from breaking. They do **not** go in your personal auto-memory (`~/.claude/projects/.../memory`), because the other agent can't see it. Personal memory is only for things about your own human, such as how they like to work. Add each new file to the index below, and update a file when it turns out to be wrong.

- [room-walkaround-rendering.md](.agents/knowledge/room-walkaround-rendering.md): Chrome tile memory limits for the 3D rooms: small planes, canvas tiles, doorway culling, and how to measure with LayerTree
- [headless-chrome-3d-screenshots.md](.agents/knowledge/headless-chrome-3d-screenshots.md): screenshotting and driving the rooms in headless Chrome; keep the GPU on
- [ios-safari-testing.md](.agents/knowledge/ios-safari-testing.md): testing in the Xcode iPhone/iPad simulator, and what Safari gets wrong with 3D planes
- [vercel-deploys.md](.agents/knowledge/vercel-deploys.md): only Adam's commits deploy (Hobby plan); Charly's PRs fail the Vercel check on purpose and Adam merges them

Read the relevant file before changing room surfaces, rendering or anything you will test visually.

## Project

- `npm run dev` / `npm run build` / `npm run preview`
- All gallery content (rooms, photos, themes) lives in [src/data/gallery.js](src/data/gallery.js). Its header explains how to add photos and rooms.
- `photos-originals/` is gitignored, so each clone has its own (or none). `npm run photos` makes the web copies in `public/photos/` and records their sizes in `src/data/photo-sizes.json`, and both of those are committed. Without originals the script does nothing, which is safe. Only the person who has a photo's original should regenerate it.
- Room geometry: [src/room/geometry.js](src/room/geometry.js). Rooms: [src/pages/Room.jsx](src/pages/Room.jsx). Lobby: [src/pages/Lobby.jsx](src/pages/Lobby.jsx).
- **README stays as just the title and the site link.** Put guidance in code comments or here, never in the README.

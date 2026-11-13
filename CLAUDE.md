# charlyzhang.org

Charly Zhang's photography site: a walk-through 3D gallery (React 19, Vite, Tailwind 4, CSS 3D), deployed on Vercel.

## Two agents, one repo

Adam and his brother each run Claude Code on their own clone. You never talk to the other agent directly: **git is the only channel**. The other agent knows only what has been pushed, and you know only what you have pulled. So pull before you work, push as you go, and write down what the other agent needs to know.

### Branches: `adam`, `charly`, `main`

Repo: https://github.com/charlyzhang-org/charlyzhang.org (private, owned by the `charlyzhang-org` organisation).

Each person has one long-lived branch, and **each ships their own work to `main`**:

- **`charly`** and **`adam`**: each agent works on its own. Every push deploys a **preview** to a link that stays the same, **https://charlyzhang-charly.vercel.app** or **https://charlyzhang-adam.vercel.app**, about a minute later.
- **`main`**: production, **https://charlyzhang.org**. A PR from your branch to `main`, merged with a merge commit, deploys it. Either person can merge their own PR when they say it's ready.

Deploys run in GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)), not through Vercel's Git integration. See [vercel-deploys.md](.agents/knowledge/vercel-deploys.md).

Whatever lands on `main` gets merged back into both branches. The SessionStart hook does this for you.

### Every session

A SessionStart hook ([.claude/hooks/sync.sh](.claude/hooks/sync.sh)) fetches, then on your branch:
- fast-forwards to what's been pushed to it from elsewhere,
- merges in `main` when the tree is clean, and stops without merging if that would conflict.

Then it prints what each branch has that **isn't on `main` yet** (commits, files and log entries), any open PRs and other branches, and the end of the shared log.

Read that output before you do anything. If it pulled or merged, push (`git push`). If it reports a conflict, a diverged branch or a wrong `origin`, sort that out first, or tell your human.

### Doing a piece of work

1. **Be on your own branch**: `charly` or `adam`, whichever matches your human (the first word of `git config user.name`, lowercase). If it doesn't exist locally yet, run `git switch <name>`. Never work on `main` or on the other person's branch.
2. **Check for overlap.** If the other branch has work not yet on `main` that touches the same files, keep your change away from those lines if you can. If you can't, say so in your log entry and tell your human before you go on.
3. **Claim the work.** Your first commit adds a `started` entry to [.agents/log.md](.agents/log.md). Push it right away so the other agent sees it.
4. **Commit and push at each working step.** Unpushed work is invisible to the other agent. Keep each commit to one thing and keep it building. Each push updates your preview link, so your human can try it on a phone.
5. **Check the deploy after a push**: `gh run list --branch <name> -L 1`, then `gh run watch <id>`. If it failed, `gh run view <id> --log-failed` shows why.
6. **Ship when your human says so:**
   1. `git fetch && git merge origin/main`, then resolve any conflicts. Ship only on top of the latest `main`.
   2. `npm run build` must pass. Add a `done` entry to the log, then commit and push.
   3. `gh pr create --base main --head <name> --fill` (or update the open one), then `gh pr merge --merge`. Never use `--squash` or `--rebase`.
   4. Watch the production deploy (`gh run list --branch main -L 1`, then `gh run watch <id>`), and check https://charlyzhang.org.
7. **Mac-only checks.** The iOS Safari simulator and headless Chrome checks in [.agents/knowledge/](.agents/knowledge/) need Adam's Mac. Charly can ship without them. If a change touches 3D rendering, room surfaces or phone CSS, say so in the `done` entry (e.g. "Adam: please check the Favorites close-up in the iOS simulator"). Adam's agent picks these notes up from the log, runs the checks, and fixes problems on `adam`.

Rules:
- **Merge, never rebase or squash.** Commits from each branch live on in `main` and in the other branch, so rewriting them duplicates them and causes conflicts. Bring in `main` with `git merge origin/main`.
- Never force-push `adam`, `charly` or `main`, and never commit straight to `main`: always go through a PR.
- GitHub doesn't enforce any of this (no branch protection), so it's on you to keep to it. Squash and rebase merges are switched off in the repo settings, so every PR merges with a merge commit.
- Never push to the other person's branch, and don't merge their PR. If you need their change before it reaches `main`, ask your human; don't cherry-pick it.
- For a big or risky experiment, you can branch off your own branch (`charly/<topic>`), then merge it back into yours when it works. Topic branches don't deploy.
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
- [vercel-deploys.md](.agents/knowledge/vercel-deploys.md): deploys go through GitHub Actions with Adam's Vercel token; branch preview links, secrets, and what to do when a deploy fails
- [collage-mode.md](.agents/knowledge/collage-mode.md): collage mode and the All photos wall: routes, the remembered switch, the salon-hang layout, image sizes, and keeping it off the GPU

Read the relevant file before changing room surfaces, rendering or anything you will test visually.

## Project

- `npm run dev` / `npm run build` / `npm run preview`
- All gallery content (rooms, photos, themes) lives in [src/data/gallery.js](src/data/gallery.js). Its header explains how to add photos and rooms.
- `photos-originals/` is gitignored, so each clone has its own (or none). `npm run photos` makes the web copies in `public/photos/` and records their sizes in `src/data/photo-sizes.json`, and both of those are committed. Without originals the script does nothing, which is safe. Only the person who has a photo's original should regenerate it.
- Room geometry: [src/room/geometry.js](src/room/geometry.js). Rooms: [src/pages/Room.jsx](src/pages/Room.jsx). Lobby: [src/pages/Lobby.jsx](src/pages/Lobby.jsx).
- **README stays as just the title and the site link.** Put guidance in code comments or here, never in the README.

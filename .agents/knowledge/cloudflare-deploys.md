# Deploys: Cloudflare Pages from GitHub Actions

The site is hosted on **Cloudflare Pages** (project `charlyzhang`, on Adam's free Cloudflare account, where the `charlyzhang.org` DNS also lives). [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) builds on every push to `main`, `adam` or `charly`, and uploads `dist/` with `wrangler pages deploy`. Anyone's push deploys: Pages doesn't check who wrote the commit.

| Push to | Deploys | Link |
|---|---|---|
| `main` | production | https://charlyzhang.org (also https://charlyzhang.pages.dev) |
| `adam` | preview | https://adam.charlyzhang.pages.dev |
| `charly` | preview | https://charly.charlyzhang.pages.dev |

Topic branches (`charly/<x>`) don't deploy. To give one a preview, merge it into your branch. Every deploy also gets its own `<hash>.charlyzhang.pages.dev` link, which never changes.

**Config lives in `public/`** and is copied into `dist/`:
- `_redirects`: only the app's routes (`/collage`, `/collage/*`, `/room/*`) are rewritten to `/` (status 200), so they load the app. Everything else that isn't a file falls to `dist/404.html`, a copy of `index.html` that `npm run build` makes, served with a real 404: a missing photo is a 404, not the page cached as an image, and the app sends a mistyped path home. **Rewrite to `/`, not `/index.html`:** Pages strips `.html`, so wrangler flags `/index.html` targets as an "infinite loop" and ignores them (that's also what the old `/* /index.html 200` tripped in the stray Worker below). A new top-level route needs a line here. Test locally with `npm run build && npx wrangler@4.152.0 pages dev dist`, which applies `_redirects` and `_headers` as Pages does (`vite preview` doesn't).
- `_headers`: `/assets/*` (hashed file names) a year, `immutable`; `/photos/*` a week, which is why photo URLs carry `?v=<hash>`; `/lobby/*` and `/textures/*` have no version in their URLs, so they revalidate every visit (`max-age=0, must-revalidate`, a cheap 304), so a redrawn layer of Charly never meets an old one.
- `index.html` has the link-preview tags (`og:*`, `twitter:card`) pointing at `public/og.jpg` (1200×630, Half Dome), and `public/apple-touch-icon.png` (180 px, from favicon.svg). Swap og.jpg for another photo if Charly prefers; keep it 1200×630.
- **`www.charlyzhang.org` and `charlyzhang.pages.dev` serve the same site** (not redirected). `index.html` names `https://charlyzhang.org/` as canonical. A 301 from www to the apex would need a Cloudflare Redirect Rule in the dashboard (Adam).

**Secrets** (repo Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` (Adam's, "Cloudflare Pages: Edit") and `CLOUDFLARE_ACCOUNT_ID`. Only Adam can see or change them, or log into the Cloudflare dashboard.

**Why we're not on Vercel any more:** Vercel's free Hobby plan only deploys commits whose author is on the team (it reads the author from `.git`, even for CLI uploads with Adam's token), and adding Charly needs Pro. Moved Nov 2026.

**How to apply:**
- After a push: `gh run list --branch <name> -L 1`, then `gh run watch <id>`. If it fails, `gh run view <id> --log-failed`. The run's summary shows the link.
- An auth error ("Authentication error", 10000) means the token has expired or been revoked. Tell Adam: he makes a new one and replaces `CLOUDFLARE_API_TOKEN`. Don't work around it in code.
- A failing build is a real failure: reproduce it with `npm run build` locally.
- Limits: 20,000 files and 25 MiB per file per deploy. Photo web copies are far below that. Don't commit originals into `public/`.
- Redeploy without a new commit: Actions tab → Deploy → Run workflow, then pick the branch.
- Roll back production: Cloudflare dashboard → Workers & Pages → charlyzhang → Deployments → an older production deploy → "Rollback" (Adam only). Otherwise revert on your branch and ship it.
- **The only deploy check is GitHub Actions' `Deploy / deploy (push)`.** From Nov 12 to Nov 19, 2026, every commit also had a failing `Workers Builds: charlyzhang-org` check. That came from a stray Cloudflare Worker named `charlyzhang-org`, which was connected to the repo through Cloudflare's Git integration. It ran `npx wrangler deploy`, Wrangler made up a Worker config, and the deploy then failed on the `_redirects` rule above. It never served the site. Adam disconnected it from the repo on Nov 19. If a `Workers Builds` check (or any Cloudflare Git-integration check) shows up again, it's stray: tell Adam to disconnect it in the dashboard. Don't add `wrangler.toml`/`wrangler.jsonc` to make it pass.

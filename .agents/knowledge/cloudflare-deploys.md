# Deploys: Cloudflare Pages from GitHub Actions

The site is hosted on **Cloudflare Pages** (project `charlyzhang`, on Adam's free Cloudflare account, where the `charlyzhang.org` DNS also lives). [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) builds on every push to `main`, `adam` or `charly`, and uploads `dist/` with `wrangler pages deploy`. Anyone's push deploys: Pages doesn't check who wrote the commit.

| Push to | Deploys | Link |
|---|---|---|
| `main` | production | https://charlyzhang.org (also https://charlyzhang.pages.dev) |
| `adam` | preview | https://adam.charlyzhang.pages.dev |
| `charly` | preview | https://charly.charlyzhang.pages.dev |

Topic branches (`charly/<x>`) don't deploy. To give one a preview, merge it into your branch. Every deploy also gets its own `<hash>.charlyzhang.pages.dev` link, which never changes.

**Config lives in `public/`** and is copied into `dist/`:
- `_redirects`: `/* /index.html 200`, so routes like `/room/favorites` load the app. Pages accepts this rule, but Workers static assets reject it as an "infinite loop" (code 100324), because Workers strips `.html` from URLs. Don't change it to suit a Worker: we deploy to Pages.
- `_headers`: one-week `Cache-Control` on `/photos/*`, `/textures/*` and `/lobby/*`. That's why photo URLs carry `?v=<hash>`.

**Secrets** (repo Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` (Adam's, "Cloudflare Pages: Edit") and `CLOUDFLARE_ACCOUNT_ID`. Only Adam can see or change them, or log into the Cloudflare dashboard.

**Why we're not on Vercel any more:** Vercel's free Hobby plan only deploys commits whose author is on the team (it reads the author from `.git`, even for CLI uploads with Adam's token), and adding Charly needs Pro. Moved Nov 2026.

**How to apply:**
- After a push: `gh run list --branch <name> -L 1`, then `gh run watch <id>`. If it fails, `gh run view <id> --log-failed`. The run's summary shows the link.
- An auth error ("Authentication error", 10000) means the token has expired or been revoked. Tell Adam: he makes a new one and replaces `CLOUDFLARE_API_TOKEN`. Don't work around it in code.
- A failing build is a real failure: reproduce it with `npm run build` locally.
- Limits: 20,000 files and 25 MiB per file per deploy. Photo web copies are far below that. Don't commit originals into `public/`.
- Redeploy without a new commit: Actions tab → Deploy → Run workflow, then pick the branch.
- Roll back production: Cloudflare dashboard → Workers & Pages → charlyzhang → Deployments → an older production deploy → "Rollback" (Adam only). Otherwise revert on your branch and ship it.
- **The only deploy check is GitHub Actions' `Deploy / deploy (push)`.** From Nov 12 to Nov 19, 2026, every commit also had a failing `Workers Builds: charlyzhang-org` check. That came from a stray Cloudflare Worker named `charlyzhang-org`, which was connected to the repo through Cloudflare's Git integration. It ran `npx wrangler deploy`, Wrangler made up a Worker config, and the deploy then failed on the `_redirects` rule above. It never served the site. Adam disconnected it from the repo on Nov 19. If a `Workers Builds` check (or any Cloudflare Git-integration check) shows up again, it's stray: tell Adam to disconnect it in the dashboard. Don't add `wrangler.toml`/`wrangler.jsonc` and don't edit `_redirects` to make it pass.

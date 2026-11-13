# Vercel deploys: GitHub Actions with Adam's token

The repo is private and owned by the `charlyzhang-org` GitHub organisation. The Vercel project is on Adam's free Hobby account (team "reachadamzhang-5546's projects"). Hobby can't deploy a private org repo through Vercel's Git integration, and it only ever deployed Adam's own commits. So that integration is **disconnected**, and [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml) deploys instead, whoever pushed.

| Push to | Deploys | Link |
|---|---|---|
| `main` | production | https://charlyzhang.org |
| `adam` | preview | https://charlyzhang-adam.vercel.app |
| `charly` | preview | https://charlyzhang-charly.vercel.app |

Topic branches (`charly/<x>`) don't deploy. To give one a preview, merge it into your branch.

**How it works:** `vercel pull` (project settings) → `vercel build` (builds on the runner, applies `vercel.json`) → `vercel deploy --prebuilt` (uploads). For previews, it then points `charlyzhang-<branch>.vercel.app` at the new deploy through the Vercel REST API. It doesn't use `vercel alias`, because that command looks up a user, and the team-scoped token has none ("User not found (404)").

**Secrets** (repo Settings → Secrets and variables → Actions): `VERCEL_TOKEN` (Adam's, team-scoped), `VERCEL_ORG_ID` (the `team_…` id), `VERCEL_PROJECT_ID` (`prj_…`). Only Adam can see or change them, or log into the Vercel dashboard.

**Why:** Decided Nov 2026 to stay on Hobby and let Charly ship to production himself.

**How to apply:**
- After a push: `gh run list --branch <name> -L 1`, then `gh run watch <id>`. If it fails, `gh run view <id> --log-failed`. The run's summary shows the deploy URL.
- Deploy failing with an auth or 403 error: the token has expired or been revoked. Tell Adam: he makes a new one at vercel.com/account/tokens and replaces `VERCEL_TOKEN`. Don't work around it in code.
- A failing build is a real failure: reproduce it with `npm run build` locally.
- Don't reconnect the Git repo in Vercel's settings, because it would start its own deploys and failing checks again.
- Preview protection (Vercel Authentication) is off, so the preview links are public. That's how Charly can open them.
- Redeploy without a new commit: Actions tab → Deploy to Vercel → Run workflow, then pick the branch.

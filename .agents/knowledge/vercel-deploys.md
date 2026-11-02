# Vercel deploys: only Adam's commits deploy

The Vercel project is on Adam's free Hobby account (team "reachadamzhang-5546's projects"), and the repo is private. Vercel builds only commits whose Git author has access to the project, and only Adam does. Charly's commits (GitHub user Babelfisher-txz) get a failing `Vercel` check: "Git author Babelfisher-txz must have access to the project on Vercel to create deployments." That is expected, not a bug in the change. Adding Charly would need the paid Pro plan, which we've decided against.

So the pipeline in CLAUDE.md is `charly` → `adam` → `main`, and **Adam merges at each step**. A GitHub merge commit is authored by whoever clicks merge, so when Adam merges `charly` into `adam`, Vercel builds a preview of `adam` from his commit. That preview is the first one anyone sees of Charly's work. Merging `adam` into `main` deploys production.

**Why:** Decided Nov 2026 to stay on the Hobby plan.

**How to apply:**
- On Charly's side: ignore the failing `Vercel` check on `charly` and on its PRs, and don't try to fix it in code or config. Test locally with `npm run build` and `npm run preview` (or `npm run dev`). Never merge your own PRs: leave them for Adam, and say in the `done` log entry that the PR is ready for him.
- On Adam's side: always merge with a merge commit (`gh pr merge --merge`), never squash or rebase, which can keep Charly as the author and block the deploy. Check the `adam` preview after taking Charly's work, and the production deploy after merging into `main`.

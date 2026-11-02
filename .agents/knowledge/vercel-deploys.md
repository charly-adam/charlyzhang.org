# Vercel deploys: only Adam's commits deploy

The Vercel project is on Adam's free Hobby account (team "reachadamzhang-5546's projects"), and the repo is private. Vercel builds only commits whose Git author has access to the project, and only Adam does. Charly's commits (GitHub user Babelfisher-txz) get a failing `Vercel` check: "Git author Babelfisher-txz must have access to the project on Vercel to create deployments." That is expected, not a bug in the change. Adding Charly would need the paid Pro plan, which we've decided against.

So the split is: Charly makes changes on `charly/*` branches and opens PRs; **Adam merges them** and that deploys. A GitHub merge commit is authored by whoever clicks merge, so when Adam merges, production builds from his commit.

**Why:** Decided Nov 2026 to stay on the Hobby plan.

**How to apply:**
- On Charly's side: ignore the failing `Vercel` check on your PRs, and don't try to fix it in code or config. You get no preview URL, so check your change locally with `npm run build` and `npm run preview` (or `npm run dev`). Don't merge your own PRs: leave them for Adam, and say in the `done` log entry that the PR is ready for him.
- On Adam's side: review and merge Charly's PRs with a merge commit (not squash or rebase, which can keep Charly as the author), then check the production deploy. If you want a preview first, push the branch again with a commit of your own, or run it locally.

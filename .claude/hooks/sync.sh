#!/bin/sh
# SessionStart: catch up with origin and show what the other agent is doing.
# adam and charly each ship to main themselves, and main flows back into both by merging (see CLAUDE.md).
# Whatever this prints goes into the agent's context. It always exits 0, so it never blocks a session.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# The branch each branch takes accepted work from. A topic branch (charly/x) comes from its owner's branch.
upstream() {
  case "$1" in
    main|'') ;;
    */*) echo "${1%%/*}" ;;
    *) echo main ;;
  esac
}
clean() { [ -z "$(git status --porcelain --untracked-files=no)" ]; }
has() { git rev-parse -q --verify "$1" >/dev/null; }
commits() { git log --format='  %h %an: %s' "$@"; }

echo "== Sync with origin =="
case "$(git remote get-url origin 2>/dev/null)" in
  *charlyzhang-org/charlyzhang.org*) ;;
  *) echo "origin isn't the org repo. Run: git remote set-url origin https://github.com/charlyzhang-org/charlyzhang.org" ;;
esac
if ! git fetch --prune --quiet origin 2>/dev/null; then
  echo "Couldn't reach origin; working from local state. Fetch before you push."
else
  branch=$(git symbolic-ref --short -q HEAD)
  [ -z "$branch" ] && echo "Detached HEAD: switch to your own branch (adam or charly)."

  # Whatever was pushed to this branch from elsewhere.
  if [ -n "$branch" ] && has "origin/$branch"; then
    n=$(git rev-list --count "HEAD..origin/$branch")
    if [ "$n" -gt 0 ]; then
      if clean && git merge --ff-only --quiet "origin/$branch" 2>/dev/null; then
        echo "Pulled $n commit(s) on $branch."
      else
        echo "$branch is $n behind origin/$branch and couldn't fast-forward (local changes or diverged). Sort this out first."
      fi
    fi
  fi

  # Whatever has been accepted upstream.
  up=$(upstream "$branch")
  if [ "$branch" = main ]; then
    echo "On main. Nobody works here: switch to your own branch (adam or charly)."
  elif [ -n "$up" ] && has "origin/$up"; then
    n=$(git rev-list --count --no-merges "HEAD..origin/$up")
    if [ "$(git rev-list --count "HEAD..origin/$up")" -eq 0 ]; then
      echo "On $branch, up to date with origin/$up."
    elif ! clean; then
      echo "On $branch with uncommitted changes; origin/$up has $n commit(s) it doesn't. Commit, then: git merge origin/$up"
    elif git merge --no-edit --quiet "origin/$up" >/dev/null 2>&1; then
      if [ "$n" -eq 0 ]; then echo "Merged origin/$up (merge commits only) into $branch. Not pushed yet: run git push."
      else echo "Merged $n commit(s) from origin/$up into $branch. Not pushed yet: run git push."; fi
      commits --no-merges -n 10 ORIG_HEAD..HEAD
    else
      git merge --abort 2>/dev/null
      echo "Merging origin/$up into $branch conflicts, so it wasn't merged. Run git merge origin/$up and resolve it, or ask your human. Incoming:"
      commits --no-merges -n 10 "HEAD..origin/$up"
    fi
  fi
fi

# What's waiting at a step: commits on $1 that $2 doesn't have yet.
waiting() {
  has "origin/$1" || { echo "$1: no such branch on origin yet."; return; }
  n=$(git rev-list --count --no-merges "origin/$2..origin/$1")
  if [ "$n" -eq 0 ]; then echo "$1: nothing waiting for $2."; return; fi
  echo "$1: $n commit(s) waiting for $2 · files: $(git diff --name-only "origin/$2...origin/$1" | head -12 | tr '\n' ' ')"
  commits --no-merges -n 8 "origin/$2..origin/$1"
  git diff "origin/$2...origin/$1" -- .agents/log.md | sed -n 's/^+\([^+].*\)/  log: \1/p'
}

echo
echo "== Not on main yet (previews: <branch>.charlyzhang.pages.dev) =="
waiting charly main
waiting adam main
pr=$(gh pr list --state open --json number,title,headRefName,baseRefName -q '.[] | "  #\(.number) \(.headRefName) -> \(.baseRefName): \(.title)"' 2>/dev/null)
[ -n "$pr" ] && { echo "Open PRs:"; echo "$pr"; }

others=
for ref in $(git for-each-ref --no-merged=origin/main --format='%(refname:short)' refs/remotes/origin); do
  case "$ref" in origin/HEAD|origin/main|origin/adam|origin/charly) continue ;; esac
  [ -z "$others" ] && { echo; echo "== Other branches =="; others=1; }
  waiting "${ref#origin/}" "$(upstream "${ref#origin/}")"
done

echo
echo "== End of .agents/log.md on main =="
if git cat-file -e origin/main:.agents/log.md 2>/dev/null; then
  git show origin/main:.agents/log.md | tail -n 20
else
  tail -n 20 .agents/log.md 2>/dev/null
fi
exit 0

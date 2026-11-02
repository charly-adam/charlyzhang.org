#!/bin/sh
# SessionStart: catch up with origin and show what the other agent is doing.
# Whatever this prints goes into the agent's context. It always exits 0, so it never blocks a session.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

echo "== Sync with origin =="
if ! git fetch --prune --quiet origin 2>/dev/null; then
  echo "Couldn't reach origin; working from local state. Fetch before you push."
else
  branch=$(git symbolic-ref --short -q HEAD)
  behind=$(git rev-list --count HEAD..origin/main)
  if [ "$behind" -eq 0 ]; then
    echo "Up to date with origin/main (on $branch)."
  elif [ "$branch" = main ]; then
    if [ -z "$(git status --porcelain --untracked-files=no)" ] && git merge --ff-only --quiet origin/main 2>/dev/null; then
      echo "Pulled $behind new commit(s) into main:"
      git log --format='  %h %an: %s' -n "$behind"
    else
      echo "main is $behind behind origin/main and couldn't fast-forward (local changes or diverged). Sort this out first."
    fi
  else
    echo "On $branch; origin/main has $behind commit(s) it doesn't. Rebase onto origin/main before you push:"
    git log --format='  %h %an: %s' HEAD..origin/main
  fi
fi

echo
echo "== In-flight branches (not merged into main) =="
found=
for ref in $(git for-each-ref --no-merged=origin/main --sort=-committerdate --format='%(refname:short)' refs/remotes/origin); do
  [ "$ref" = origin/HEAD ] && continue
  found=1
  git log -1 --format="$ref · %an · %cr · %s" "$ref"
  echo "  files: $(git diff --name-only origin/main..."$ref" | head -12 | tr '\n' ' ')"
  git diff origin/main..."$ref" -- .agents/log.md | sed -n 's/^+\([^+].*\)/  log: \1/p'
done
[ -z "$found" ] && echo "None."

echo
echo "== End of .agents/log.md on main =="
if git cat-file -e origin/main:.agents/log.md 2>/dev/null; then
  git show origin/main:.agents/log.md | tail -n 30
else
  tail -n 30 .agents/log.md 2>/dev/null
fi
exit 0

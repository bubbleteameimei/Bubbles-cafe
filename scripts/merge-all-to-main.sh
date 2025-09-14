#!/usr/bin/env bash
set -euo pipefail

# Merge all local branches into main, delete side branches locally and remotely.
# Usage:
#   scripts/merge-all-to-main.sh             # dry run
#   DRY_RUN=0 scripts/merge-all-to-main.sh   # perform merges/deletes and push

DRY_RUN=${DRY_RUN:-1}
REMOTE=${REMOTE:-origin}
MAIN=${MAIN:-main}
PUSH=${PUSH:-1}

echo "== Merge all branches into '$MAIN' (remote: $REMOTE) =="
echo "DRY_RUN=${DRY_RUN} (1=dry-run, 0=execute)  PUSH=${PUSH}"

# Ensure we're in a git repo
git rev-parse --git-dir >/dev/null

# Fetch and prune
git fetch --all --prune

# Ensure MAIN exists locally
if ! git show-ref --verify --quiet "refs/heads/${MAIN}"; then
  echo "Main branch '${MAIN}' not found locally."
  if git show-ref --verify --quiet "refs/remotes/${REMOTE}/${MAIN}"; then
    echo "Creating local '${MAIN}' from ${REMOTE}/${MAIN}"
    git checkout -b "${MAIN}" "${REMOTE}/${MAIN}"
  else
    echo "Remote '${REMOTE}/${MAIN}' not found. Creating new '${MAIN}' from current HEAD."
    git switch -c "${MAIN}"
  fi
fi

# Ensure clean working tree
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree not clean. Please commit or stash changes."
  exit 1
fi

# Update main with remote
git checkout "${MAIN}"
if git show-ref --verify --quiet "refs/remotes/${REMOTE}/${MAIN}"; then
  git pull --ff-only "${REMOTE}" "${MAIN}" || true
fi

# Get list of local branches except main
mapfile -t BRANCHES < <(git for-each-ref --format='%(refname:short)' refs/heads | grep -v -E "^${MAIN}\$" || true)

if [ ${#BRANCHES[@]} -eq 0 ]; then
  echo "No side branches to merge."
else
  echo "Merging branches: ${BRANCHES[*]}"
fi

# Merge each branch
for B in "${BRANCHES[@]}"; do
  echo "----"
  echo "Merging branch '$B' into '${MAIN}'"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] git merge --no-ff -X theirs --no-edit \"$B\""
  else
    if ! git merge --no-ff -X theirs --no-edit "$B"; then
      echo "Merge conflict detected in '$B'. Aborting merge."
      git merge --abort || true
      echo "Skipping '$B'. Resolve manually if needed."
      continue
    fi
  fi
done

# Push main
if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] git push ${REMOTE} ${MAIN}"
else
  if [ "$PUSH" -eq 1 ]; then
    git push "${REMOTE}" "${MAIN}"
  fi
fi

# Delete side branches locally and remotely
for B in "${BRANCHES[@]}"; do
  echo "Deleting branch '$B'"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] git branch -D \"$B\""
    echo "[dry-run] git push ${REMOTE} --delete \"$B\" || true"
  else
    git branch -D "$B" || true
    git push "${REMOTE}" --delete "$B" || true
  fi
done

echo "Done."
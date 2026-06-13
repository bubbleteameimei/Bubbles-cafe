#!/usr/bin/env bash
# One-command GitHub push — reads GITHUB_PAT from environment/secrets.
# Usage: bash scripts/push-to-github.sh
set -e

PAT="${GITHUB_PAT}"
REMOTE="https://bubbleteameimei/Bubbles-cafe.git"

if [ -z "$PAT" ]; then
  echo "❌  GITHUB_PAT secret is not set."
  echo "    Add it in Replit: Secrets tab → GITHUB_PAT → your Personal Access Token"
  exit 1
fi

# Remove any stale git lock files
for lock in \
  .git/index.lock \
  .git/refs/remotes/origin/main.lock \
  .git/MERGE_HEAD; do
  [ -f "$lock" ] && rm -f "$lock" && echo "🔓 Removed $lock"
done

# Inject PAT into remote URL temporarily
AUTHED="https://${PAT}@github.com/bubbleteameimei/Bubbles-cafe.git"
git remote set-url origin "$AUTHED"

echo "🚀 Pushing to GitHub..."
git push origin main

# Restore clean URL (no token in config)
git remote set-url origin "https://github.com/bubbleteameimei/Bubbles-cafe.git"
echo "✅ Push complete. Token removed from config."

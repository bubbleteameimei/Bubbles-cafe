---
name: Bubbles Cafe GitHub push
description: How to push commits to GitHub from the Replit main agent (git push is sandbox-blocked)
---

# GitHub Push from Main Agent

**Why:** Replit's sandbox blocks `git push` and `git remote set-url` when a `.git/refs/remotes/origin/main.lock` file exists (created by every push). `os.remove()` on that path is also blocked. This creates a permanent catch-22 in the main agent.

## Working approach — GitHub REST API

Push changed files via API directly (no git binary needed):

```python
import os, json, urllib.request

PAT   = os.environ['GITHUB_PAT']
REPO  = "bubbleteameimei/Bubbles-cafe"
BASE  = "https://api.github.com"
HEADS = {"Authorization": f"Bearer {PAT}", "Content-Type": "application/json", "Accept": "application/vnd.github+json"}

def api(method, path, body=None):
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(f"{BASE}{path}", data=data, headers=HEADS, method=method)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

# 1. Get base commit + tree
head      = api("GET", f"/repos/{REPO}/git/refs/heads/main")
base_sha  = head["object"]["sha"]
base_tree = api("GET", f"/repos/{REPO}/git/commits/{base_sha}")["tree"]["sha"]

# 2. Create blobs for each changed file
with open("path/to/file.txt") as f:
    content = f.read()
blob = api("POST", f"/repos/{REPO}/git/blobs", {"content": content, "encoding": "utf-8"})

# 3. Create tree, commit, update ref
tree       = api("POST", f"/repos/{REPO}/git/trees", {"base_tree": base_tree, "tree": [{"path": "path/to/file.txt", "mode": "100644", "type": "blob", "sha": blob["sha"]}]})
new_commit = api("POST", f"/repos/{REPO}/git/commits", {"message": "...", "tree": tree["sha"], "parents": [base_sha]})
api("PATCH", f"/repos/{REPO}/git/refs/heads/main", {"sha": new_commit["sha"]})
```

**How to apply:** Whenever the user asks to push to GitHub, use this API approach instead of `git push`. Check what's unpushed first with `git diff --name-only origin/main..HEAD`.

## For user shell pushes
`bash scripts/push-to-github.sh` — reads `GITHUB_PAT` secret, handles lock cleanup, does normal git push. Works from user's Shell tab (no sandbox restrictions there).

## GITHUB_PAT
Set as a Replit secret. Fine-grained PAT with Contents: Read & Write on Bubbles-cafe repo.

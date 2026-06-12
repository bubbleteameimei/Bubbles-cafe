---
name: Bubbles Cafe npm/Render deployment
description: package-lock.json gets Replit-local registry URLs that break Render CI; how to prevent and fix
---

# Bubbles Cafe npm/Render Deployment

**Why:** Replit runs a local npm proxy (`package-firewall.replit.local`) as its package registry. When `npm install` runs inside Replit, the lock file gets `"resolved": "http://package-firewall.replit.local/npm/..."` URLs for newly installed packages. On Render (or any external CI), those hostnames don't resolve, causing `npm install` to fail with `ENOTFOUND`. The build may still succeed from cache, but the server fails at startup with `Cannot find package 'X'`.

## Fix already applied
1. **`.npmrc`** — has `registry=https://registry.npmjs.org/` at top. This ensures future installs always write official URLs to the lock file.
2. **`package-lock.json`** — all 14 Replit registry URLs replaced with `https://registry.npmjs.org/` via Python:
   ```python
   content.replace('http://package-firewall.replit.local/npm/', 'https://registry.npmjs.org/')
   ```

## Packages that were affected
`cors`, `bcryptjs`, `jsonwebtoken`, `@types/cors`, `@types/bcryptjs`, `@types/jsonwebtoken` — all newly installed backend packages.

## How to detect in future
```bash
grep -c "package-firewall.replit.local" package-lock.json
```
Should return 0. If not, run the Python replacement above.

**How to apply:** Any time new packages are installed via Replit, run the grep check and fix before pushing to GitHub/Render.

---
name: Render deploy timeout pattern
description: Root causes and fixes for Render deploy timing out / bootlooping
---

## The bootloop pattern
`healthCheckPath: /api/health` in render.yaml causes Render to actively GET that path and
expect a 2xx response before marking the service healthy. If the DB query inside the health
endpoint is slow or returns 503 during cold start, Render marks it unhealthy and restarts
indefinitely → bootloop. **Remove healthCheckPath entirely.** Port-based detection is enough.

## The timeout-after-restart pattern
Render detects "new primary port: 10000" on first deploy and restarts the service. The
second start has a short window to bind the port. If the server does DB checks *before*
`app.listen()`, the port isn't open when Render's window expires → timeout.

## Fixes (both applied)
1. `app.listen(PORT)` FIRST — before any async DB work. DB checks run in the background.
2. SIGTERM handler: hard `setTimeout(process.exit, 8000)` so the process always exits
   within 8 s, preventing lingering keep-alive connections from blocking the restart.
3. `PORT: "10000"` in render.yaml — Render knows the port without discovery.
4. **No `healthCheckPath`** — port-only detection is simpler and never bootloops.

**Why:** Render's health check keeps retrying 503s from a cold-start DB query → restart loop.
**How to apply:** Never add healthCheckPath unless the health endpoint returns 200 *immediately*
(no DB calls, no async work) and is guaranteed to be up before Render's first probe.

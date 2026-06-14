---
name: Render deploy timeout pattern
description: Root causes and fixes for Render deploy timing out after "new primary port" restart
---

## The pattern
Render detects a new primary port, restarts the service, and the second start times out.

## Root causes
1. **DB checks before app.listen()** — the server does 3-5s of DB work before binding the port. On Render's restart (which has a short port-detection window), the server is still doing DB checks when the timeout fires.
2. **Stuck SIGTERM handler** — `server.close()` waits indefinitely for keep-alive connections to drain before calling the callback. This delays the process exit, eating into the restart's timeout budget. Render eventually sends SIGKILL, but by then the total deploy timeout may be nearly exhausted.

## Fix
1. Call `app.listen(PORT)` FIRST — before any async DB work — so Render detects the port in < 1s.
2. Do DB checks asynchronously after the server is bound.
3. Add a hard `setTimeout(..., 8000)` exit in the SIGTERM handler so the process always exits within 8 seconds regardless of lingering connections.
4. Explicitly set `PORT: "10000"` in render.yaml so Render knows the port without discovery.

**Why:** Render's "new primary port" restart has a tight timeout window. The server must be listening before DB work completes.
**How to apply:** Any time the server startup does significant async work (DB connect, schema check, migrations) before app.listen, move app.listen to the top.

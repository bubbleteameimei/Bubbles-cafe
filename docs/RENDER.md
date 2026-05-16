# Render vs current stack

## Current production (recommended)

| Layer | Host |
|-------|------|
| Frontend | Vercel (`bubblescafe.space`) |
| API | Cloudflare Worker (`api.bubblescafe.space`) |
| Database + Auth | Supabase |

This is what `wrangler.toml` and `vercel.json` are built for.

## Legacy Render URL

`https://bubbles-cafe.onrender.com` appears in older CI config but **times out** — the Express server in `/server` is no longer the production entrypoint (`package.json` uses Vite + Worker only).

Do **not** point `VITE_API_URL` at Render unless you restore and deploy the Express app.

## When Render makes sense

Use Render **PostgreSQL** only if you want to migrate off Supabase Postgres:

1. Create a Render Postgres instance.
2. Restore from backup (`scripts/restore-backup.ts` supports `*.render.com` hosts).
3. Set `DATABASE_URL` / `SUPABASE_POOLER_URL` on a **self-hosted API** (Express or Worker with direct PG).

That is a large migration (auth, RLS, RPCs). Fixing Supabase is much faster for the current codebase.

## Optional Render Postgres (infrastructure only)

See `render.yaml` for a managed Postgres service definition. It does **not** replace the Cloudflare Worker API by itself.

# Bubble's Cafe

This is the codebase for Bubble's Cafe, a horror-themed reading platform.

## Production architecture

- Frontend: React SPA on Vercel
- API: Cloudflare Workers (TypeScript, itty-router)
- Database: Supabase PostgreSQL (Drizzle ORM)

A legacy Node/Express server still exists under `/server` for historical SSR and experiments, but the production API runs on Cloudflare Workers.

## Local development

Recommended workflows:

- API (Cloudflare Worker): `npm run dev:worker`
- Frontend (Vite): `npm run dev:client`
- Both in parallel: `npm run dev:full`

Legacy Express-based commands:

- `npm run dev` or `npm run dev:server` – start the old Node/Express server (kept for now, but not used in production).

See `replit.md` and `replit_agent/architecture.md` for more detailed architecture and operational notes.
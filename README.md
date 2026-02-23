# Bubble’s Cafe

Dark, psychological, and experimental short fiction.

## Architecture

- **Frontend**: Vite + React (`client/`)
- **API**: Cloudflare Worker (`src/index.ts`) exposed on `https://api.bubblescafe.space`
- **Database/Auth**: Supabase (REST + RPC)

> Note: `server/` contains a **legacy Express backend** and is being phased out. The production site should use the Worker API.

## Local development

### 1) Install

```bash
npm ci
```

### 2) Configure env

- Copy `.env.example` to `.env` and fill required values.
- For local frontend -> API calls, you can set:

```bash
VITE_API_URL=http://127.0.0.1:8787
```

### 3) Run (frontend + worker)

```bash
npm run dev:full
```

This runs:
- `wrangler dev` (Worker API)
- `vite --host` (frontend)

The Vite dev server proxies `/api/*` to the local worker (`http://127.0.0.1:8787`).

## Build

```bash
npm run build
```

## Tests

```bash
npm test
npm run e2e
```

## Deployment notes

- Frontend is deployed to Vercel.
  - `vercel.json` includes a rewrite so deep links like `/privacy` and `/legal/terms` don’t 404.
- API is deployed to Cloudflare Workers.
  - `wrangler.toml` defines routes for `api.bubblescafe.space/*`.
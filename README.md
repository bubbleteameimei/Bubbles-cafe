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
  - `vercel.json` sets `outputDirectory` to `dist/public` and rewrites all non-file routes to `index.html` so SPA paths like `/reader`, `/index`, and `/stories` work on direct navigation.
  - `/api/*` is proxied to `https://api.bubblescafe.space` for same-origin bootstrap calls.
- API is deployed to Cloudflare Workers.
  - `wrangler.toml` defines routes for `api.bubblescafe.space/*`.

## Docker

```bash
# Production static site (nginx on port 8080)
docker compose up web --build

# Development (Vite + wrangler)
docker compose --profile dev up dev --build
```

## Dev Container

Open the repo in VS Code / Cursor and choose **Reopen in Container**. The dev container runs `npm run dev:full` (Vite on 5173, Worker on 8787).
# Deployment

Bubble's Cafe runs as two services:

| Piece | Host | Domain | Source |
|---|---|---|---|
| Frontend (React SPA) | **Vercel** | `bubblescafe.space` | `client/` → `dist/public` |
| API (Express) | **Render** | `api.bubblescafe.space` | `server/`, started by `scripts/start-render.ts` |
| Database | Neon Postgres | — | schema in `shared/schema.ts` |
| Auth | Supabase Auth + Google OAuth, API issues its own JWTs | — | `server/auth-google.ts` |

The Cloudflare Worker in `src/` is **not** deployed any more and CI no longer
touches it. It's kept for reference while its remaining endpoints are ported
to Express (see "Known gaps" below).

> **Never commit real secrets to this repo.** Put them in the Render / Vercel
> dashboards. Use `.env.example` as the list of names, with empty values.

---

## Render (API)

Configured by `render.yaml` (Blueprint).

- **Build:** `npm ci --include=dev` — the API runs TypeScript directly with
  `tsx`, so there is no frontend build on Render. `--include=dev` matters:
  `NODE_ENV=production` would otherwise make npm skip `tsx`.
- **Start:** `npm start` → `tsx scripts/start-render.ts` (binds the port first,
  then checks the database in the background).
- **Health check:** `/` returns 200 without touching the database.
  `/api/health` returns 503 when the DB is unreachable, so don't use it as the
  Render health check path (it causes restart loops during slow DB starts).

### Required environment variables

The server **refuses to start in production** if any of these are missing or
shorter than 32 characters:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` (different from above) |
| `CSRF_SECRET` | `openssl rand -hex 32` |

Also needed for full functionality (all `sync: false` in `render.yaml`, so set
them in the dashboard): `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GMAIL_APP_PASSWORD`, `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`.

Contact-form notification emails go to `GMAIL_ADMIN_EMAIL`, sent through
Gmail using `GMAIL_ADMIN_EMAIL` + `GMAIL_APP_PASSWORD` (a Google app
password). `GMAIL_USER` / `GMAIL_PASS` also work. If email isn't configured,
messages are still saved to the `contact_messages` table.

### Free-plan cold starts

Render's free plan sleeps after ~15 minutes idle and takes 30–60 s to wake.
Requests during that time look like timeouts or CORS errors in the browser.
The `uptime-ping` workflow keeps it warm; a paid instance removes the issue.

---

## Vercel (frontend)

Configured by `vercel.json`.

- **Install:** `npm ci` · **Build:** `npm run build` · **Output:** `dist/public`
- `/api/*` is rewritten to `https://api.bubblescafe.space/api/*`; everything
  else falls back to `index.html` (SPA routing).
- The client resolves the API base URL in `client/src/lib/asset-path.ts`. With
  no env vars set, it uses `api.<current domain>` in production and
  `https://api.bubblescafe.space` on `*.vercel.app` previews. Set
  `VITE_API_URL` only if you need to point at a different API.

---

## CI (`.github/workflows/ci.yml`)

Runs on pushes and PRs to `main`: typecheck → lint → route parity → build →
bundle budget → unit tests, plus a TruffleHog secrets scan.

`npm run check:routes` lists frontend API calls with no matching Express
route. It currently reports in warn-only mode (see below).

---

## Known gaps

Some frontend calls still have no Express handler (they existed only on the
Worker), so those features return 404 in production. Run
`npm run check:routes` for the current list. Remaining as of this writing:
forgot password, `/api/auth/profile`, and admin-only screens (site settings,
admin notifications, moderation, WordPress sync dashboard, email test, theme
admin, feedback review list).

Note: the parity check matches paths, not HTTP methods. For example
`POST /api/feedback` exists but the admin list (`GET /api/feedback`) does not.

---

## Local development

```bash
cp .env.example .env     # fill in values
npm ci
npm run dev              # Express API (tsx watch) + Vite client
```

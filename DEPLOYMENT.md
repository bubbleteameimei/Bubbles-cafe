# Deployment

Bubble's Cafe runs on three services:

| Piece | Host | Domain / location | Source |
|---|---|---|---|
| Frontend (React SPA) | **Vercel** | `bubblescafe.space` | `client/` → `dist/public` |
| API (Express) | **Render** | `api.bubblescafe.space` | `server/`, started by `scripts/start-render.ts` |
| Database + Auth | **Supabase** | project `rqoqtusrlsapcbdimwpn` | schema in `shared/schema.ts` |

Stories are written on WordPress and copied into the database by the API's
built-in sync (every 30 minutes, plus a "Sync now" button in the admin panel).

> **Never commit real secrets to this repo.** Put them in the Render / Vercel /
> Supabase dashboards. `.env.example` lists the names with empty values.

## How the pieces talk

- The browser signs in with **Supabase Auth** (email/password or Google) and
  sends the Supabase access token to the API as `Authorization: Bearer …`.
  The global fetch wrapper (`client/src/lib/fetch-csrf.ts`) adds it to every
  `/api/*` request.
- The API checks the token with the Supabase service-role key and maps it to a
  row in the `users` table by email (`findOrCreateAppUser`). `users.is_admin`
  controls admin access.
- The API is the **only** thing that reads or writes database tables. Every
  `public` table has row-level security on with no policies, so the
  anon/public Supabase key can't touch data directly.

---

## Render (API)

Configured by `render.yaml` (Blueprint).

- **Build:** `npm ci --include=dev`. The API runs TypeScript directly with
  `tsx`; `--include=dev` stops `NODE_ENV=production` from dropping it.
- **Start:** `npm start` → `tsx scripts/start-render.ts`
- **Health check:** `/` (doesn't touch the DB). `/api/health` reports DB status
  and returns 503 when the DB is unreachable.

### Environment variables

Required. The server refuses to start in production without these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase **Session pooler** URI: Supabase → Connect → *Session pooler*. Looks like `postgresql://postgres.rqoqtusrlsapcbdimwpn:<db-password>@aws-…-us-east-1.pooler.supabase.com:5432/postgres`. Don't use the direct `db.<ref>.supabase.co` host: it's IPv6-only and Render can't reach it. |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` (different) |
| `CSRF_SECRET` | `openssl rand -hex 32` |
| `SUPABASE_URL` | `https://rqoqtusrlsapcbdimwpn.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret) |

Optional:

| Variable | Purpose |
|---|---|
| `GMAIL_ADMIN_EMAIL` + `GMAIL_APP_PASSWORD` | Contact-form notifications and feedback replies via Gmail (Google app password). `GMAIL_USER` / `GMAIL_PASS` also work. Without these, messages are still saved. |
| `ENABLE_WORDPRESS_SCHEDULER` | `false` disables the automatic sync by default (the admin toggle overrides it). |
| `WORDPRESS_SYNC_INTERVAL_MINUTES` | Default 30. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Only for the legacy API-side Google login; Supabase handles Google sign-in. |
| `PAYSTACK_*` | Support/tip links. |

### Free-plan cold starts

Render's free plan sleeps after about 15 idle minutes and takes 30–60 s to
wake up. Requests during that time look like timeouts or CORS errors in the
browser. The `uptime-ping` workflow keeps it warm; a paid instance removes the
problem.

---

## Vercel (frontend)

Configured by `vercel.json`.

- **Install:** `npm ci` · **Build:** `npm run build` · **Output:** `dist/public`
- `/api/*` is rewritten to `https://api.bubblescafe.space/api/*`; everything
  else falls back to `index.html`.

Recommended environment variables (Production + Preview):

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://rqoqtusrlsapcbdimwpn.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the anon/publishable key (safe to expose) |

With these set, sign-in initialises immediately. Without them the client asks
the API for the config first, which fails while Render is cold-starting.

---

## Supabase

### Auth settings (Authentication → URL Configuration)

- **Site URL:** `https://bubblescafe.space`
- **Redirect URLs:** `https://bubblescafe.space/**` (add `https://*.vercel.app/**`
  for previews). Password reset emails link to `/reset-password`.
- Keep **Confirm email** on: accounts are linked to existing site users by
  email address.
- Turn on **leaked password protection** (Authentication → Policies).

### Free-plan pausing

Free Supabase projects pause after a period of inactivity. When that happens,
sign-in and every page that needs data fail until someone clicks **Restore** in
the dashboard. The `uptime-ping` workflow hitting `/api/health` (which queries
the DB) keeps it active.

### Schema changes

`shared/schema.ts` is the source of truth. Apply changes with
`npm run db:push` using a Session-pooler `DATABASE_URL`, or as a Supabase
migration. Keep RLS on for new tables:
`ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;`

---

## CI (`.github/workflows/ci.yml`)

On pushes and PRs to `main`: client typecheck, lint, **route parity**,
server typecheck, build, bundle budget, unit tests, and a TruffleHog secrets
scan.

`npm run check:routes` fails if the frontend calls an `/api/...` route that the
Express API doesn't implement. When you add a client API call, add the route
too.

---

## Local development

```bash
cp .env.example .env     # fill in values
npm ci
npm run dev              # Express API (tsx watch) + Vite client
```

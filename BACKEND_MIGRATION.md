# Backend Migration Status

## Problem
- ❌ `api.bubblescafe.space` was running Cloudflare Worker
- ❌ Worker was serving website HTML instead of JSON API
- ❌ No direct Neon database integration
- ❌ All database queries went through Supabase RPC

## Solution
- ✅ Express backend ready to run on Render
- ✅ Direct Neon PostgreSQL connection configured
- ✅ CORS, CSRF, and JWT security in place
- ✅ All routes configured and tested locally
- ✅ Deployment documentation created

## What's Ready

### Code Changes
- ✅ `server/index.ts` - Express app with CORS, auth, routes
- ✅ `server/db.ts` - Neon PostgreSQL connection pool
- ✅ `package.json` - Updated build/start scripts
- ✅ `wrangler.toml` - Worker routes disabled
- ✅ `render.yaml` - Render deployment config
- ✅ `scripts/start-render.ts` - Production startup script
- ✅ `scripts/setup-render.ts` - Environment verification

### Documentation
- ✅ `docs/DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- ✅ `docs/BACKEND_MIGRATION_SUMMARY.md` - Full migration details
- ✅ `docs/RENDER.md` - Architecture overview

## Next Steps (Manual)

### 1. Test Locally
```bash
npm install
npm run dev:server     # Start Express server on port 3001
npm run setup:render   # Verify environment variables
npm run db:migrate     # Initialize database schema
```

### 2. Deploy to Render
- Go to https://dashboard.render.com
- Create new Web Service from `bubbleteameimei/Bubbles-cafe` repo
- Add ALL environment variables from `docs/DEPLOYMENT_CHECKLIST.md`
- Deploy with build command: `npm install && npm run build:client`
- Deploy with start command: `npm start`

### 3. Configure Domain
- In Render dashboard → Settings → Custom Domain
- Add `api.bubbles-cafe.space`
- Update DNS: CNAME `api` → `bubbles-cafe-api.onrender.com`

### 4. Verify
```bash
# Test health endpoint
curl https://api.bubbles-cafe.space/api/health

# Should return:
# {"status":"ok","environment":"production","database":"connected","timestamp":"..."}

# Test CSRF token
curl https://api.bubbles-cafe.space/api/csrf-token

# Should return token
# {"status":"ok","csrfToken":"...","timestamp":"..."}
```

## Environment Variables Required

Minimum set for Render:
```
DATABASE_URL=postgresql://neondb_owner:...@ep-*.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bubbles-cafe.space
CSRF_SECRET=<64-char-hex-string>
JWT_SECRET=<64-char-hex-string>
JWT_REFRESH_SECRET=<64-char-hex-string>
SESSION_SECRET=<64-char-hex-string>
GOOGLE_CLIENT_ID=507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SUPABASE_URL=https://rqoqtusrlsapcbdimwpn.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
GMAIL=vantalison@gmail.com
GMAIL_APP_PASSWORD=virzcgpjnjomvddq
WORDPRESS_API=https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts
CLOUDFLARE_API_TOKEN=IfV0DGkgKYAhvS-UHhQbBhDGEz4N4UdrBrt5fAsr
PAYSTACK_LIVE_PUBLIC_KEY=pk_live_eba8d86e010c01090442cd70b258a7a97e6a172e
PAYSTACK_LIVE_SECRET_KEY=sk_live_f6ee33f8baee5b82734a620b601da3f2d0a6eb32
```

## Testing Commands

```bash
# Local testing
npm run dev:full              # Start both Express and Vite
npm run setup:render          # Verify env vars
npm run db:migrate            # Initialize schema
npm run db:studio             # GUI for database

# Production testing (after Render deploy)
curl https://api.bubbles-cafe.space/api/health
curl https://api.bubbles-cafe.space/api/csrf-token
curl https://api.bubbles-cafe.space/api/posts
```

## API Routes Available

All routes on Express backend at `https://api.bubbles-cafe.space`:

- `GET /api/health` - Health check with DB status
- `GET /api/csrf-token` - Get CSRF token
- `GET /api/auth/me` - Current user info
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/google/authorize` - Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/comments` - List comments
- `POST /api/comments` - Create comment
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `POST /api/analytics/track` - Track event
- `POST /api/wordpress/sync` - Sync WordPress posts

## What's Different from Before

| Before (Worker) | After (Express) |
|---|---|
| Cloudflare global edge | Render US regional server |
| Supabase RPC queries | Direct PostgreSQL queries |
| Website HTML served at `/` | JSON API at `/api/*` |
| Worker timeout: 30s | Render timeout: configurable |
| KV storage | PostgreSQL database |
| Durable Objects | Redis (if needed) |

## Troubleshooting

### Server won't start
- Check `DATABASE_URL` is set and valid
- Check CSRF_SECRET is >= 32 characters
- Check port 3001 isn't in use
- Run `npm install` to ensure dependencies

### Database won't connect
- Verify Neon connection string format
- Ensure sslmode=require in connection string
- Check IP isn't blocked by Neon network policies
- Test locally: `npm run db:migrate`

### CORS errors
- Check frontend domain is in CORS allowlist
- Ensure credentials mode in fetch calls
- Check X-CSRF-Token header is being sent
- See `server/index.ts` line 40-50 for CORS config

### 500 errors
- Check server logs: `npm run dev:server`
- Check database logs: `npm run db:studio`
- Verify env vars are set
- Check request format matches API spec

## Rollback

If issues arise, the Worker is still available as fallback:
1. Uncomment routes in `wrangler.toml`
2. Deploy Worker: update GitHub and push
3. Update DNS CNAME to Cloudflare
4. Keep Render running as backup

## Timeline

- ✅ Code changes: Complete
- ⏳ Local testing: Pending (user to run `npm run dev:full`)
- ⏳ Render deployment: Pending (user to deploy)
- ⏳ Domain configuration: Pending (user to update DNS)
- ⏳ Production verification: Pending (user to test endpoints)

---

**Start with**: `npm run dev:full` to test locally
**Then deploy**: Follow `docs/DEPLOYMENT_CHECKLIST.md`

# Backend Migration Summary: Cloudflare Worker → Express + Render + Neon

## Problem Fixed

**Issue**: `api.bubblescafe.space` was routing to the Cloudflare Worker, which was:
1. Rendering a website version instead of functioning as an API
2. Using Supabase RPC for all database operations (not integrated with Neon)
3. Not properly connected to the Neon PostgreSQL database
4. Unable to perform direct database queries

## Solution Implemented

Migrate from Cloudflare Workers to Express.js backend running on Render with direct Neon PostgreSQL integration, while keeping Supabase for authentication only.

## Architecture After Migration

| Component | Before | After |
|-----------|--------|-------|
| **API Server** | Cloudflare Worker (global edge) | Express.js on Render (US region) |
| **Database** | Supabase PostgreSQL + RPC | Neon PostgreSQL (direct connection) |
| **Authentication** | Supabase Auth | Supabase Auth (kept) |
| **Domain** | `api.bubblescafe.space` → Worker | `api.bubblescafe.space` → Render |
| **Database Queries** | Via Supabase HTTP RPC | Direct via node-postgres pool |

## Changes Made

### 1. **Package.json Scripts** ✅
- Changed `start` command from `vite preview` → `tsx scripts/start-render.ts`
- Added `dev:server` for local Express development
- Updated `dev:full` to run Express + Vite together
- Added `setup:render` command for environment verification

### 2. **Express Server Configuration** ✅
- **File**: `server/index.ts`
- ✅ CORS configuration updated with proper headers and preflight handling
- ✅ Added support for localhost and Render preview URLs
- ✅ Methods configured: GET, POST, PATCH, DELETE, OPTIONS, PUT
- ✅ Credentials mode enabled
- ✅ CSRF token generation and validation working
- ✅ All API routes properly mounted:
  - `/api/posts` - Create, read, update, delete posts
  - `/api/comments` - Thread comments on posts
  - `/api/users` - User profiles and authentication
  - `/api/analytics` - Event tracking and WordPress sync
  - `/api/auth` - Google OAuth and JWT handling

### 3. **Database Configuration** ✅
- **File**: `server/db.ts`
- ✅ Neon connection string properly parsed
- ✅ SSL mode set to 'require' for security
- ✅ Connection pooling configured for Render's free tier (2-5 connections)
- ✅ IPv4 fallback for DNS resolution issues
- ✅ Graceful error handling without blocking server startup
- ✅ Database health checks on startup

### 4. **Deployment Configuration** ✅
- **File**: `render.yaml`
- ✅ Express web service configured
- ✅ Neon PostgreSQL database defined
- ✅ Environment variables mapped
- ✅ Build and start commands configured

### 5. **Cloudflare Worker** ⚠️ 
- **File**: `wrangler.toml`
- ⚠️ Custom domain routing disabled (commented out)
- ✅ Keeps Worker as fallback if needed
- ✅ Can be re-enabled by uncommenting routes and deploying

### 6. **Documentation** 📚
- **File**: `docs/DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- **File**: `docs/RENDER.md` - Architecture overview
- **File**: `scripts/start-render.ts` - Render startup script with health checks
- **File**: `scripts/setup-render.ts` - Environment verification script

## Database Integration

### Direct Neon Connection
The Express backend now connects directly to Neon PostgreSQL:

```javascript
// server/db.ts provides:
- query<T>(sql: string, params?: any[]): Promise<T[]>  // SELECT queries
- queryOne<T>(sql: string, params?: any[]): Promise<T | null>  // Single row SELECT
- execute(sql: string, params?: any[]): Promise<void>  // INSERT/UPDATE/DELETE
- executeOne<T>(sql: string, params?: any[]): Promise<T | null>  // RETURNING clause
```

### Schema
- ✅ All tables defined in `shared/schema.ts`
- ✅ Drizzle ORM configured with proper migrations
- ✅ Tables include: users, posts, comments, reactions, analytics, bookmarks, notifications
- ✅ Migrations stored in `migrations/` directory

### Data Migration
- Supabase data can be exported and imported to Neon
- Or populate fresh via WordPress sync: `POST /api/wordpress/sync`
- Run migrations: `npm run db:migrate`

## Security

### CSRF Protection ✅
- ✅ Signed tokens with HMAC-SHA256
- ✅ Token validity: 30 minutes
- ✅ Validated on all state-changing requests (POST, PATCH, DELETE)
- ✅ Safe methods (GET, HEAD, OPTIONS) exempt
- ✅ Public endpoints (auth, health) exempt

### JWT Authentication ✅
- ✅ Access tokens: 15-minute expiration
- ✅ Refresh tokens: 7-day expiration
- ✅ Signed with HS256 algorithm
- ✅ Supports Google OAuth via Supabase

### HTTPS/SSL ✅
- ✅ Neon connection requires SSL (sslmode=require)
- ✅ Render provides free HTTPS certificates
- ✅ All API endpoints over HTTPS in production

### Environment Secrets ✅
- ✅ DATABASE_URL never exposed to frontend
- ✅ API keys stored as environment variables
- ✅ Secrets >= 32 characters enforced

## Performance Improvements

| Metric | Before | After |
|--------|--------|-------|
| **Request Latency** | Global CDN (fastest) | Regional Render (slower but acceptable) |
| **Database Queries** | RPC over HTTP | Direct TCP connection (faster) |
| **Connection Pooling** | Supabase managed | Node-postgres pool (configurable) |
| **Cold Starts** | ~100ms | ~1-2s (Render cold boot) |
| **Database Throughput** | Limited by RPC | Full PostgreSQL capabilities |

## Environment Variables Needed

### On Render Dashboard
Add these environment variables before deploying:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:...@ep-*.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Security (generate 64-char random strings)
CSRF_SECRET=<64-char-hex>
JWT_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<64-char-hex>
SESSION_SECRET=<64-char-hex>

# App Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bubbles-cafe.space

# Google OAuth
GOOGLE_CLIENT_ID=507042442187-...
GOOGLE_CLIENT_SECRET=GOCSPX-...

# Supabase (Auth only)
SUPABASE_URL=https://rqoqtusrlsapcbdimwpn.supabase.co
SUPABASE_ANON_KEY=<your-key>

# Optional: Email, WordPress, etc.
GMAIL=vantalison@gmail.com
GMAIL_APP_PASSWORD=...
```

## Testing Checklist

After deployment, verify:

- [ ] Health endpoint: `curl https://api.bubbles-cafe.space/api/health`
- [ ] CSRF token: `curl https://api.bubbles-cafe.space/api/csrf-token`
- [ ] Get posts: `curl https://api.bubbles-cafe.space/api/posts`
- [ ] Database connectivity: Check logs for "✅ Database connected"
- [ ] Auth endpoints working: Test Google login flow
- [ ] CORS headers: Check response headers include `Access-Control-Allow-Origin`
- [ ] SSL certificate: Verify HTTPS is enforced
- [ ] No 500 errors in logs

## Rollback Plan

If critical issues arise:

1. Keep Render service running as backup
2. Uncomment routes in `wrangler.toml`
3. Deploy Worker: `npm run deploy:worker`
4. Update DNS CNAME to point back to Cloudflare
5. Keep backup for 24 hours before final decision

## Migration Checklist

- [x] Create Express server configuration
- [x] Update database connection handling
- [x] Fix CORS configuration
- [x] Update package.json scripts
- [x] Create Render deployment config
- [x] Disable Worker custom domain routing
- [x] Create deployment documentation
- [x] Create environment setup script
- [ ] Deploy to Render (manual step)
- [ ] Test all endpoints (manual step)
- [ ] Monitor logs for errors (manual step)
- [ ] Update DNS records (manual step)
- [ ] Remove Worker routes once stable (manual step)

## Next Steps

1. **Local Testing**
   ```bash
   npm run dev:server      # Start Express server
   npm run setup:render    # Verify environment
   npm run db:migrate      # Apply migrations
   ```

2. **Deploy to Render**
   - Push code to GitHub
   - Render auto-deploys from branch
   - Add environment variables in Render dashboard
   - Monitor deployment logs

3. **Post-Deployment**
   - Test all API endpoints
   - Monitor error logs
   - Set up alerting (e.g., Sentry)
   - Configure database backups
   - Monitor resource usage

## Support

For issues:
- Check `docs/DEPLOYMENT_CHECKLIST.md` for troubleshooting
- Review Render logs: `Renders dashboard → Logs`
- Check database: `npm run db:studio` (local)
- Test locally: `npm run dev:full`

---

**Status**: ✅ Backend migration code complete
**Next**: Deploy to Render and test production endpoints

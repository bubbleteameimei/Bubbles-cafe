# Migration Guide: Supabase → Neon + Google OAuth + Render

This guide covers the complete migration from Cloudflare Workers + Supabase to Render + Neon + Google OAuth.

## Overview

**Old Stack:**
- Backend: Cloudflare Workers
- Database: Supabase (Postgres)
- Auth: Supabase OAuth
- CSRF: Session-based tokens
- Frontend: Vercel

**New Stack:**
- Backend: Render (Node.js/Express)
- Database: Neon (Direct PostgreSQL)
- Auth: Google OAuth + JWT
- CSRF: Signed stateless tokens
- Frontend: Vercel (unchanged)

## Phase 1: Environment Setup

### 1.1 Update Environment Variables

Add these to your `.env`:

```bash
# Database (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-square-butterfly-ae94i9bl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Auth (JWT Secrets - CHANGE THESE!)
JWT_SECRET="your-secure-random-jwt-secret-here"
JWT_REFRESH_SECRET="your-secure-random-refresh-secret-here"

# Google OAuth (Already configured)
GOOGLE_CLIENT_ID="507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
FRONTEND_URL="https://bubbles-cafe.space"

# CSRF (Already configured)
CSRF_SECRET="f1e2d3c4b5a6978877665544332211ffaabbccddeeff00112233445566778899"

# Server
NODE_ENV="production"
PORT="3001"
```

### 1.2 Remove Supabase Env Vars

Remove or comment out:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POOLER_URL`

## Phase 2: Database Migration

### 2.1 Create Tables in Neon

The schema is already defined in `shared/schema.ts` using Drizzle ORM.

Run the migration script:

```bash
npx ts-node server/migrate-to-neon.ts
```

This will:
1. Connect to Neon
2. Create all tables
3. (Optional) Export data from Supabase and import to Neon
4. Verify the connection

### 2.2 Migrate Data (if you have existing Supabase data)

If you want to migrate existing data:

1. Export from Supabase:
   ```bash
   pg_dump $SUPABASE_DATABASE_URL > supabase-dump.sql
   ```

2. Import to Neon:
   ```bash
   psql $DATABASE_URL < supabase-dump.sql
   ```

### 2.3 WordPress Integration

WordPress posts are synced to the `posts` table with source metadata.

Trigger sync via API:
```bash
curl -X POST https://your-render-url/api/wordpress/sync
```

Or manually in code:
```typescript
import { registerWordPressSyncRoutes } from './server/routes/wordpress-sync';
```

## Phase 3: Authentication Migration

### 3.1 Update Frontend Auth

Replace Supabase auth with Google OAuth:

**Old (Supabase):**
```typescript
import { useSupabaseAuth } from '@supabase/auth-helpers-react';
```

**New (Google OAuth):**
```typescript
import { useAuthGoogle } from '@/hooks/use-auth-google';

const { user, tokens, loginWithEmail, handleGoogleCallback } = useAuthGoogle();
```

### 3.2 Update Auth Endpoints

Frontend now calls:

```typescript
// Login
POST /api/auth/login
{ email, password }

// Google OAuth callback
GET /api/auth/google/callback?code=...&state=...

// Refresh token
POST /api/auth/refresh
{ refreshToken }

// Logout
POST /api/auth/logout
{ refreshToken }

// Get current user
GET /api/auth/me
(requires Bearer token)

// Get CSRF token
GET /api/csrf-token
```

### 3.3 Token Storage

Tokens are stored in `localStorage`:

```typescript
localStorage.setItem('auth_tokens', JSON.stringify({
  accessToken: string,
  refreshToken: string
}));

localStorage.setItem('auth_user', JSON.stringify({
  id, email, username, isAdmin
}));
```

## Phase 4: CSRF Protection Migration

### 4.1 Replace Session-Based CSRF

**Old (session-based):**
- Token stored in `req.session.csrfToken`
- Required CSRF validation on protected routes

**New (signed tokens):**
- Stateless tokens signed with HMAC-SHA256
- Format: `nonce.timestamp.signature`
- Valid for 30 minutes
- No session required

### 4.2 Frontend CSRF Integration

```typescript
import { ensureCsrfToken, applyCSRFToken, csrfFetch } from '@/lib/csrf-signed';

// Initialize on app load
await initializeCsrf();

// Use in requests
const response = await csrfFetch('/api/posts', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### 4.3 API CSRF Validation

Already implemented in `server/middleware/csrf-signed-tokens.ts`

Safe methods (GET, HEAD, OPTIONS) skip CSRF check.
Public endpoints (auth) are whitelisted.

## Phase 5: Deployment

### 5.1 Deploy Backend to Render

1. Create a new Web Service on Render
2. Connect to your GitHub repo
3. Set environment variables (from Phase 1)
4. Add build command: `npm install && npm run build`
5. Add start command: `npm run start`

### 5.2 Update Frontend

Update API base URL in `client/src/lib/api-client.ts`:

```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'https://your-render-url.onrender.com';
```

### 5.3 Update Google OAuth Callback URLs

Add to Google Cloud Console:

```
https://your-render-url.onrender.com/api/auth/google/callback
https://bubbles-cafe.space/auth/callback
https://www.bubbles-cafe.space/auth/callback
```

## Phase 6: Testing

### 6.1 Test Database Connection

```bash
curl https://your-render-url/api/health
# Should return: { "status": "ok", "environment": "production" }
```

### 6.2 Test Authentication

```bash
# Get CSRF token
curl https://your-render-url/api/csrf-token

# Test login
curl -X POST https://your-render-url/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"email": "user@example.com", "password": "..."}'
```

### 6.3 Test Protected Routes

```bash
curl -H "Authorization: Bearer <accessToken>" \
  https://your-render-url/api/posts
```

### 6.4 Test WordPress Sync

```bash
curl -X POST https://your-render-url/api/wordpress/sync
```

## Rollback Plan

If you need to roll back:

1. Keep Supabase/Cloudflare running temporarily
2. Update frontend to use old API URLs
3. Use feature flags to switch between old/new auth
4. Keep both databases in sync during transition

## Common Issues

### CSRF Token Expired
- Client should call `GET /api/csrf-token` periodically
- Tokens are valid for 30 minutes

### 401 Unauthorized on Protected Routes
- Check JWT in Authorization header
- Verify token hasn't expired
- Call `POST /api/auth/refresh` with refresh token

### WordPress Posts Not Showing
- Run `POST /api/wordpress/sync`
- Check `posts.metadata.source = 'wordpress_api'`

### Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

## Support

For issues, check:
- Server logs: Render dashboard
- Database logs: Neon dashboard
- Frontend errors: Browser console

## Files Changed

**New files:**
- `server/auth-google.ts` - Google OAuth + JWT
- `server/middleware/csrf-signed-tokens.ts` - Signed CSRF tokens
- `server/routes/posts.ts` - Posts API
- `server/routes/comments.ts` - Comments API
- `server/routes/users.ts` - Users API
- `server/routes/analytics.ts` - Analytics API
- `server/routes/wordpress-sync.ts` - WordPress integration
- `server/migrate-to-neon.ts` - Database migration script
- `client/src/hooks/use-auth-google.ts` - Frontend auth hook
- `client/src/lib/csrf-signed.ts` - Frontend CSRF client
- `client/src/lib/api-client.ts` - API client with JWT

**Modified files:**
- `server/index.ts` - Main server setup
- `server/db.ts` - Neon database connection
- `.env` - Environment variables

## Success Criteria

✅ All tables created in Neon  
✅ Data migrated from Supabase  
✅ Google OAuth working  
✅ JWT tokens issued and refreshed  
✅ CSRF tokens validated  
✅ WordPress posts synced  
✅ Frontend auth working  
✅ API requests protected  
✅ Tests passing  
✅ Production deployment successful

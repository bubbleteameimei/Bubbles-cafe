# Deployment Checklist

## What's Been Built

### 1. Backend Server (Render-Ready)

✅ **Express server** (`server/index.ts`)
- JWT-based authentication
- Google OAuth support
- Signed CSRF token validation
- CORS configured for preview/production URLs
- Health check endpoint

✅ **Authentication System** (`server/auth-google.ts`)
- Google OAuth with JWT tokens
- Email/password login support
- Refresh token management
- Session storage in database
- Token expiry handling

✅ **CSRF Protection** (`server/middleware/csrf-signed-tokens.ts`)
- Stateless signed tokens (replace session-based)
- 30-minute token validity
- Automatic validation on state-changing requests
- Safe method bypass (GET, HEAD, OPTIONS)

✅ **API Routes**
- Posts CRUD (`server/routes/posts.ts`)
- Comments CRUD (`server/routes/comments.ts`)
- Users management (`server/routes/users.ts`)
- Analytics tracking (`server/routes/analytics.ts`)
- WordPress sync (`server/routes/wordpress-sync.ts`)

✅ **Database Migration**
- Neon connection setup (`server/db.ts`)
- Migration script (`server/migrate-to-neon.ts`)
- All 32 tables defined in Drizzle ORM schema

### 2. Frontend Integration

✅ **Auth Hook** (`client/src/hooks/use-auth-google.ts`)
- Google OAuth + email/password login
- Token refresh logic
- Session persistence
- Error handling

✅ **CSRF Client** (`client/src/lib/csrf-signed.ts`)
- Token fetching and caching
- Automatic refresh on expiry
- Request protection
- SessionStorage integration

✅ **API Client** (`client/src/lib/api-client.ts`)
- JWT authorization header injection
- CSRF token handling
- Token refresh on 401
- Error handling

## Environment Variables Required

```env
# Neon Database
DATABASE_URL="postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-square-butterfly-ae94i9bl-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Google OAuth (Already provided)
GOOGLE_CLIENT_ID="507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="<generate-strong-random-key>"
JWT_REFRESH_SECRET="<generate-strong-random-key>"

# CSRF Secret (Already provided, can keep)
CSRF_SECRET="f1e2d3c4b5a6978877665544332211ffaabbccddeeff00112233445566778899"

# URLs
FRONTEND_URL="https://bubbles-cafe.space"
NODE_ENV="production"
PORT="3001"

# WordPress (Optional)
WORDPRESS_API="https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts"
```

## Pre-Deployment Tasks

### ✅ Database
- [ ] Neon database created and accessible
- [ ] `DATABASE_URL` tested locally
- [ ] Tables created via migration script
- [ ] (Optional) Data migrated from Supabase

### ✅ Google OAuth
- [ ] Confirm redirect URIs in Google Cloud Console:
  - `https://your-render-url/api/auth/google/callback`
  - `https://bubbles-cafe.space/auth/callback`
  - `https://www.bubbles-cafe.space/auth/callback`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set
- [ ] Verified in development environment

### ✅ JWT Secrets
- [ ] Generated strong random keys for `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Stored securely (not committed to git)
- [ ] Different values for dev/staging/production

### ✅ Frontend Integration
- [ ] Updated API base URL to Render endpoint
- [ ] Imported new auth hook (`useAuthGoogle`)
- [ ] Replaced Supabase auth with Google OAuth flow
- [ ] Integrated CSRF token fetching on app load
- [ ] Updated API calls to use new API client

### ✅ WordPress Integration (If Needed)
- [ ] Trigger sync via `POST /api/wordpress/sync`
- [ ] Verify posts appear in database with `source: 'wordpress_api'`
- [ ] Tables accept WordPress metadata correctly

## Deployment Steps

### Step 1: Deploy Backend to Render

```bash
# 1. Create Web Service on render.com
# 2. Connect to GitHub repository
# 3. Set environment variables:
#    - DATABASE_URL (Neon)
#    - JWT_SECRET, JWT_REFRESH_SECRET
#    - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
#    - CSRF_SECRET, FRONTEND_URL, NODE_ENV
#
# 4. Build command: npm install && npm run build
# 5. Start command: npm run start
# 6. Deploy
```

### Step 2: Test Backend Endpoints

```bash
RENDER_URL="https://your-service.onrender.com"

# Health check
curl $RENDER_URL/api/health

# CSRF token
curl $RENDER_URL/api/csrf-token

# Auth endpoints
curl -X POST $RENDER_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Step 3: Update Frontend

```bash
# Update API base URL in client
# Replace /api calls to use https://your-service.onrender.com/api

# Test login flow
# 1. Click "Login with Google"
# 2. Verify redirect to Google OAuth
# 3. Complete authorization
# 4. Verify redirect back to your app
# 5. Check localStorage for tokens
```

### Step 4: Verify Integration

- [ ] Login with Google works
- [ ] Access token + refresh token stored
- [ ] CSRF token fetched and applied
- [ ] API calls include JWT header
- [ ] Protected routes return 401 without token
- [ ] Post, comment, analytics endpoints work
- [ ] WordPress posts synced correctly
- [ ] All tables accept data from website

### Step 5: Monitor

- [ ] Check Render logs for errors
- [ ] Monitor Neon query logs
- [ ] Test token refresh flow
- [ ] Verify CSRF token rotation

## Troubleshooting

### Database Connection Failed
```bash
# Test Neon connection locally
psql $DATABASE_URL -c "SELECT 1"

# Check DATABASE_URL format
# postgresql://user:password@host/database?sslmode=require
```

### JWT Errors
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check token format in Authorization header: `Bearer <token>`
- Verify token hasn't expired (15 min for access, 7 days for refresh)

### CSRF Token Missing
- Frontend should call `GET /api/csrf-token` on app load
- Check X-CSRF-Token header is sent with requests
- Verify CSRF_SECRET is consistent between frontend/backend

### Google OAuth Not Working
- Verify redirect URIs in Google Cloud Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Verify FRONTEND_URL matches your domain

### WordPress Posts Not Syncing
- Check `WORDPRESS_API` env var
- Verify posts have `source: 'wordpress_api'` in metadata
- Check logs for sync errors

## Rollback Plan

If issues arise:

1. **Keep old system running** (Supabase + Cloudflare Workers)
2. **Update frontend API URL** back to old endpoint
3. **Use feature flag** to switch between old/new auth
4. **Run migration in reverse** if needed

## Post-Deployment

- [ ] Monitor error rates
- [ ] Check database connection stability
- [ ] Verify token refresh works
- [ ] Test user creation/login flow
- [ ] Confirm WordPress sync runs
- [ ] Check CSRF token validation
- [ ] Review Render and Neon logs
- [ ] Set up alerts for errors

## Success Indicators

✅ Users can login with Google  
✅ Users can login with email/password  
✅ JWT tokens issued and refreshed  
✅ CSRF tokens validated on POST/PATCH/DELETE  
✅ API endpoints protected by JWT  
✅ WordPress posts synced to database  
✅ All tables working and accepting data  
✅ Performance baseline established  
✅ No errors in production logs  
✅ Users can logout and re-login

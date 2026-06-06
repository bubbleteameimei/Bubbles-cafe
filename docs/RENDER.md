# Render Backend Migration

## Migration Plan: From Supabase to Render (Keeping Auth on Supabase)

This document outlines migrating your backend from Cloudflare Workers + Supabase to Render Express + Neon PostgreSQL, while keeping Supabase for authentication only.

## Architecture After Migration

| Layer    | Host                                 | Purpose                                     |
| -------- | ------------------------------------ | ------------------------------------------- |
| Frontend | Vercel (`bubbles-cafe.space`)        | Client-side app                             |
| API      | Render (`bubbles-cafe.onrender.com`) | Express backend                             |
| Database | Neon PostgreSQL                      | All data (posts, comments, analytics, etc.) |
| Auth     | Supabase                             | User authentication & JWT verification      |

## Step 1: Prepare Neon PostgreSQL

1. Create a Neon project at https://neon.tech
2. Get your connection string: `postgresql://user:password@host/dbname`
3. Store in Render environment as `DATABASE_URL`
4. Run migrations: `npm run db:migrate`

## Step 2: Configure Render Service

### Create Web Service

1. Go to https://dashboard.render.com
2. Create new **Web Service**
   - Connect GitHub repo (`bubbleteameimei/Bubbles-cafe`)
   - Select branch: `render-backend-csrf-fix` (or your working branch)
   - Build command: `npm install && npm run build:client`
   - Start command: `npm run start`

### Environment Variables

Add these in Render dashboard → Environment:

```
# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-name-pooler.region.aws.neon.tech/bubbles_cafe

# API Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bubbles-cafe.space

# Authentication (Supabase - for JWT verification)
JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-secret
SESSION_SECRET=your-generated-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# CSRF Protection
CSRF_SECRET=your-csrf-secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret

# Admin Configuration
GMAIL_ADMIN_EMAIL=vantalison@gmail.com

# WordPress Integration
WORDPRESS_API=https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts
ENABLE_WORDPRESS_SCHEDULER=true
```

### Domain & SSL

1. Custom domain: `api.bubbles-cafe.space` (or your API domain)
2. SSL certificate: Auto-configured by Render

## Step 3: Update Client Configuration

### Frontend `.env.production`

```
VITE_API_URL=https://api.bubbles-cafe.space
VITE_API_BASE=https://api.bubbles-cafe.space
```

### Update CORS on Backend

The server already has CORS configured for your domains. Verify in `server/index.ts`:

```javascript
const allowedOrigins = [
  'https://bubbles-cafe.space',
  'https://www.bubbles-cafe.space',
  'https://bubblescafe.vercel.app',
  // Add any other production domains
];
```

## Step 4: Verify Connectivity

1. Test health endpoint:

   ```
   curl https://api.bubbles-cafe.space/api/health
   ```

2. Test CSRF endpoint:

   ```
   curl https://api.bubbles-cafe.space/api/csrf-token
   ```

3. Check logs in Render dashboard

## Step 5: Database Migration

### Option A: Restore from Supabase

1. Create Supabase backup
2. Run restore script:
   ```bash
   npm run db:migrate
   ```

### Option B: Fresh Schema

1. Apply schema from `shared/schema.ts`
2. Run migrations from `migrations/` directory
3. Seed with WordPress posts via `/api/wordpress/sync` endpoint

## Step 6: Testing

### Local Testing Against Render

```bash
# Update .env.local
VITE_API_URL=https://api.bubbles-cafe.space

# Build and test
npm run build
npm run start
```

### Verify Functionality

- [ ] Comments posting works
- [ ] CSRF tokens are validated
- [ ] User authentication via Supabase
- [ ] Admin login for vantalison@gmail.com works
- [ ] WordPress sync completes
- [ ] Engagement tracking records data
- [ ] Database queries execute properly

## Step 7: Cutover

1. Update `bubbles-cafe.space` DNS to point to Render API
2. Monitor error logs for 24 hours
3. Set up backup strategy for Neon database

## Troubleshooting

### 500 Errors on Render

Check logs:

```bash
# Via Render dashboard or CLI
render logs <service-id>
```

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check IP allowlisting in Neon dashboard
- Test connection locally:
  ```bash
  DATABASE_URL=... npm run db:migrate
  ```

### CORS Errors

- Ensure frontend domain is in `allowedOrigins`
- Check `X-Requested-By` headers
- Verify credentials mode in fetch calls

### Supabase Auth Still Needed?

This architecture keeps Supabase for:

- User authentication
- JWT generation & validation
- Google OAuth flow

All data (posts, comments, analytics) is in Neon PostgreSQL.

## Rollback Plan

If issues arise:

1. Revert `VITE_API_URL` to previous value
2. Keep Render service running as backup
3. Monitor for a week before full cutover

## Performance Considerations

- Render free tier has limitations; upgrade if needed
- Neon has generous free tier
- Consider database connection pooling for production
- Set up monitoring/alerting on Render

## Next Steps

1. Review `server/index.ts` for any Supabase-specific code
2. Ensure all routes are registered correctly
3. Test with real traffic
4. Set up automated backups

For questions, check `scripts/` directory for setup utilities.

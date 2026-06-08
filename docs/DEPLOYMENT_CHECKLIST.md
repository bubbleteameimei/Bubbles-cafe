# Render Deployment Checklist

## Overview
Migrate from Cloudflare Worker (`api.bubblescafe.space` serving website) to Express backend on Render with Neon PostgreSQL database.

## Pre-Deployment: Local Testing

- [ ] Verify local Express server starts: `npm run dev:server`
- [ ] Test CSRF endpoint: `curl http://localhost:3001/api/csrf-token`
- [ ] Test health endpoint: `curl http://localhost:3001/api/health`
- [ ] Database connection works: Check logs for "✅ Database connected"

## Environment Variables Required on Render

### Core Configuration
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bubbles-cafe.space
```

### Database (Neon)
```
DATABASE_URL=postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Authentication & Security
```
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CSRF_SECRET=f1e2d3c4b5a6978877665544332211ffaabbccddeeff00112233445566778899
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
SESSION_SECRET=f8a3d1e7b4c6f9a2d0e5b7c1f3a8d9e2b6c0f4a7d1e9b3c5f2a6d8e1b0c7f9a4
```

### Google OAuth
```
GOOGLE_CLIENT_ID=507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_LOGIN_URI=https://api.bubbles-cafe.space/api/auth/google/callback
```

### Supabase (Auth Only)
```
SUPABASE_URL=https://rqoqtusrlsapcbdimwpn.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Email & External Services
```
GMAIL=vantalison@gmail.com
GMAIL_APP_PASSWORD=virzcgpjnjomvddq
CLOUDFLARE_API_TOKEN=IfV0DGkgKYAhvS-UHhQbBhDGEz4N4UdrBrt5fAsr
```

### WordPress Integration
```
WORDPRESS_API=https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts
ENABLE_WORDPRESS_SCHEDULER=true
```

### Payments
```
PAYSTACK_LIVE_PUBLIC_KEY=pk_live_eba8d86e010c01090442cd70b258a7a97e6a172e
PAYSTACK_LIVE_SECRET_KEY=sk_live_f6ee33f8baee5b82734a620b601da3f2d0a6eb32
PAYSTACK_LINK=https://paystack.shop/pay/z7fmj9rge
```

## Step 1: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New+" → "Web Service"
3. Connect GitHub repository: `bubbleteameimei/Bubbles-cafe`
4. Select branch: `sentinel-heart-pr2q3fe7` (your current branch)
5. Configuration:
   - **Name**: `bubbles-cafe-api`
   - **Runtime**: Node
   - **Plan**: Free (or Starter for production)
   - **Build Command**: `npm install && npm run build:client`
   - **Start Command**: `npm start`

## Step 2: Configure Neon Database

If not already done:

1. Create/verify Neon project at https://console.neon.tech
2. Get connection string (already in `DATABASE_URL` env var)
3. Run migrations locally first to test:
   ```bash
   DATABASE_URL="your-neon-url" npm run db:migrate
   ```

## Step 3: Add Environment Variables to Render

1. In Render dashboard, go to your service
2. Click "Environment" tab
3. Add all variables from the list above
4. **Important**: Use "Secret" for sensitive values (DATABASE_URL, API keys)

## Step 4: Deploy Initial Build

1. Render will automatically deploy when you push to the branch
2. Or manually deploy from Render dashboard: "Deploys" tab → "Manual Deploy"
3. Check deployment logs for errors

## Step 5: Configure Custom Domain

1. In Render dashboard, go to "Settings" for your service
2. Find "Custom Domain"
3. Add domain: `api.bubbles-cafe.space`
4. Update DNS records:
   - Type: CNAME
   - Name: `api`
   - Value: `bubbles-cafe-api.onrender.com` (provided by Render)
   - TTL: 300

## Step 6: Verify Deployment

Test the API endpoints:

```bash
# Health check
curl https://api.bubbles-cafe.space/api/health

# CSRF token endpoint
curl https://api.bubbles-cafe.space/api/csrf-token

# Database connectivity (should see posts or empty array)
curl https://api.bubbles-cafe.space/api/posts
```

Expected responses:
- `/api/health` → `{"status":"ok","environment":"production","timestamp":"..."}`
- `/api/csrf-token` → `{"status":"ok","csrfToken":"...","timestamp":"..."}`
- `/api/posts` → `[]` or array of posts

## Step 7: Update Frontend Configuration

Update `client/.env.production`:
```
VITE_API_URL=https://api.bubbles-cafe.space
VITE_API_BASE=https://api.bubbles-cafe.space
```

Verify frontend can reach the API from browser.

## Step 8: Database Migrations

First deployment will likely fail if schema doesn't exist. Run:

```bash
# Via Render shell
render exec <service-id> -- npm run db:migrate
```

Or, SSH into Render and run:
```bash
npm run db:migrate
```

## Troubleshooting

### 500 Errors on Deployment

Check logs in Render dashboard:

```bash
# Via Render CLI
render logs <service-id>
```

Common issues:
- `DATABASE_URL` not set
- `CSRF_SECRET` too short (< 32 chars)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` not set
- Missing migrations on first deployment

### Database Connection Fails

1. Verify `DATABASE_URL` is correct (use pooler URL)
2. Check Neon dashboard for connection status
3. Ensure no IP whitelisting is blocking Render's outbound IP
4. Test locally first: `DATABASE_URL="..." npm run db:migrate`

### CORS Errors

1. Verify frontend domain is in Express CORS allowlist (`server/index.ts`)
2. Check that credentials mode is set in fetch calls
3. Ensure X-CSRF-Token header is being sent for POST/PATCH/DELETE

### Google OAuth Not Working

1. Update `GOOGLE_LOGIN_URI` in Google Console to `https://api.bubbles-cafe.space/api/auth/google/callback`
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match
3. Test OAuth flow: click login button and check browser dev tools for redirects

## Rollback Plan

If issues arise:

1. Keep Cloudflare Worker as fallback (wrangler.toml routes are commented out)
2. To rollback: uncomment routes in `wrangler.toml` and deploy Worker
3. Update DNS CNAME to point back to Cloudflare
4. Keep Render service running as backup for 24 hours

## Performance Notes

- Render free tier: 0.5 CPU, 512 MB RAM
- Neon free tier: Sufficient for low-traffic apps
- For production: Upgrade Render plan and enable auto-scaling
- Monitor response times and DB connection pool usage

## Useful Commands

```bash
# Test locally
npm run dev:full

# Check database locally
npm run db:studio

# Run migrations
npm run db:migrate

# View PostgreSQL tables
npm run db:studio  # Opens Drizzle Studio

# Check server logs
tail -f logs/*.log
```

## Next Steps After Deployment

1. ✅ Verify all API endpoints are working
2. ✅ Test user authentication flows
3. ✅ Monitor database performance
4. ✅ Set up error logging (e.g., Sentry)
5. ✅ Configure automated database backups
6. ✅ Monitor Render dashboard for resource usage

---

**Deployment Date**: _______
**Deployed By**: _______
**Notes**: _______

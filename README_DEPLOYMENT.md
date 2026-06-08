# 🚀 Backend Migration - Deployment Guide

## TL;DR - What You Need to Know

Your backend was broken because `api.bubblescafe.space` was serving a Cloudflare Worker that rendered HTML instead of providing a JSON API. 

**We fixed it**: Express.js backend + Neon PostgreSQL + Render hosting

## ⚡ Quick Start (30 minutes)

### Step 1: Test Locally (5 min)
```bash
npm run dev:server        # Start Express server on :3001
npm run setup:render      # Verify all environment variables
npm run db:migrate        # Initialize database schema
```

Expected: Server logs show "✅ Database connected"

### Step 2: Deploy to Render (10 min)
1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Select repo: `bubbleteameimei/Bubbles-cafe`
4. Settings:
   - **Build**: `npm install && npm run build:client`
   - **Start**: `npm start`
5. Add environment variables (see below)
6. Click **Deploy**

### Step 3: Configure Domain (5 min)
1. Wait for Render to finish deployment
2. Find the service domain (e.g., `bubbles-cafe-api.onrender.com`)
3. Add DNS CNAME record:
   - **Host**: `api`
   - **Value**: `bubbles-cafe-api.onrender.com`
   - **TTL**: 300
4. Wait 5 minutes for DNS to propagate

### Step 4: Verify It Works (5 min)
```bash
# Test health endpoint
curl https://api.bubbles-cafe.space/api/health

# Should return JSON:
# {"status":"ok","environment":"production","database":"connected","timestamp":"..."}

# Test getting posts
curl https://api.bubbles-cafe.space/api/posts

# Should return JSON array (not HTML)
```

## 🔐 Environment Variables

Add these in Render Dashboard → Environment:

**Critical (must have):**
```
DATABASE_URL=postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://bubbles-cafe.space
CSRF_SECRET=f1e2d3c4b5a6978877665544332211ffaabbccddeeff00112233445566778899
SESSION_SECRET=f8a3d1e7b4c6f9a2d0e5b7c1f3a8d9e2b6c0f4a7d1e9b3c5f2a6d8e1b0c7f9a4
```

**Security (generate new 64-char hex strings):**
```
JWT_SECRET=<generate-random-64-char-hex>
JWT_REFRESH_SECRET=<generate-random-64-char-hex>
```

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OAuth & Auth:**
```
GOOGLE_CLIENT_ID=507042442187-17u8iqde1aeogo405iskul1t5dbr1kos.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SUPABASE_URL=https://rqoqtusrlsapcbdimwpn.supabase.co
SUPABASE_ANON_KEY=<from-your-supabase>
```

**Optional (external services):**
```
GMAIL=vantalison@gmail.com
GMAIL_APP_PASSWORD=virzcgpjnjomvddq
CLOUDFLARE_API_TOKEN=IfV0DGkgKYAhvS-UHhQbBhDGEz4N4UdrBrt5fAsr
WORDPRESS_API=https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts
PAYSTACK_LIVE_PUBLIC_KEY=pk_live_eba8d86e010c01090442cd70b258a7a97e6a172e
PAYSTACK_LIVE_SECRET_KEY=sk_live_f6ee33f8baee5b82734a620b601da3f2d0a6eb32
PAYSTACK_LINK=https://paystack.shop/pay/z7fmj9rge
```

## 📚 Documentation

If you get stuck, read these:

| Document | Purpose |
|----------|---------|
| **DEPLOYMENT_READY.md** | Full deployment walkthrough |
| **docs/DEPLOYMENT_CHECKLIST.md** | Step-by-step with troubleshooting |
| **BACKEND_MIGRATION.md** | Quick reference and commands |
| **docs/BACKEND_MIGRATION_SUMMARY.md** | Technical details |
| **FINAL_SUMMARY.txt** | Complete summary of all changes |

## ✅ What Got Fixed

| Issue | Before | After |
|-------|--------|-------|
| API Response | HTML (website) | JSON (API) |
| Database | Supabase RPC | Direct Neon TCP |
| CORS | Not configured | ✅ Properly configured |
| CSRF | Missing | ✅ Signed tokens |
| Auth | Supabase only | ✅ JWT + Supabase |
| Performance | HTTP RPC roundtrip | ✅ Direct TCP |

## 🧪 API Endpoints (After Deployment)

All endpoints at `https://api.bubbles-cafe.space`:

```
# Health & Configuration
GET  /api/health              ← Test this first
GET  /api/csrf-token

# Auth
GET  /api/auth/me
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/google/authorize

# Posts
GET  /api/posts               ← Test this second
GET  /api/posts/:id
POST /api/posts
PATCH /api/posts/:id
DELETE /api/posts/:id

# Comments, Users, Analytics, etc.
(See docs for full list)
```

## 🔧 Troubleshooting

### "npm run dev:server fails"
```bash
npm install                    # Ensure dependencies
npm run check                  # Check TypeScript
npm run setup:render          # Verify environment
```

### "Database connection error"
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon project is active
- Try: `DATABASE_URL="..." npm run db:migrate`

### "CORS errors on frontend"
- Verify `FRONTEND_URL=https://bubbles-cafe.space`
- Check X-CSRF-Token header is being sent
- See `server/index.ts` lines 40-50 for CORS config

### "500 errors after Render deploy"
- Check Render dashboard logs
- Verify all environment variables are set
- Run: `npm run setup:render` to test locally first

### "Still stuck?"
See `docs/DEPLOYMENT_CHECKLIST.md` - detailed troubleshooting section

## 📋 Deployment Checklist

- [ ] Test locally: `npm run dev:server`
- [ ] Verify env: `npm run setup:render`
- [ ] Initialize DB: `npm run db:migrate`
- [ ] Create Render account/project
- [ ] Push code to GitHub
- [ ] Create Web Service on Render
- [ ] Add all environment variables
- [ ] Deploy to Render
- [ ] Configure DNS (CNAME api → onrender.com)
- [ ] Wait 5 minutes for DNS
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Monitor Render logs for errors
- [ ] Update frontend if needed
- [ ] Done! 🎉

## ❓ Need More Info?

**Quick Questions:** See BACKEND_MIGRATION.md

**Full Setup Guide:** See docs/DEPLOYMENT_CHECKLIST.md

**Technical Details:** See docs/BACKEND_MIGRATION_SUMMARY.md

**All Changes:** See FINAL_SUMMARY.txt

## 🎯 Next Action

```bash
# 1. Test locally
npm run dev:server

# If that works ✅
# 2. Follow DEPLOYMENT_READY.md for Render deployment

# If issues ❌  
# Run this for diagnostics
npm run setup:render
```

---

**Current Status**: ✅ All code ready for deployment  
**Time to Deploy**: ~30 minutes  
**Expected Outcome**: Fully functional JSON API with Neon integration

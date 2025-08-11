# Vercel Deployment Fix Guide

## Issues Found and Fixed

### 1. Monorepo Build Configuration
**Problem**: The original `vercel.json` was trying to run `npm run build` at the root level, but this doesn't work properly with the monorepo workspace setup.

**Fix**: Updated the build command to specifically target the client workspace:
```json
"buildCommand": "npm install --no-audit --no-fund && npm run -w client build"
```

### 2. Output Directory Mismatch
**Problem**: The output directory was set to `dist`, but the client builds to `client/dist`.

**Fix**: Updated the output directory:
```json
"outputDirectory": "client/dist"
```

### 3. Missing Install Command
**Problem**: Vercel needs an explicit install command for monorepo setups.

**Fix**: Added install command:
```json
"installCommand": "npm install"
```

## Required Environment Variables

You need to set these environment variables in your Vercel project dashboard:

### Essential Variables:
- `NODE_ENV=production`
- `DATABASE_URL` - Your PostgreSQL database connection string
- `SESSION_SECRET` - A long random string (at least 32 characters)

### Client Variables:
- `VITE_API_URL` - Your API base URL (e.g., `https://api.bubblescafe.space`)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### Optional Variables:
- `GMAIL_USER` - For email functionality
- `GMAIL_APP_PASSWORD` - For email functionality
- `SENDGRID_API_KEY` - Alternative email service
- `SENDGRID_FROM` - SendGrid from email

## Steps to Fix Deployment

1. **Update Vercel Configuration**: The `vercel.json` file has been updated with the correct settings.

2. **Set Environment Variables**: Go to your Vercel project dashboard → Settings → Environment Variables and add all the required variables listed above.

3. **Redeploy**: Trigger a new deployment in Vercel.

4. **Check Build Logs**: Monitor the build logs to ensure the build process completes successfully.

## Common Issues and Solutions

### Build Fails with "vite: not found"
**Solution**: The updated configuration now properly installs dependencies and runs the build in the correct workspace.

### Environment Variables Not Available
**Solution**: Make sure all environment variables are set in the Vercel dashboard and are available during build time.

### API Rewrite Issues
**Solution**: The API is currently being rewritten to `https://api.bubblescafe.space`. If this service is down, you may need to update the rewrite rule or ensure the API service is running.

## Testing the Fix

After applying these changes:

1. Commit and push the updated `vercel.json`
2. Set all required environment variables in Vercel
3. Trigger a new deployment
4. Check the build logs for any remaining issues

The build should now complete successfully and your application should deploy properly.
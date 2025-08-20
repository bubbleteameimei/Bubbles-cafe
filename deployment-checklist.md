# Interactive Storytelling Platform Deployment Checklist

This checklist will help ensure your application is ready for deployment using the split deployment approach (Vercel frontend + Render backend).

## Prerequisites

Before deploying, make sure your development environment is properly configured and all tests are passing.

- [x] Project runs successfully locally
- [x] Responsive design is working on all device sizes (mobile, tablet, laptop, desktop)
- [x] Authentication flow is working correctly
- [x] Database schema is finalized and migrations are ready

## Frontend Configuration (Vercel)

- [ ] Set environment variables:
  - [ ] `VITE_API_URL`: URL of your Render backend (e.g., `https://your-api.onrender.com`)

- [ ] Verify vercel.json has correct configuration:
  ```json
  {
    "rewrites": [
      {
        "source": "/((?!api/.*).*)",
        "destination": "/index.html"
      }
    ],
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite"
  }
  ```

## Backend Configuration (Render)

- [ ] Set environment variables:
  - [ ] `FRONTEND_URL`: URL of your Vercel frontend (e.g., `https://your-app.vercel.app`)
  - [ ] `NODE_ENV`: Set to `production`
  - [ ] `DATABASE_URL`: Your Neon PostgreSQL connection string 
  - [ ] `SESSION_SECRET`: Random secure string for session encryption
  - [ ] `PORT`: Usually set to `3001`

- [ ] Verify render.yaml has correct configuration:
  ```yaml
  services:
    - type: web
      name: interactive-storytelling-api
      env: node
      buildCommand: npm install && npm run build
      startCommand: node dist/index.js
      healthCheckPath: /api/health
      envVars:
        - key: NODE_ENV
          value: production
        - key: FRONTEND_URL
          sync: false
        - key: DATABASE_URL
          sync: false
        - key: SESSION_SECRET
          generateValue: true
  ```

## CORS & Cookie Configuration

- [x] Backend CORS is properly configured to accept requests from Vercel frontend
- [x] Session cookies are configured with:
  - [x] `secure: true` in production
  - [x] `sameSite: 'none'` for cross-domain requests
  - [x] `httpOnly: true` for better security

## Authentication & Security

- [x] CSRF protection is properly implemented
- [ ] OAuth callback URLs are updated for production
- [x] API requests include credentials (`credentials: 'include'`)
- [x] Security headers are properly configured

## Database

- [ ] Production database is properly set up (Neon or other PostgreSQL provider)
- [ ] Database migration script is ready to run
- [ ] Database backup strategy is in place

## Performance Optimization

- [x] Frontend assets are optimized and minified
- [x] Images use proper formats (WebP where possible)
- [x] React components are properly code-split
- [x] Server has compression middleware

## Deployment Steps

### Frontend (Vercel)

1. Create a new project in Vercel dashboard
2. Connect to your Git repository
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variables (see above)
5. Deploy

### Backend (Render)

1. Create a new Web Service in Render dashboard
2. Connect to your Git repository
3. Configure build settings:
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
4. Set environment variables (see above)
5. Deploy

## Post-Deployment Verification

After deploying both frontend and backend, run the verification script to check that everything is working correctly:

```bash
node test-cross-domain.js
```

Ensure all tests pass, especially:
- API connectivity
- CORS configuration
- Authentication flow
- Environment variables
- Static asset loading

## Troubleshooting Common Issues

1. **CORS errors**: Verify FRONTEND_URL environment variable is correctly set on backend
2. **Authentication issues**: Check that cookies are being properly sent and received
3. **API connection failures**: Verify VITE_API_URL is correctly set on frontend
4. **Database connection errors**: Check DATABASE_URL and database access
5. **Missing environment variables**: Verify all required environment variables are set
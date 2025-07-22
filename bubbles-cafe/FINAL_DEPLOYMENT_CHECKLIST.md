# Final Deployment Checklist

This checklist combines both the technical requirements for split deployment and practical verification steps to ensure your interactive storytelling platform is ready for migration from Replit to Vercel (frontend) and Render (backend).

## 1. Backend Verification

- [ ] Express server is running without errors
  ```bash
  # Verify server is running properly
  npm run dev
  ```

- [ ] API endpoints are working properly
  ```bash
  # Test your API health endpoint
  curl https://your-replit-url/api/health
  
  # Test your stories API endpoint
  curl https://your-replit-url/api/posts
  ```

- [ ] CSRF protection is properly configured in server/middleware/csrf-protection.ts
  ```bash
  # Test CSRF protection
  node test-csrf-protection.js
  ```

## 2. Database Connection

- [ ] Database URL is correctly set in environment variables
  ```bash
  # Check your environment variables
  echo $DATABASE_URL
  ```

- [ ] Database tables exist and are properly structured
  ```bash
  # List database tables
  psql $DATABASE_URL -c "\dt"
  ```

- [ ] Backend can successfully query the database
  ```bash
  # Run the database verification script
  npx tsx scripts/verify-database.ts
  ```

- [ ] Create database backup before migration
  ```bash
  # Create full database backup
  npx tsx scripts/full-backup.ts
  ```

## 3. CORS and Cross-Domain Configuration

- [x] CORS middleware is properly configured in server/cors-setup.ts

- [x] Session cookie settings are prepared for cross-domain operation
  ```javascript
  // Verify settings in server/index.ts
  cookie: {
    secure: true,        // Required for cross-domain cookies
    sameSite: 'none',    // Required for cross-domain requests
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
  ```

- [x] Frontend API requests include credentials for cross-domain cookies
  ```javascript
  // Verify in client/src/lib/queryClient.ts
  credentials: 'include'
  ```

- [x] Cross-domain verification script is ready
  ```bash
  # Test cross-domain authentication setup
  node verify-cross-domain-auth.js <frontend-url> <backend-url>
  ```

## 4. Environment Variables

- [ ] Backend environment variables are documented for Render
  ```
  NODE_ENV=production
  DATABASE_URL=
  SESSION_SECRET=
  FRONTEND_URL=
  ```

- [ ] Frontend environment variables are documented for Vercel
  ```
  VITE_API_URL=
  ```

- [ ] OAuth redirect URIs are prepared for production (if applicable)

## 5. Dependencies and Build Process

- [ ] All dependencies are properly installed
  ```bash
  # Reinstall dependencies if needed
  rm -rf node_modules package-lock.json
  npm install
  ```

- [ ] Build process works without errors
  ```bash
  # Test frontend build
  npm run build
  ```

- [ ] TypeScript compiles without errors (if using TypeScript)
  ```bash
  # Compile TypeScript
  tsc
  ```

## 6. Testing Split Deployment Setup

- [ ] Vercel.json is properly configured for client-side routing
  ```bash
  # Verify vercel.json exists and has proper configuration
  cat vercel.json
  ```

- [ ] Render.yaml is properly configured for backend deployment
  ```bash
  # Verify render.yaml exists and has proper configuration
  cat render.yaml
  ```

- [ ] Cross-domain deployment test script runs successfully
  ```bash
  # Run the cross-domain test script (after deployment)
  node deployment-health-check.js <frontend-url> <backend-url>
  ```

## 7. Run App from Shell (Final Test)

- [ ] Application runs properly from command line
  ```bash
  # Start the application using npm script
  npm run dev
  ```

- [ ] No console errors are present

- [ ] Application works with proper authentication and data fetching

## 7a. Responsive Design Verification

- [x] Mobile layout (320px-639px) displays properly in testing
- [x] Tablet layout (640px-1023px) displays properly in testing
- [x] Laptop layout (1024px-1279px) displays properly in testing  
- [x] Desktop layout (1280px+) displays properly in testing
- [x] Reader component adapts to all screen sizes
- [x] Appropriate font sizes and spacing on all devices
- [x] Touch targets are properly sized for mobile devices

## 8. Deployment Documentation

- [x] Review DEPLOYMENT_GUIDE.md for step-by-step instructions
- [x] Review PRE_DEPLOYMENT_CHECKLIST.md for detailed preparation
- [ ] Review DEPLOYMENT_TESTING.md for post-deployment verification
- [ ] Review DATABASE_MIGRATION_GUIDE.md for database migration steps
- [ ] Review PRIVACY_SETTINGS.md for privacy considerations
- [x] Review RESPONSIVE_DESIGN_CHECKLIST.md for device adaptation
- [x] Review IMAGE_OPTIMIZATION_GUIDE.md for image performance

## 9. Database Migration Preparation

- [ ] Database backup script has been tested
  ```bash
  # Create a test backup
  npx tsx scripts/full-backup.ts
  ```

- [ ] Render PostgreSQL setup instructions reviewed in DATABASE_MIGRATION_GUIDE.md

- [ ] Database restore script is ready for use
  ```bash
  # Test on a small database or test environment if possible
  npx tsx scripts/restore-backup.ts
  ```

## 10. Post-Deployment Verification Plan

- [ ] Health check script is ready for testing the deployed application
  ```bash
  node deployment-health-check.js <frontend-url> <backend-url>
  ```

- [ ] Database verification script is ready for the new database
  ```bash
  npx tsx scripts/verify-database.ts
  ```

- [ ] Manual testing checklist is prepared in DEPLOYMENT_TESTING.md

---

## Final Steps Before Deployment

1. **Create GitHub Repository**
   - Push your project to GitHub for Vercel and Render deployment

2. **Prepare Environment Secret Values**
   - Generate new secure secrets for production
   - Document all required environment variables

3. **Create Deployment Accounts**
   - Sign up for Vercel and Render accounts if you haven't already
   - Connect your GitHub repository

4. **Follow Deployment Guide**
   - Deploy backend to Render first
   - Use the backend URL when deploying frontend to Vercel
   - Update backend with frontend URL after deployment

5. **Run Health Checks**
   - Verify deployment using deployment-health-check.js
   - Run database verification using verify-database.ts
   - Complete all tests in DEPLOYMENT_TESTING.md
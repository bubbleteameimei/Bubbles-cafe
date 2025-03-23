# Pre-Deployment Checklist

Before deploying your interactive storytelling platform to Vercel (frontend) and Render (backend), use this checklist to ensure everything is properly configured for a smooth deployment process.

## Backend (server) Configuration

- [ ] Server is configured to listen on `process.env.PORT || 3001`
- [ ] CORS is properly configured to allow cross-domain requests (server/cors-setup.ts)
- [ ] Session cookie settings include `secure: true` and `sameSite: 'none'`
- [ ] Environment variables are properly referenced and have fallbacks
- [ ] Database connection uses `process.env.DATABASE_URL`
- [ ] OAuth providers (if used) are configured for cross-domain redirects
- [ ] All sensitive data and credentials are stored in environment variables
- [ ] Health check endpoint (`/api/health`) returns proper information
- [ ] Public config endpoint (`/api/config/public`) is accessible

## Frontend (client) Configuration

- [x] API requests use `import.meta.env.VITE_API_URL` as the base URL via asset-path.ts
- [x] All API requests include `credentials: 'include'` for cross-domain cookies
- [x] Error handling properly manages API errors and connection issues
- [x] Loading states are present for all asynchronous operations
- [x] `vercel.json` file is present in the project root with proper configurations
- [x] Static asset paths use relative paths or proper asset handling
- [x] Environment variables are properly referenced with fallbacks
- [x] Authentication flow works with redirects from backend
- [x] React Query configurations maintain correct cache invalidation
- [x] Responsive design implemented for all device types (mobile, tablet, laptop, desktop)
- [x] Image optimization strategy in place for better performance across devices
- [x] Dark mode support with proper contrast for all screen sizes

## Database Preparation

- [ ] Database schema matches the expected structure in production
- [ ] Data migrations (if needed) are ready to be applied
- [ ] Database connection string format is compatible with Render PostgreSQL
- [ ] Database indexes are created for performance optimization
- [ ] Sensitive data is properly secured or encrypted
- [ ] Database backup plan is in place

## Build and Deployment Configuration

- [ ] `package.json` has proper build and start scripts
- [ ] Dependencies are properly listed in `package.json`
- [ ] Dev dependencies and production dependencies are correctly separated
- [ ] TypeScript configurations (if applicable) are correct
- [ ] Build process works locally without errors
- [ ] `render.yaml` file is present with proper configuration
- [ ] Environment variables are documented for both Vercel and Render

## Security Checks

- [ ] CSRF protection is properly implemented
- [ ] API rate limiting is configured (or planned)
- [ ] Authentication endpoints properly validate credentials
- [ ] Input validation is present on all user inputs
- [ ] SQL injection protections are in place
- [ ] Security headers are implemented
- [ ] No sensitive information is logged
- [ ] No credentials or API keys are hardcoded

## Testing

- [ ] Manual testing of all critical paths has been performed
- [ ] Authentication flows work correctly
- [ ] CRUD operations for all data models work
- [ ] Cross-browser compatibility has been verified
- [x] Mobile responsiveness has been implemented and confirmed
- [x] Tablet, laptop, and desktop responsiveness has been implemented and confirmed
- [x] Reader component is fully responsive across all device types
- [ ] Error states and edge cases have been tested
- [ ] Performance has been evaluated
- [x] Responsive demo page confirms proper adaptation to different screen sizes

## Documentation

- [ ] README.md is updated with deployment information
- [ ] Environment variables are documented
- [ ] Deployment steps are documented (DEPLOYMENT_GUIDE.md)
- [ ] Testing procedures after deployment are documented (DEPLOYMENT_TESTING.md)
- [ ] Privacy considerations are documented (PRIVACY_SETTINGS.md)
- [ ] Rollback procedures are documented (in case of deployment issues)

## Final Checks

- [ ] All console logs are cleaned up or set to appropriate log levels
- [ ] No debugging code remains in production build
- [ ] All TODOs and placeholder content have been addressed
- [ ] All critical bugs have been fixed
- [ ] Version number is updated (if applicable)
- [ ] Git repository contains the latest code
- [ ] License files are included if necessary

---

After completing this checklist, you should be ready to follow the steps in DEPLOYMENT_GUIDE.md to deploy your application to Vercel and Render.
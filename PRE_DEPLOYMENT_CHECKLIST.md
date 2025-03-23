# Pre-Deployment Checklist

Use this checklist to ensure your project is ready for deployment from Replit to Vercel (frontend) and Render (backend).

## Code Preparation

- [ ] Remove Replit-specific files (`.replit`, `replit.nix`)
- [ ] Check and fix any console errors in the browser and server logs
- [ ] Ensure all file paths use forward slashes (for cross-platform compatibility)
- [ ] Remove any hardcoded URLs or ports and replace with environment variables

## Environment Variables Setup

- [ ] Create `.env.production` file with production settings
- [ ] Create `.env.development` file with development settings
- [ ] Ensure all sensitive information is stored as environment variables
- [ ] Validate all environment variables are properly accessed in code

## Database Preparation

- [ ] Create a database backup using `pg_dump $DATABASE_URL > database_backup.sql`
- [ ] Plan for a new PostgreSQL database provider (Neon, Supabase, Railway, etc.)
- [ ] Test database connection using the provider's connection string
- [ ] Prepare database migration scripts if needed

## CORS and Cross-Domain Support

- [ ] Add CORS middleware to backend (see DEPLOYMENT_GUIDE.md for options)
- [ ] Update session cookie settings with `sameSite: 'none', secure: true`
- [ ] Update CSRF token settings for cross-domain support
- [ ] Test API endpoints with appropriate CORS headers

## Build Configuration

- [ ] Create or verify `vercel.json` for frontend deployment
- [ ] Create or verify `render.yaml` for backend deployment
- [ ] Update `tsconfig.server.json` for backend TypeScript compilation
- [ ] Add build scripts to `package.json` (will be done during deployment)

## Frontend Configuration

- [ ] Update API URL in `client/src/lib/api.ts` to use environment variables
- [ ] Ensure all API requests include credentials and CSRF tokens
- [ ] Test frontend with a local backend to verify cross-domain functionality
- [ ] Remove any references to localhost or hardcoded backend URLs

## Backend Configuration

- [ ] Ensure server listens on `process.env.PORT || 3001`
- [ ] Add proper error handling for database connection failures
- [ ] Implement health check endpoint for monitoring
- [ ] Test backend with cross-domain requests

## Final Verification

- [ ] Run a complete application test in development mode
- [ ] Verify all API endpoints work correctly
- [ ] Check that authentication flows work properly
- [ ] Test error handling and edge cases
- [ ] Ensure all assets (images, fonts, etc.) load correctly
- [ ] Validate SEO and accessibility features

## Deployment Resources

- [ ] Create accounts on Vercel and Render if you don't have them
- [ ] Set up a GitHub repository for your project
- [ ] Prepare documentation for post-deployment monitoring and maintenance
- [ ] Plan database backup strategy for production

Once all items are checked, follow the instructions in DEPLOYMENT_GUIDE.md to deploy your application.
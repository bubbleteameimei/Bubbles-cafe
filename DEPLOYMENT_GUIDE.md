# Deployment Guide

This guide provides instructions for deploying the Horror Stories interactive storytelling platform with:
- Frontend on Vercel
- Backend on Render
- Database on a PostgreSQL provider (such as Neon, Supabase, or Railway)

## Prerequisites

Before you begin, make sure you have:
- A Vercel account (https://vercel.com)
- A Render account (https://render.com)
- A PostgreSQL database provider account (Neon, Supabase, Railway, etc.)
- Git installed on your local machine

## Pre-Deployment Preparation

Before moving your project from Replit to a split deployment setup, ensure you:

1. **Clean up your code**:
   - Check for console errors in Replit's logs and fix any major issues
   - Remove unnecessary files like `.replit` and `replit.nix` (these are Replit-specific)
   - Make sure all file references use forward slashes for path separators (important for cross-platform compatibility)

2. **Prepare environment variables**:
   - Ensure all hard-coded configuration values are replaced with environment variables
   - Create separate `.env.production` and `.env.development` files (already done in this project)
   - Make sure secrets like `SESSION_SECRET` are properly secured

## Part 1: Database Setup

1. **Create a PostgreSQL Database**:
   - Sign up for a PostgreSQL provider (we recommend Neon for Serverless PostgreSQL)
   - Create a new PostgreSQL database
   - Get your database connection string (DATABASE_URL)

2. **Export Your Current Data**:
   ```bash
   # Use the pg_dump command to export your current database
   pg_dump $DATABASE_URL > database_backup.sql
   ```

3. **Import to Your New Database**:
   ```bash
   # Import your data to the new database
   psql YOUR_NEW_DATABASE_URL < database_backup.sql
   ```

## Part 2: Backend Deployment on Render

1. **Prepare Your Backend**:
   - Make sure your render.yaml file is in your project root
   - Ensure your server code handles CORS properly for cross-domain requests

2. **Deploy to Render**:
   - Sign in to Render
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select "Use render.yaml" for configuration
   - Set the required environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: production
     - `FRONTEND_URL`: Your Vercel frontend URL (you can update this later)
     - `SESSION_SECRET`: A secure random string
   - Click "Create Web Service"

3. **Verify Backend Deployment**:
   - Once deployed, visit your Render service URL + "/health" to check the health endpoint
   - Ensure the response shows `{ "status": "ok" }`

## Part 3: Frontend Deployment on Vercel

1. **Prepare Your Frontend**:
   - Make sure your vercel.json file is in your project root
   - Create a `.env.production` file with the following:
     ```
     VITE_API_URL=https://your-render-service-url.onrender.com
     ```

2. **Deploy to Vercel**:
   - Sign in to Vercel
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Build Command: `npm run build:client`
     - Output Directory: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your Render backend URL
   - Click "Deploy"

3. **Verify Frontend Deployment**:
   - Once deployed, visit your Vercel URL
   - Ensure the frontend loads and can connect to the backend

## Part 4: Update Cross-Domain Configuration

1. **Update Backend CORS Settings**:
   - Go to your Render dashboard
   - Update the `FRONTEND_URL` environment variable with your actual Vercel URL
   - Restart your backend service

2. **Test Cross-Domain Requests**:
   - Visit your frontend on Vercel
   - Check if API requests to the backend are working

## Part 5: Manual Code Changes Required

Since we couldn't modify all the necessary files in this environment, you'll need to make the following changes manually before deploying:

1. **Add CORS Support to the Backend**:
   Add this to your `server/index.ts` file, after the imports:
   ```typescript
   import cors from 'cors';
   ```

   And add this middleware setup before your other middleware:
   ```typescript
   // Configure CORS for cross-domain requests
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
   }));
   ```

2. **Update Session Cookie Settings**:
   In `server/index.ts`, modify the session configuration:
   ```typescript
   app.use(session({
     secret: process.env.SESSION_SECRET || 'horror-stories-session-secret',
     resave: false,
     saveUninitialized: false,
     cookie: {
       secure: process.env.NODE_ENV === 'production',
       httpOnly: true,
       sameSite: 'none', // Required for cross-domain cookies
       maxAge: 24 * 60 * 60 * 1000 // 24 hours
     },
     store: storage.sessionStore
   }));
   ```

3. **Update CSRF Settings**:
   In `server/middleware/csrf-protection.ts`, ensure the CSRF token cookie has the right settings:
   ```typescript
   export function setCsrfToken(secureCookie = false) {
     return (req: Request, res: Response, next: NextFunction) => {
       if (!req.session.csrfToken) {
         const token = crypto.randomBytes(32).toString('hex');
         req.session.csrfToken = token;
         
         res.cookie(CSRF_TOKEN_NAME, token, {
           httpOnly: false,
           secure: secureCookie,
           sameSite: 'none', // Required for cross-domain
           path: '/'
         });
       }
       next();
     };
   }
   ```

4. **Update API URL in Frontend**:
   Create or modify `client/src/lib/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
   
   export const apiRequest = (endpoint: string, options?: RequestInit) => {
     return fetch(`${API_BASE_URL}${endpoint}`, {
       ...options,
       credentials: 'include',
       headers: {
         ...options?.headers,
         'Content-Type': 'application/json',
       },
     });
   };
   ```

5. **Add tsconfig.server.json**:
   Create this file if it doesn't exist yet (should be created already)

6. **Add Build Scripts**:
   You'll need to manually add these scripts to your package.json when deploying:
   ```json
   "scripts": {
     "build:client": "vite build",
     "build:server": "tsc -p tsconfig.server.json",
     "start:server": "NODE_ENV=production node dist-server/server/index.js"
   }
   ```

## Troubleshooting

- **CORS Issues**: If you see CORS errors, ensure your backend's CORS configuration allows your frontend's domain. Update the `FRONTEND_URL` environment variable in Render if needed.
- **Session/Cookie Issues**: Make sure the `sameSite` and `secure` settings are correct for cross-domain cookies. For cross-domain setups, `sameSite: 'none'` and `secure: true` are required.
- **CSRF Token Problems**: Check that your CSRF token is being correctly sent in cross-domain requests. Inspect Network tab in browser dev tools to verify the token is included in the request headers.
- **PostgreSQL Connection Issues**: Verify your DATABASE_URL is correct and the database allows connections from your backend. Check if your provider requires specific IP allowlisting.
- **Static Asset Paths**: If images or other assets aren't loading, ensure paths are using the correct base URL. Check your Vite configuration.
- **Environment Variables**: Confirm that all environment variables are correctly set in both Vercel and Render. Double-check for typos in variable names.
- **404 Errors on Refresh**: If you get 404s when refreshing pages, check your Vercel rewrites configuration to ensure all routes redirect to the main index.html.

## Maintenance

- **Database Backups**: Set up regular backups of your PostgreSQL database
- **Monitoring**: Use Render's and Vercel's built-in monitoring tools
- **Scaling**: Both Render and Vercel offer options to scale your application if needed

## Benefits of Split Deployment

This deployment approach offers several advantages:

1. **Optimized Performance**: Vercel excels at frontend hosting with its global CDN, while Render provides robust backend services.
2. **Independent Scaling**: Scale frontend and backend resources independently based on demand patterns.
3. **Cost Efficiency**: Use the free tier of both platforms while starting out, then scale as needed.
4. **Easier Maintenance**: Update frontend or backend independently without affecting the other.
5. **Better Developer Experience**: Use platform-specific CI/CD workflows optimized for each part of your application.
6. **Enhanced Security**: Maintain stricter security boundaries between frontend and backend components.

---

For any questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- Your PostgreSQL provider's documentation
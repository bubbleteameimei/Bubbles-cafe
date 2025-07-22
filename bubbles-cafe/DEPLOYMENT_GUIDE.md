# Split Deployment Guide: Vercel (Frontend) and Render (Backend)

This guide walks you through deploying your interactive storytelling platform outside of Replit, using a split deployment strategy with Vercel for the frontend and Render for the backend.

## Prerequisites

Before starting the deployment process, make sure you have:

1. A GitHub account
2. A Vercel account (free tier is fine)
3. A Render account (free tier works for development, paid tier recommended for production)
4. Your project code ready in a GitHub repository

## Step 1: Prepare Your Project

### Backend Preparation

1. Make sure your server listens on the correct port:
   ```javascript
   const PORT = process.env.PORT || 3001;
   app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
   ```

2. Ensure your CORS configuration allows cross-domain requests:
   ```javascript
   // server/cors-setup.ts is already configured to handle this
   // It uses the FRONTEND_URL environment variable to determine the allowed origin
   ```

3. Configure proper cookie settings for cross-domain authentication:
   ```javascript
   cookie: {
     secure: true,        // Required for cross-domain cookies
     sameSite: 'none',    // Required for cross-domain requests
     httpOnly: true,
     maxAge: 24 * 60 * 60 * 1000 // 24 hours
   }
   ```

### Frontend Preparation

1. Make sure your frontend is configured to make API requests to the backend:
   ```typescript
   // client/src/lib/apiRequest.ts or similar
   const API_URL = import.meta.env.VITE_API_URL || '';
   ```

2. Ensure all API requests include credentials:
   ```typescript
   // client/src/lib/queryClient.ts
   export const apiRequest = async (url: string, options?: RequestInit) => {
     const response = await fetch(`${API_URL}${url}`, {
       ...options,
       credentials: 'include',
       headers: {
         ...options?.headers,
         'Content-Type': 'application/json',
       },
     });
     // ... error handling
   };
   ```

3. Create a `vercel.json` file in your project root (already done):
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

## Step 2: Deploy the Backend to Render

1. Log in to your Render account and go to the Dashboard.

2. Click "New" and select "Web Service".

3. Connect your GitHub repository and select it.

4. Configure the service:
   - **Name**: `your-app-api` (choose a name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod` (or whatever starts your server)
   - **Plan**: Select appropriate plan (Free for testing, paid for production)

5. Add environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your PostgreSQL connection string (create a Render PostgreSQL instance or use external)
   - `SESSION_SECRET`: A strong random string
   - `FRONTEND_URL`: Your Vercel frontend URL (once you have it)
   - Add any other environment variables your app needs

6. Click "Create Web Service" and wait for the deployment to complete.

7. Once deployed, note the service URL (e.g., `https://your-app-api.onrender.com`).

## Step 3: Deploy the Frontend to Vercel

1. Log in to your Vercel account and go to the Dashboard.

2. Click "Add New" and select "Project".

3. Import your GitHub repository.

4. Configure the project:
   - **Project Name**: Choose a name
   - **Framework Preset**: Vite
   - **Root Directory**: If your frontend is not in the root, specify the path

5. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app-api.onrender.com`)

6. Click "Deploy" and wait for the deployment to complete.

7. Once deployed, note the frontend URL (e.g., `https://your-app.vercel.app`).

## Step 4: Update Backend with Frontend URL

1. Go back to your Render service dashboard.

2. Navigate to "Environment" tab.

3. Update the `FRONTEND_URL` variable with your Vercel frontend URL.

4. Click "Save Changes" and wait for the service to redeploy.

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL in a browser.

2. Test the following functionality:
   - Static content loading
   - API connectivity
   - Authentication flows
   - Data persistence

3. Use the provided `deployment-health-check.js` script to verify your deployment:
   ```bash
   node deployment-health-check.js https://your-app.vercel.app https://your-app-api.onrender.com
   ```

## Troubleshooting

### CORS Issues

If you're experiencing CORS errors:

1. Check that the `FRONTEND_URL` environment variable on Render exactly matches your Vercel URL.
2. Ensure your frontend is making requests with `credentials: 'include'`.
3. Verify that cookies have `sameSite: 'none'` and `secure: true` on the backend.

### Authentication Problems

If authentication doesn't work:

1. Make sure OAuth redirect URIs are updated if you're using social login.
2. Check that cookies are being properly set and sent with requests.
3. Verify session storage is properly configured on the backend.

### Database Connectivity

If your app can't connect to the database:

1. Double-check your `DATABASE_URL` environment variable on Render.
2. Ensure your database allows connections from your Render service.
3. Check if your database provider requires additional SSL certificates.

## Additional Notes

### Custom Domains

For production:

1. Consider setting up custom domains for both your frontend and backend.
2. Update your environment variables accordingly after setting up custom domains.

### Performance Optimization

To improve performance:

1. Consider using a CDN for static assets.
2. Implement caching strategies where appropriate.
3. Consider scaling your Render service for production workloads.

### Security Recommendations

For enhanced security:

1. Set up regular database backups.
2. Implement rate limiting on your API endpoints.
3. Use HTTPS for all communications.
4. Regularly rotate session secrets and API keys.

For more specific guides, refer to the [Vercel documentation](https://vercel.com/docs) and [Render documentation](https://render.com/docs).
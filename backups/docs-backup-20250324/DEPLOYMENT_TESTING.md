# Deployment Testing Guide

After deploying your interactive storytelling platform to Vercel (frontend) and Render (backend), follow this guide to verify that everything is working correctly in your split deployment environment.

## Automated Testing

Start with the automated deployment health check script:

```bash
node deployment-health-check.js https://your-frontend.vercel.app https://your-backend.onrender.com
```

This script will verify:
- Backend health and availability
- CORS configuration
- Environment variables
- Authentication endpoints
- Basic frontend connectivity

## Manual Testing Checklist

### 1. Basic Connectivity

- [ ] Frontend loads properly at your Vercel URL
- [ ] No JavaScript console errors on page load
- [ ] Static assets (images, fonts, styles) load correctly
- [ ] Backend health endpoint returns 200 OK (`/api/health`)
- [ ] Public config endpoint returns expected data (`/api/config/public`)

### 2. Authentication

- [ ] User registration works correctly
- [ ] User login works correctly
- [ ] Session persists across page refreshes
- [ ] Logout works correctly
- [ ] Password reset flow functions (if implemented)
- [ ] OAuth authentication works (if implemented)
- [ ] Protected routes require authentication

### 3. Core Functionality

- [ ] Home page content loads correctly
- [ ] Story listings display properly
- [ ] Individual stories can be viewed
- [ ] Interactive elements function as expected
- [ ] Story progress is saved correctly
- [ ] User-specific content displays correctly when logged in
- [ ] Comments and social features work (if implemented)

### 4. Data Operations

- [ ] New content can be created (if applicable)
- [ ] Content can be updated (if applicable)
- [ ] Content can be deleted (if applicable)
- [ ] Search functionality works (if implemented)
- [ ] Filtering and sorting work (if implemented)
- [ ] Any data visualization displays correctly

### 5. Cross-Browser Testing

Test the application in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 6. Mobile Testing

- [ ] Site is responsive on mobile devices
- [ ] Interactive elements are usable on touch screens
- [ ] No horizontal scrolling issues
- [ ] Text is readable without zooming
- [ ] Authentication flows work on mobile

### 7. Performance Testing

- [ ] Page load times are acceptable (< 3 seconds)
- [ ] Interactions feel responsive
- [ ] Scrolling is smooth
- [ ] Animations play smoothly
- [ ] Large data sets load efficiently

### 8. Error Handling

- [ ] 404 page displays correctly for invalid routes
- [ ] API errors are handled gracefully
- [ ] Form validation errors display properly
- [ ] Network interruptions are handled properly
- [ ] Error messages are user-friendly

### 9. Security Testing

- [ ] HTTPS is enforced
- [ ] Authentication tokens work correctly
- [ ] CSRF protection is functioning
- [ ] API endpoints validate permissions
- [ ] No sensitive data is exposed in responses
- [ ] Rate limiting is applied to critical endpoints

### 10. End-to-End User Flows

Test complete user journeys:
- [ ] New user registration to story completion
- [ ] Returning user authentication and progress continuation
- [ ] Content creation flow (if applicable)
- [ ] Social sharing flows (if implemented)
- [ ] Account management features

## Common Issues and Solutions

### CORS Errors

If you see CORS errors in the browser console:

1. Verify the `FRONTEND_URL` environment variable on Render exactly matches your Vercel URL (including https:// and no trailing slash)
2. Check that `credentials: 'include'` is set on all fetch requests
3. Verify CORS middleware is correctly configured on the backend

### Cookie/Authentication Issues

If authentication isn't working:

1. Check that cookies have `secure: true` and `sameSite: 'none'` attributes
2. Verify that the `httpOnly` attribute is set correctly based on your needs
3. Make sure the session store is properly configured
4. Check for any SSL/HTTPS issues that might affect cookie transmission

### Database Connection Problems

If database operations fail:

1. Verify your `DATABASE_URL` environment variable is correct
2. Check if your database allows connections from your Render service
3. Confirm that the database schema matches what your app expects
4. Look for any SSL certificate requirements for database connections

### Environment Variable Issues

If features aren't working due to missing configuration:

1. Double-check all environment variables on both Vercel and Render
2. Ensure variable names match exactly what your code expects
3. Verify that sensitive variables are properly secured
4. Remember that Vercel environment variables need to be prefixed with `VITE_` to be accessible to the frontend

### 404 Errors on Page Refresh

If refreshing pages results in 404 errors:

1. Make sure your `vercel.json` rewrites configuration is correct
2. Verify that client-side routing is properly configured

## Advanced Testing

For production deployments, consider these additional tests:

- Load testing to simulate multiple concurrent users
- Penetration testing to identify security vulnerabilities
- Accessibility testing using tools like Lighthouse or axe
- SEO analysis to ensure search engine optimization
- Analytics integration testing to verify data collection

## Monitoring Your Deployment

Once deployed, set up monitoring:

1. Configure error tracking (like Sentry) to capture runtime issues
2. Set up performance monitoring to track app speed
3. Implement logging for server-side operations
4. Configure alerts for critical failures
5. Regularly review metrics to identify optimization opportunities

## Getting Help

If you encounter issues that aren't covered by this guide:

- Check the logs in your Vercel and Render dashboards
- Review the documentation for specific services
- Search for error messages in their respective documentation
- Consider reaching out to the service support teams
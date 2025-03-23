# Deployment Testing Guide

After deploying your application to Vercel (frontend) and Render (backend), follow these steps to thoroughly test your deployment before making it public.

## 1. Verify Infrastructure

- [ ] **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health` to confirm the backend is running
- [ ] **Frontend Loading**: Visit your Vercel URL to ensure the frontend loads correctly
- [ ] **Database Connection**: Check server logs to confirm successful database connection
- [ ] **Environment Variables**: Verify all environment variables are set correctly in both platforms

## 2. Test Authentication

- [ ] **User Registration**: Create a new account to verify the registration flow
- [ ] **User Login**: Log in with the newly created account
- [ ] **Session Persistence**: Close and reopen the browser to check if you remain logged in
- [ ] **Password Reset**: Test the password reset functionality if implemented

## 3. Test Core Features

- [ ] **Story Browsing**: Navigate through different stories
- [ ] **Story Reading**: Open and read a complete story
- [ ] **Likes/Interactions**: Test like functionality on various stories
- [ ] **Comments**: Add comments if the feature is available
- [ ] **User Profile**: Visit and edit your user profile
- [ ] **Interactive Elements**: Test any interactive story elements

## 4. Cross-Browser Testing

- [ ] **Chrome**: Test the application in Chrome
- [ ] **Firefox**: Test the application in Firefox
- [ ] **Safari**: Test the application in Safari if possible
- [ ] **Mobile Browsers**: Test on mobile devices or using responsive design tools

## 5. Performance Testing

- [ ] **Load Time**: Measure initial page load time
- [ ] **Response Time**: Check API response times
- [ ] **Resource Usage**: Monitor backend resource usage during testing
- [ ] **Database Performance**: Check query execution times

## 6. Security Testing

- [ ] **HTTPS**: Verify all connections use HTTPS
- [ ] **CORS**: Test cross-origin requests
- [ ] **Authentication**: Try accessing protected routes without authentication
- [ ] **Input Validation**: Test form inputs with various edge cases
- [ ] **Session Management**: Verify session expiration and token refreshing

## 7. Error Handling

- [ ] **404 Pages**: Test navigation to non-existent routes
- [ ] **API Errors**: Trigger API errors intentionally and check handling
- [ ] **Form Validation**: Submit invalid form data
- [ ] **Offline Mode**: Test behavior when network is unavailable

## 8. Monitoring Setup

- [ ] **Error Logging**: Verify errors are properly logged
- [ ] **Performance Monitoring**: Set up monitoring for both frontend and backend
- [ ] **Alerts**: Configure alerts for critical errors or performance issues
- [ ] **Analytics**: Set up analytics to track user behavior

## 9. Final Verification

- [ ] **End-to-End Workflow**: Complete an entire user journey
- [ ] **Data Integrity**: Verify data is correctly saved and retrieved
- [ ] **SEO Elements**: Check meta tags and SEO-related elements
- [ ] **Accessibility**: Verify basic accessibility features

## 10. Pre-Launch Tasks

- [ ] **Documentation**: Update documentation if needed
- [ ] **Backup**: Create a database backup before public launch
- [ ] **Scale Check**: Ensure resources are sufficient for expected traffic
- [ ] **Rollback Plan**: Document steps for rolling back if issues occur

## Troubleshooting Common Issues

### CORS Errors
- Check allowed origins in backend CORS configuration
- Verify credentials settings for cross-domain cookies
- Check for proper headers in API requests

### Authentication Issues
- Verify cookie settings (secure, httpOnly, sameSite)
- Check session expiration and refresh mechanisms
- Confirm CSRF token handling

### Database Connection Problems
- Check connection string format
- Verify IP allowlisting if required by database provider
- Check for connection limits or resource constraints

### 404 or Routing Errors
- Verify Vercel rewrites configuration
- Check API endpoint definitions
- Test with and without trailing slashes in URLs
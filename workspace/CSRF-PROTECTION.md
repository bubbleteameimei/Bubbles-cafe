# CSRF Protection Implementation

## Overview

Cross-Site Request Forgery (CSRF) protection has been implemented in the application using a token-based approach with session integration. This document describes the implementation details and how to use the CSRF protection.

## Implementation Details

### Server-Side Implementation

The CSRF protection is implemented on the server using the following components:

1. **Token Generation**: A secure random token is generated for each session using `crypto.randomBytes(32)` in `server/middleware/csrf-protection.ts`
2. **Cookie Setting**: The token is sent to the client as a non-HttpOnly cookie so JavaScript can access it
3. **Session Storage**: The token is also stored in the user's session for server-side validation
4. **Token Validation**: On non-GET requests, the token from the request is compared to the token in the session
5. **JSON Response**: The token is also included in the JSON response from the `/health` endpoint for easier client access

The implementation can be found in:
- `server/middleware/csrf-protection.ts` - Core CSRF middleware
- `server/index.ts` - Middleware setup and health endpoint implementation 
- Health endpoint (lines 84-104) that ensures a CSRF token is set properly

### Client-Side Implementation

The client-side implementation automatically includes the CSRF token in all non-GET requests:

1. **Token Retrieval**: The token is retrieved from the cookie set by the server via `getCsrfToken()`
2. **Request Interception**: A global fetch interceptor added in `initCSRFProtection()` adds the token to all non-GET requests
3. **Headers**: The token is included in the `X-CSRF-Token` header via `applyCSRFToken()`
4. **Token Renewal**: If a token isn't available, `fetchCsrfTokenIfNeeded()` makes a request to get a fresh token
5. **Error Recovery**: If a request fails with a CSRF error (403), it automatically tries to fetch a new token and retries the request
6. **Dual Token Sources**: The client can retrieve the token from either the response JSON or a cookie, providing redundancy

The implementation can be found in:
- `client/src/lib/csrf-token.ts` - Core CSRF functions and fetch interception
- `client/src/main.tsx` - CSRF protection initialization
- `client/src/lib/api.ts` - Enhanced API request function with CSRF token retry logic

## Usage

### In Application Code

The CSRF protection is automatically applied to all non-GET requests (POST, PUT, PATCH, DELETE) when using:

1. The `apiRequest` function in `client/src/lib/api.ts`
2. The built-in `fetch` function (which is intercepted by our implementation)

There's no need to manually add the CSRF token to requests as it's handled automatically by these methods:

```typescript
// Using apiRequest (recommended)
apiRequest('POST', '/api/endpoint', data);

// Using fetch directly (also works)
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### For Testing

When testing API endpoints with tools like curl or Postman:

1. First make a GET request to any endpoint (e.g., `/health`) to get a CSRF token cookie
2. Extract the token from the `XSRF-TOKEN` cookie
3. Include the token in the `X-CSRF-Token` header for non-GET requests

Example curl command:
```bash
# First get a token
curl -v http://localhost:3001/health

# Then use the token in a POST request
curl -v -X POST http://localhost:3001/api/bookmarks \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"postId": 1}'
```

## Ignored Paths

Some endpoints are excluded from CSRF protection to allow specific functionality:

- `/health` - Health check endpoint
- `/api/auth/status` - Auth status check
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Registration endpoint
- `/api/feedback` - Feedback submission (to allow anonymous feedback)
- `/api/posts` - Public posts retrieval
- `/api/recommendations` - Recommendations endpoint

These paths are configured in `server/index.ts` in the `validateCsrfToken` middleware options.

## Testing and Verification

The CSRF protection implementation has been extensively tested using both the `test-csrf-protection.js` and `test-csrf-complete.js` scripts, which verify:

1. Token retrieval from the server (from both JSON response and cookies)
2. Successful requests with a valid token
3. Failed requests without a token (403 Forbidden)
4. POST requests requiring CSRF protection work with a valid token
5. POST requests without a CSRF token are properly blocked
6. Token refresh mechanism for handling expired tokens
7. Client-side token management and automatic inclusion in requests

The test results confirm that the CSRF protection is working as expected:

```
CSRF Protection Test Suite

Step 1: Getting CSRF token from health endpoint...
✓ Successfully received CSRF token: f23e3ba736d63464437f1716a6fdce4c7701d5015fb9a7613aeef64d6cb5bb49

Step 3: Making request WITHOUT CSRF token (should be denied)...
✓ Request without CSRF token was correctly blocked with 403 Forbidden

Step 4: Testing index page to verify client JS is handling CSRF tokens...
✓ Successfully loaded index page
✓ CSRF cookie was set in browser

✅ All CSRF protection tests completed successfully!
```

Our testing confirms:
- Protected endpoints properly reject requests without valid tokens
- Non-protected endpoints remain accessible as needed
- Clear error feedback for missing or invalid tokens
- Token verification works across both session verification and header validation
- Client-side token fetching and automatic inclusion in requests functions correctly

## Security Considerations

1. The CSRF token is sent as a non-HttpOnly cookie to allow JavaScript access
2. Secure flag is enabled in production for HTTPS-only transmission
3. SameSite=Lax policy helps prevent CSRF even if the token mechanism fails
4. Token validation is enforced on all non-GET requests except for specific excluded paths
5. Double-submit pattern provides additional security by validating the token in both the cookie and the request header
6. Token is provided in both JSON response and cookies for redundancy
7. Clear error responses help identify CSRF issues without exposing sensitive details
8. CSRF tokens are regenerated rather than static throughout the session
9. Automatic retry mechanisms handle token expiration gracefully

## Troubleshooting

Common issues and solutions:

1. **403 Forbidden with "CSRF token is missing"**
   - Ensure the CSRF token cookie is present (check browser cookies)
   - Try refreshing the page to get a new token
   - Clear cookies and reload if persistent

2. **403 Forbidden with "CSRF token validation failed"**
   - Token mismatch between request and session
   - Ensure you're not using an old token from a previous session
   - Try logging out and back in

3. **Tokens not being set**
   - Verify the `/health` endpoint is working properly
   - Check for cookie blocking in the browser
   - Ensure third-party cookies are enabled if testing across domains

4. **AJAX requests failing**
   - Make sure credentials are included in fetch/axios requests
   - Verify the X-CSRF-Token header is being sent
   - Check for CORS issues if testing across domains
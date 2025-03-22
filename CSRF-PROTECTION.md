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

The implementation can be found in `server/middleware/csrf-protection.ts` and is integrated into the application in `server/index.ts`.

### Client-Side Implementation

The client-side implementation automatically includes the CSRF token in all non-GET requests:

1. **Token Retrieval**: The token is retrieved from the cookie set by the server via `getCsrfToken()`
2. **Request Interception**: A global fetch interceptor added in `initCSRFProtection()` adds the token to all non-GET requests
3. **Headers**: The token is included in the `X-CSRF-Token` header via `applyCSRFToken()`
4. **Token Renewal**: If a token isn't available, `fetchCsrfTokenIfNeeded()` makes a request to get a fresh token

The implementation can be found in `client/src/lib/csrf-token.ts` and is initialized in `client/src/main.tsx`.

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

The CSRF protection implementation has been tested using the `test-csrf-protection.js` script, which verifies:

1. Token retrieval from the server
2. Successful requests with a valid token
3. Failed requests without a token (403 Forbidden)

The test results confirm that the CSRF protection is working as expected.

## Security Considerations

1. The CSRF token is sent as a non-HttpOnly cookie to allow JavaScript access
2. Secure flag is enabled in production for HTTPS-only transmission
3. SameSite=Lax policy helps prevent CSRF even if the token mechanism fails
4. Token validation is enforced on all non-GET requests except for specific excluded paths
5. Double-submit pattern provides additional security by validating the token in both the cookie and the request header
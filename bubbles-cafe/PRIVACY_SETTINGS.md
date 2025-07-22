# Privacy Considerations for Split Deployment

When moving from a single-domain Replit deployment to a split deployment (Vercel frontend, Render backend), there are several privacy and security considerations to keep in mind.

## Cross-Domain Cookie Handling

### Cookie Attributes

When operating across domains, cookie attributes become particularly important:

- **SameSite**: Must be set to `None` when cookies need to be sent in cross-site requests
- **Secure**: Required when using `SameSite=None` (cookies will only be sent over HTTPS)
- **Domain**: Should not be specified to ensure cookies work properly across domains

In our `server/index.ts`, the session cookie settings have been updated accordingly:

```javascript
cookie: {
  secure: true, // Always use secure cookies in cross-domain setup
  sameSite: 'none', // Required for cross-domain cookies
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}
```

## CORS (Cross-Origin Resource Sharing)

### Origin Allowlist

For security reasons, we use a specific origin allowlist rather than `*`:

- Wildcards (`*`) cannot be used with credentials, which our authentication requires
- The `FRONTEND_URL` environment variable must be set correctly on the backend
- It should exactly match your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### Credentials Mode

When making fetch requests from the frontend:

- Always include `credentials: 'include'` to send cookies with cross-domain requests
- This is handled in our `apiRequest` utility

## Personal Data Considerations

### Data Storage

When considering data privacy across domains:

- User IP addresses will be visible to both Vercel and Render
- Session data is stored only on the backend (Render)
- LocalStorage/SessionStorage are domain-specific and won't be shared

### Analytics and Tracking

For analytics implementation:

- Consider using a first-party analytics solution that respects privacy
- Ensure proper consent is gathered before enabling any tracking
- Update your privacy policy to reflect the new deployment architecture

## Authentication Flow

### OAuth Redirect URIs

When using OAuth (Google, etc.):

- Update callback/redirect URIs in your OAuth provider settings
- Both domains must be registered with your OAuth provider
- Redirect back to the frontend domain after successful authentication

## Private Environment Variables

### Managing Secrets

When deploying to Vercel and Render:

- Migrate secrets from `.env` files to the Vercel and Render dashboards
- Environment variables prefixed with `VITE_` will be exposed to the frontend
- Keep sensitive data like database credentials only on the backend (Render)

## User Privacy Settings

If your app includes user privacy settings:

- These will continue to work as they're stored in the database
- No changes are needed to the privacy settings data model

## GDPR and CCPA Compliance

If your application is subject to GDPR or CCPA:

- Update your privacy policy to reflect the new infrastructure
- Ensure data subject access requests can be fulfilled across both platforms
- Document all data flows between the frontend and backend

## Recommended Actions

Before going live with your split deployment:

1. Review and update your privacy policy
2. Test authentication flows thoroughly across domains
3. Ensure all API requests include proper CSRF protection
4. Verify that personal data is not unintentionally exposed
5. Confirm proper cookie behavior in cross-domain context
6. Consider adding a consent banner for first-time visitors
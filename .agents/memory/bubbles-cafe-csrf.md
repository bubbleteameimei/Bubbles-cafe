---
name: Bubbles Cafe CSRF
description: CSRF is disabled on backend; frontend sends Supabase JWT as Bearer token
---

# Bubbles Cafe CSRF Status

**Why:** The original backend had CSRF validation on all POST/PATCH/DELETE routes. The frontend only sends CSRF tokens when `VITE_ENABLE_CSRF=true` is set at build time. Since this was never set (defaults to false), ALL mutations were getting 403 Forbidden responses. The app uses JWT Bearer token auth (`Authorization: Bearer <supabase-jwt>`) which is inherently CSRF-immune — browsers cannot forge custom headers in CSRF attacks.

## Resolution
- Removed all CSRF validation middleware from `server/index.ts`
- The `/api/csrf-token` endpoint still exists (via `getCsrfTokenHandler`) for compatibility but is not enforced
- Frontend still sends CSRF tokens when `isCsrfRequired()` returns true (VITE_ENABLE_CSRF=true) but this is optional

## Frontend auth flow
1. User signs in via Supabase (email/password or OAuth)
2. `use-auth.tsx` calls `POST /api/auth/supabase/login` with Supabase JWT in Authorization header
3. Backend returns Neon user profile `{ id, email, username, isAdmin, ... }`
4. Subsequent API calls: `attachAuthHeader()` in `queryClient.ts` adds `Authorization: Bearer <supabase-jwt>` from `supabase.auth.getSession()`
5. Backend's `verifyAuthToken` middleware verifies the Supabase JWT

**How to apply:** Never re-enable CSRF middleware unless you also ensure `VITE_ENABLE_CSRF=true` is set at build time for the Vercel frontend.

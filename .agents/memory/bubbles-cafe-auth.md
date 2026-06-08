---
name: Bubbles Cafe Auth
description: How backend verifies Supabase JWTs and bridges to Neon users
---

# Bubbles Cafe Auth Architecture

**Why:** Frontend uses Supabase for auth (signs in via Supabase, gets a Supabase JWT). Backend uses Neon PostgreSQL for all data. The backend must accept Supabase JWTs and bridge to Neon user IDs (integers used in all foreign keys).

## `verifyAuthToken` flow
1. Try to verify as local JWT (`jwt.verify(token, JWT_SECRET)`) — fast, no network call
2. If that fails, call `createSupabaseServiceRoleClient().auth.getUser(token)` — verifies Supabase JWT via API call
3. Look up/create Neon user via `findOrCreateNeonUser(supabaseUser.email, supabaseUser)`
4. Set `req.user = { userId: neonUser.id, email, isAdmin }` — integer ID used by all routes
5. Cache verified tokens for 5 minutes (keyed by token string) to avoid repeated Supabase calls

## `/api/auth/supabase/login` endpoint
- Called by frontend `use-auth.tsx` after successful Supabase sign-in
- Verifies Supabase JWT, finds/creates Neon user, returns local user profile `{ id, email, username, isAdmin, ... }`
- The `id` is the Neon integer ID used for all data operations

## `findOrCreateNeonUser`
- Looks up by normalized lowercase email
- Creates user with `password_hash: 'supabase_auth_' + randomBytes(16).hex` (not usable for local auth)
- Stores Supabase UUID in `metadata.supabaseId`

## `/api/config/public`
- Returns `{ supabase: { url, anonKey, clientReady } }` for frontend lazy-init
- Frontend `client/src/lib/supabase.ts` calls this if VITE_SUPABASE_* env vars are not available

**How to apply:** Any new route that needs auth should use `verifyAuthToken` middleware. `req.user.userId` is always a Neon integer ID.

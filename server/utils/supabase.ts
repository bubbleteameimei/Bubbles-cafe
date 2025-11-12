import { createClient } from '@supabase/supabase-js';

/**
 * Public Supabase client (anon key) for user-scoped operations on the server.
 */
export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_ANON_KEY)');
  }
  return createClient(url, anonKey);
}

/**
 * Service-role Supabase client for privileged server operations that require bypassing RLS.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment.
 */
export function createSupabaseServiceRoleClient() {
  const url = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey);
}
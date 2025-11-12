import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const url = (process.env.SUPABASE_URL || '').trim();
  if (url) return url.replace(/\/+$/, '');
  // Fallback to known project URL if not provided
  return 'https://rqoqtusrlsapcbdimwpn.supabase.co';
}

export function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_ANON_KEY)');
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false }
  });
}

/**
 * Create a Supabase client that uses the provided JWT for RLS-enforced queries.
 * The token is attached as a Bearer Authorization header so all queries run under that user.
 */
export function createSupabaseClientWithToken(accessToken: string) {
  const url = getSupabaseUrl();
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_ANON_KEY)');
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false }
  });
}

/**
 * Create a Supabase client with service role key, bypassing RLS.
 * Use this only for trusted server-side operations.
 */
export function createSupabaseServiceRoleClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase service role configuration (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });
}
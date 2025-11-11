import { createClient } from '@supabase/supabase-js';

const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create a safe stub for auth methods when Supabase is not configured
const createAuthStub = () => ({
  async signInWithPassword() {
    return { data: null, error: new Error('Supabase not configured') } as any;
  },
  async signUp() {
    return { data: null, error: new Error('Supabase not configured') } as any;
  },
  async signOut() {
    return { error: null } as any;
  },
  async signInWithOAuth() {
    return { data: null, error: new Error('Supabase not configured') } as any;
  },
  async getSession() {
    return { data: { session: null }, error: null } as any;
  },
});

let client: ReturnType<typeof createClient> | null = null;
try {
  if (!url || !anonKey) {
    // Log but do not throw to avoid breaking the app; auth flows will show friendly errors
    try { console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'); } catch {}
  } else {
    client = createClient(url, anonKey);
  }
} catch (e) {
  try { console.warn('[Supabase] Client initialization failed:', (e as any)?.message || String(e)); } catch {}
  client = null;
}

// Export a safe client or a minimal stub
export const supabase: any = client ?? { auth: createAuthStub() };
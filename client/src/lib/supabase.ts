import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient> | null;

let client: SupabaseClient = null;
let initialized = false;

// Safe stub for auth methods when Supabase is not configured
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

// Eager init using VITE_ env when present, else lazy via /api/config/public
function eagerInitFromEnv(): boolean {
  try {
    const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
    const anonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (url && anonKey) {
      client = createClient(url, anonKey);
      initialized = true;
      return true;
    }
  } catch {}
  return false;
}

async function lazyInitFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/config/public', { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    const sup = (data as any)?.supabase || {};
    const url = sup.url as string | undefined;
    const anonKey = sup.anonKey as string | undefined;
    if (url && anonKey) {
      client = createClient(url, anonKey);
      initialized = true;
      return true;
    }
  } catch {}
  return false;
}

/**
 * Initialize Supabase client if not already initialized.
 * Returns true if client is ready.
 */
export async function initSupabase(): Promise<boolean> {
  if (initialized && client) return true;
  if (eagerInitFromEnv()) return true;
  const ok = await lazyInitFromServer();
  return ok;
}

// Export a facade that defers to client when available, otherwise stub
export const supabase: any = new Proxy({ auth: createAuthStub() } as any, {
  get(target, prop, receiver) {
    if (client) {
      // @ts-expect-error dynamic proxy forwarding
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
    // Fallback to stub
    // @ts-expect-error dynamic proxy forwarding
    const value = (target as any)[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  }
});
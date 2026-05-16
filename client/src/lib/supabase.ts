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

function normalizeSupabaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function isUsableAnonKey(key: string): boolean {
  const k = key.trim();
  return k.startsWith('eyJ') || k.startsWith('sb_publishable_');
}

// Eager init using VITE_ or NEXT_PUBLIC_ env when present, else lazy via /api/config/public
function eagerInitFromEnv(): boolean {
  try {
    const envAny: any = (import.meta as any)?.env || {};
    const urlRaw =
      (envAny.VITE_SUPABASE_URL as string | undefined) ||
      (envAny.NEXT_PUBLIC_SUPABASE_URL as string | undefined);
    const anonKeyRaw =
      (envAny.VITE_SUPABASE_ANON_KEY as string | undefined) ||
      (envAny.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

    const url = urlRaw ? normalizeSupabaseUrl(urlRaw) : '';
    const anonKey = anonKeyRaw && isUsableAnonKey(anonKeyRaw) ? anonKeyRaw.trim() : '';

    if (url && anonKey) {
      if (import.meta.env?.DEV) {
        console.log('[Supabase] Eager init from env', {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
          source: {
            VITE_SUPABASE_URL: !!envAny.VITE_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_URL: !!envAny.NEXT_PUBLIC_SUPABASE_URL,
          },
        });
      }
      client = createClient(url, anonKey);
      initialized = true;
      return true;
    }

    if (import.meta.env?.DEV) {
      console.log('[Supabase] Env missing or incomplete for eager init', {
        hasViteUrl: !!envAny.VITE_SUPABASE_URL,
        hasViteAnon: !!envAny.VITE_SUPABASE_ANON_KEY,
        hasNextUrl: !!envAny.NEXT_PUBLIC_SUPABASE_URL,
        hasNextAnon: !!envAny.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
    }
  } catch (e) {
    console.error('[Supabase] Eager init from env failed:', e);
  }
  return false;
}

async function lazyInitFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/config/public', { credentials: 'include' });
    if (!res.ok) {
      if (import.meta.env?.DEV) {
        console.warn('[Supabase] /api/config/public responded with non-OK status', res.status);
      }
      return false;
    }
    const data = await res.json().catch(() => ({}));
    const sup = (data as any)?.supabase || {};
    const urlRaw = sup.url as string | undefined;
    const anonKeyRaw = sup.anonKey as string | undefined;
    const clientReady = sup.clientReady !== false;
    const url = urlRaw ? normalizeSupabaseUrl(urlRaw) : '';
    const anonKey =
      anonKeyRaw && clientReady && isUsableAnonKey(anonKeyRaw) ? anonKeyRaw.trim() : '';
    if (url && anonKey) {
      if (import.meta.env?.DEV) {
        console.log('[Supabase] Lazy init from /api/config/public', {
          hasUrl: !!url,
          hasAnonKey: !!anonKey,
        });
      }
      client = createClient(url, anonKey);
      initialized = true;
      return true;
    }
    if (import.meta.env?.DEV) {
      console.log('[Supabase] Supabase config from /api/config/public is missing or incomplete', {
        url,
        anonKeyPresent: !!anonKey,
      });
    }
  } catch (e) {
    console.error('[Supabase] Lazy init from /api/config/public failed:', e);
  }
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
  get(target, prop) {
    if (client) {
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
    const value = (target as any)[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
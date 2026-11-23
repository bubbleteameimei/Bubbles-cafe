import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';

// supabase-js (~200 kB) is loaded on demand: most visitors only read stories and never
// need it, so it is kept out of the main bundle.
const loadCreateClient = () => import('@supabase/supabase-js').then((m) => m.createClient);

type SupabaseClient = SupabaseClientType | null;

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
async function eagerInitFromEnv(): Promise<boolean> {
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
      const createClient = await loadCreateClient();
      if (!client) client = createClient(url, anonKey);
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
      const createClient = await loadCreateClient();
      if (!client) client = createClient(url, anonKey);
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
let lazyInitPromise: Promise<boolean> | null = null;

export async function initSupabase(): Promise<boolean> {
  if (initialized && client) return true;
  if (await eagerInitFromEnv()) return true;
  // Share one in-flight /api/config/public request between concurrent callers;
  // clear it on failure so a later call can retry (e.g. API was cold-starting).
  if (!lazyInitPromise) {
    lazyInitPromise = lazyInitFromServer().then((ok) => {
      if (!ok) lazyInitPromise = null;
      return ok;
    });
  }
  return lazyInitPromise;
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

/**
 * True when this browser may hold a Supabase session: a stored auth token, or an
 * OAuth / magic-link / recovery redirect in the URL. When false the visitor is
 * signed out and supabase-js need not be loaded at all.
 */
export function mayHaveSupabaseSession(): boolean {
  try {
    const { hash, search } = window.location;
    if (/access_token=|refresh_token=|[?&]code=|type=recovery/.test(hash + search)) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      if (/^sb-.+-auth-token/.test(key)) return true;
    }
    return false;
  } catch {
    return true; // storage unavailable: fall back to the full check
  }
}

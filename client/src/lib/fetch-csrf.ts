/**
 * Global fetch wrapper for /api/* requests:
 * - rewrites them to the configured backend base URL
 * - attaches the Supabase access token as a Bearer header (the API authenticates
 *   with tokens, not cookies, so plain fetch() calls to the API need this)
 * CSRF headers are only added when VITE_ENABLE_CSRF=true (legacy Express mock-server).
 */
import { getApiBaseUrl } from './asset-path';
import { supabase, initSupabase } from './supabase';
import { applyCSRFToken, fetchCsrfTokenIfNeeded, isCsrfRequired } from './csrf-token';

const originalFetch = window.fetch.bind(window);

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  try {
    const s = typeof input === 'string' ? input : String(input);
    if (s.startsWith('/api/')) {
      const base = getApiBaseUrl();
      if (base) return `${base}${s}`;
    }
    return input;
  } catch {
    return input;
  }
}

function apiPathOf(input: RequestInfo | URL): string | null {
  try {
    const s = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (s.startsWith('/api/')) return s;
    const base = getApiBaseUrl();
    if (base && s.startsWith(`${base}/api/`)) return s.slice(base.length);
  } catch {
    /* ignore */
  }
  return null;
}

// Supabase reads its config from this endpoint, so it must not wait on Supabase.
const NO_AUTH_PATHS = ['/api/config/public'];

async function withAuthHeader(init: RequestInit): Promise<RequestInit> {
  const headers = new Headers(init.headers);
  if (headers.has('Authorization')) return init;
  try {
    if (!(await initSupabase())) return init;
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return init;
    headers.set('Authorization', `Bearer ${token}`);
    return { ...init, headers };
  } catch {
    return init;
  }
}

async function fetchWithApiBase(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const apiPath = apiPathOf(input);
  const url = resolveUrl(input);
  let withCreds: RequestInit = init
    ? { ...init, credentials: init.credentials || 'include' }
    : { credentials: 'include' };

  if (apiPath && !NO_AUTH_PATHS.some((p) => apiPath.startsWith(p))) {
    withCreds = await withAuthHeader(withCreds);
  }

  if (method !== 'GET' && isCsrfRequired()) {
    try {
      await fetchCsrfTokenIfNeeded();
    } catch {
      /* optional */
    }
    return originalFetch(url, applyCSRFToken(withCreds));
  }

  return originalFetch(url, withCreds);
}

window.fetch = fetchWithApiBase as typeof window.fetch;

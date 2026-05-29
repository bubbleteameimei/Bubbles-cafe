/**
 * Global fetch wrapper: rewrites /api/* to the configured backend base URL.
 * CSRF tokens are applied on-demand and automatically refreshed on 403 errors.
 */
import { getApiBaseUrl } from './asset-path';
import { csrfFetch } from './csrf-signed';

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

async function fetchWithApiBase(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const url = resolveUrl(input);
  const withCreds: RequestInit = init
    ? { ...init, credentials: init.credentials || 'include' }
    : { credentials: 'include' };

  // Use CSRF-protected fetch for non-GET requests (handles token on-demand)
  if (method !== 'GET') {
    return csrfFetch(url, withCreds);
  }

  return originalFetch(url, withCreds);
}

window.fetch = fetchWithApiBase as typeof window.fetch;

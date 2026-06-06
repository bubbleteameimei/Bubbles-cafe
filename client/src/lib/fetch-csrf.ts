/**
 * Global fetch wrapper: rewrites /api/* to the configured backend base URL.
 * CSRF tokens are applied on-demand and automatically refreshed on 403 errors.
 */
import { getApiBaseUrl } from './asset-path';
import { csrfFetch } from './csrf-signed';

const originalFetch = window.fetch.bind(window);

function resolveUrl(input: RequestInfo | URL): RequestInfo {
  try {
    const s = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    if (s.startsWith('/api/')) {
      const base = getApiBaseUrl();
      if (base) return `${base}${s}`;
    }

    if (typeof input === 'string' || input instanceof Request) {
      return input;
    }

    return input.toString();
  } catch {
    return typeof input === 'string' ? input : input instanceof Request ? input : String(input);
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

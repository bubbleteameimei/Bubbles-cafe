/**
 * Global fetch wrapper: rewrites /api/* to the configured backend base URL.
 * Always applies signed CSRF tokens to non-GET requests.
 */
import { getApiBaseUrl } from './asset-path';
import { ensureCsrfToken, applyCSRFToken } from './csrf-signed';

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

  // Apply CSRF token to non-GET requests
  if (method !== 'GET') {
    // Ensure token is available (gracefully handles missing tokens)
    await ensureCsrfToken();
    // Apply token if available (no-op if token fetch failed)
    return originalFetch(url, applyCSRFToken(withCreds));
  }

  return originalFetch(url, withCreds);
}

window.fetch = fetchWithApiBase as typeof window.fetch;

/**
 * Global fetch wrapper: rewrites /api/* to the configured backend base URL.
 * CSRF headers are only added when VITE_ENABLE_CSRF=true (legacy Express mock-server).
 */
import { getApiBaseUrl } from './asset-path';
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

async function fetchWithApiBase(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const url = resolveUrl(input);
  const withCreds: RequestInit = init
    ? { ...init, credentials: init.credentials || 'include' }
    : { credentials: 'include' };

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

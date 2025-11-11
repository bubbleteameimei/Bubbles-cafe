import { applyCSRFToken, fetchCsrfTokenIfNeeded } from './csrf-token';
import { getApiBaseUrl } from './asset-path';

const originalFetch = window.fetch.bind(window);

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  try {
    const s = typeof input === 'string' ? input : String(input);
    // Rewrite relative API calls to absolute backend base in split deployments
    if (s.startsWith('/api/')) {
      const base = getApiBaseUrl();
      if (base) return `${base}${s}`;
    }
    return input;
  } catch {
    return input;
  }
}

async function fetchWithCSRF(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = ((init?.method || 'GET').toUpperCase());
  const url = resolveUrl(input);

  // Always include credentials for session cookies
  const withCreds: RequestInit = init ? { ...init, credentials: init.credentials || 'include' } : { credentials: 'include' };

  if (method !== 'GET') {
    try {
      await fetchCsrfTokenIfNeeded();
      const options = applyCSRFToken(withCreds);
      return originalFetch(url, options);
    } catch {
      // Fall through to original fetch if CSRF instrumentation fails
      return originalFetch(url, withCreds);
    }
  }

  return originalFetch(url, withCreds);
}

// Install the wrapper
window.fetch = fetchWithCSRF as typeof window.fetch;
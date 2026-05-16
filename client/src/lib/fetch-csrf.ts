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
      // Try to fetch CSRF token, but don't block if it fails
      await fetchCsrfTokenIfNeeded();
      const options = applyCSRFToken(withCreds);
      return originalFetch(url, options);
    } catch (error) {
      // If CSRF token fetch fails, try to proceed anyway (token might not be required)
      try {
        return originalFetch(url, withCreds);
      } catch {
        // If the actual request fails, re-throw the original error
        throw error;
      }
    }
  }

  return originalFetch(url, withCreds);
}

// Install the wrapper
window.fetch = fetchWithCSRF as typeof window.fetch;

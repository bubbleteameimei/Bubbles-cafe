import { applyCSRFToken, fetchCsrfTokenIfNeeded } from './csrf-token';

const originalFetch = window.fetch.bind(window);

async function fetchWithCSRF(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = ((init?.method || 'GET').toUpperCase());

  if (method !== 'GET') {
    try {
      await fetchCsrfTokenIfNeeded();
      const options = applyCSRFToken(init || {});
      return originalFetch(input, options);
    } catch (_e) {
      // Fall through to original fetch if CSRF instrumentation fails
      return originalFetch(input, init);
    }
  }

  return originalFetch(input, init);
}

// Install the wrapper
window.fetch = fetchWithCSRF as typeof window.fetch;
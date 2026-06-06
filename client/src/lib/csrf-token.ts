/**
 * CSRF token management - deprecated, use csrf-signed.ts instead
 * This file maintained for backward compatibility only.
 */
import {
  fetchCsrfToken,
  getCsrfToken,
  ensureCsrfToken,
  applyCSRFToken,
  csrfFetch,
  initializeCsrf,
  clearCsrfToken,
} from './csrf-signed';

// Re-export for backward compatibility
export {
  fetchCsrfToken,
  getCsrfToken,
  ensureCsrfToken,
  applyCSRFToken,
  csrfFetch,
  clearCsrfToken,
};

// Keep this exported for main.tsx compatibility
export async function initCSRFProtection(): Promise<void> {
  return initializeCsrf();
}

// Create a CSRF-protected request for client components
export function createCSRFRequest(
  method: string,
  body?: unknown,
  init: RequestInit = {}
): RequestInit {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const options: RequestInit = {
    ...init,
    method,
    headers,
    credentials: init.credentials ?? 'include',
    body: body === undefined ? init.body : JSON.stringify(body),
  };

  return applyCSRFToken(options);
}

// Session-based CSRF (deprecated)
export function isCsrfRequired(): boolean {
  return false; // Always use stateless signed tokens now
}

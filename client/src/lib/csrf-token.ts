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

// Session-based CSRF (deprecated)
export function isCsrfRequired(): boolean {
  return false; // Always use stateless signed tokens now
}

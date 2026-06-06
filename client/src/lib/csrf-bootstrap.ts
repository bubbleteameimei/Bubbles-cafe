/**
 * CSRF bootstrap - deprecated, use csrf-signed.ts instead
 * This file maintained for backward compatibility only.
 */
import { fetchCsrfToken, getCsrfToken, initializeCsrf } from './csrf-signed';

export async function initializeCSRF(): Promise<void> {
  return initializeCsrf();
}

export function getCSRFToken(): string | null {
  return getCsrfToken();
}

// Legacy session CSRF (no longer used)
export function isCsrfRequired(): boolean {
  return false; // Always use stateless signed tokens now
}

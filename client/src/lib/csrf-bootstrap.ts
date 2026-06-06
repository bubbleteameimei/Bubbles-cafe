import { fetchCsrfTokenIfNeeded, getCsrfToken, isCsrfRequired, setCsrfToken } from './csrf-token';

export async function initializeCSRF(): Promise<void> {
  if (!isCsrfRequired()) return;
  await fetchCsrfTokenIfNeeded();
}

export function getCSRFToken(): string | null {
  return getCsrfToken();
}

export { setCsrfToken as setCSRFToken };

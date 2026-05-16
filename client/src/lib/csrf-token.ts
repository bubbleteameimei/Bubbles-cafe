/**
 * CSRF helpers for legacy Express session auth (mock-server / local dev).
 * Production Cloudflare Worker APIs use Supabase Bearer JWT and do not validate CSRF.
 */
import logger from '@/utils/secure-client-logger';
import { getApiBaseUrl } from '@/lib/asset-path';

export const CSRF_HEADER_NAME = 'X-CSRF-Token';

let csrfToken: string | null = null;

/** Session CSRF is opt-in; production Worker + JWT does not need it. */
export function isCsrfRequired(): boolean {
  return String(import.meta.env.VITE_ENABLE_CSRF || '').toLowerCase() === 'true';
}

export function getCsrfToken(): string | null {
  if (!isCsrfRequired()) return null;
  return csrfToken;
}

export function setCsrfToken(token: string): void {
  csrfToken = token;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

async function fetchTokenFromServer(): Promise<string | null> {
  const API_BASE_RAW = getApiBaseUrl();
  let API_BASE = API_BASE_RAW;
  try {
    const host = typeof window !== 'undefined' ? (window.location?.hostname || '') : '';
    const isPreviewHost = /\.vercel\.app$|\.vercel\.dev$|\.builderio\.xyz$/.test(host);
    if (isPreviewHost && !API_BASE) {
      API_BASE = '';
    }
  } catch {
    /* no-op */
  }

  const candidates = [
    '/api/csrf-token',
    API_BASE ? `${API_BASE}/api/csrf-token` : null,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      if (!resp.ok) continue;
      const data = await resp.json().catch(() => ({}));
      const token = data?.csrfToken || null;
      if (token) {
        csrfToken = token;
        return token;
      }
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

export async function fetchCsrfTokenIfNeeded(): Promise<string | null> {
  if (!isCsrfRequired()) return null;
  if (csrfToken) return csrfToken;
  return fetchTokenFromServer();
}

export async function refreshCsrfToken(): Promise<string | null> {
  if (!isCsrfRequired()) return null;
  clearCsrfToken();
  return fetchTokenFromServer();
}

export function applyCSRFToken(options: RequestInit = {}): RequestInit {
  if (!isCsrfRequired()) return options;

  const token = getCsrfToken();
  if (!token) return options;

  const headers = new Headers(options.headers);
  headers.set(CSRF_HEADER_NAME, token);
  return { ...options, headers };
}

export function createCSRFRequest(method: string, body?: unknown): RequestInit {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return applyCSRFToken(options);
}

export async function initCSRFProtection(): Promise<void> {
  if (!isCsrfRequired()) return;
  try {
    await fetchCsrfTokenIfNeeded();
    logger.info('CSRF protection initialized');
  } catch (error) {
    logger.error('Failed to initialize CSRF protection', error);
  }
}

/**
 * CSRF Token Utilities
 * 
 * This module provides utilities for handling CSRF tokens and automatically applying
 * CSRF tokens to API requests for enhanced security.
 */
import logger from '@/utils/secure-client-logger';
import { getApiBaseUrl } from '@/lib/asset-path';

// Constants for CSRF token handling
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Store the CSRF token in memory (not in cookies for security)
let csrfToken: string | null = null;

/**
 * Get the CSRF token from memory
 * @returns The CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  // Return cached token if available
  if (csrfToken) return csrfToken;
  
  return null;
}

/**
 * Set the CSRF token in memory
 * @param token The CSRF token to store
 */
export function setCsrfToken(token: string): void {
  csrfToken = token;
}

/**
 * Clear the CSRF token from memory
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * Fetch a new CSRF token from the server
 * SECURITY FIX: Now uses secure endpoint instead of cookies
 */
export async function fetchCsrfTokenIfNeeded(): Promise<string | null> {
  if (csrfToken) return csrfToken;

  try {
    // Determine base URL intelligently; prefer explicit API base when available (works on previews)
    const API_BASE_RAW = getApiBaseUrl();
    let API_BASE = API_BASE_RAW;
    try {
      const host = typeof window !== 'undefined' ? (window.location?.hostname || '') : '';
      const isPreviewHost = /\.vercel\.app$|\.vercel\.dev$|\.builderio\.xyz$/.test(host);
      // Only force relative endpoints on preview when no explicit base was resolved
      if (isPreviewHost && !API_BASE) {
        API_BASE = '';
      }
    } catch { /* no-op */ }

    // Attempt to get a token directly (prefer same-origin first, then fall back)
    const getToken = async (): Promise<string | null> => {
      const candidates = [
        '/api/csrf-token',
        API_BASE ? `${API_BASE}/api/csrf-token` : null
      ].filter(Boolean) as string[];

      for (const url of candidates) {
        try {
          const resp = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!resp.ok) continue;
          const data = await resp.json().catch(() => ({}));
          const token = data?.csrfToken || null;
          if (token) return token;
        } catch {
          // try next
        }
      }
      return null;
    };

    // First try fetching the token
    let token = await getToken();
    if (token) {
      csrfToken = token;
      return csrfToken;
    }

    // If token is missing, ping health to initialize session token, then retry
    const healthCandidates = [
      '/api/health',
      API_BASE ? `${API_BASE}/api/health` : null
    ].filter(Boolean) as string[];

    for (const h of healthCandidates) {
      try {
        await fetch(h, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        break;
      } catch {
        // try next
      }
    }

    token = await getToken();
    if (token) {
      csrfToken = token;
      return csrfToken;
    }

    logger.error('Failed to obtain CSRF token after retry');
    return null;
  } catch (error) {
    logger.error('Error fetching CSRF token', error);
    return null;
  }
}

/**
 * Force-refresh the CSRF token from the server, ignoring any cached token.
 * Useful after a 403 CSRF failure due to a rotated session.
 */
export async function refreshCsrfToken(): Promise<string | null> {
  try {
    // Prefer explicit base when available; fall back to relative on previews
    const API_BASE_RAW = getApiBaseUrl();
    let API_BASE = API_BASE_RAW;
    try {
      const host = typeof window !== 'undefined' ? (window.location?.hostname || '') : '';
      const isPreviewHost = /\.vercel\.app$|\.vercel\.dev$|\.builderio\.xyz$/.test(host);
      if (isPreviewHost && !API_BASE) {
        API_BASE = '';
      }
    } catch { /* no-op */ }

    const url = API_BASE ? `${API_BASE}/api/csrf-token` : '/api/csrf-token';
    const resp = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!resp.ok) {
      logger.warn('[CSRF] Failed to refresh CSRF token', { status: resp.status });
      return null;
    }
    const data = await resp.json().catch(() => ({}));
    const token = data?.csrfToken || null;
    if (token) {
      setCsrfToken(token);
      return token;
    }
    logger.warn('[CSRF] No token in refresh response');
    return null;
  } catch (error) {
    logger.error('[CSRF] Error refreshing token', error);
    return null;
  }
}

/**
 * Apply CSRF token to fetch options
 * @param options The fetch options to update
 * @returns Updated fetch options with CSRF token
 */
export function applyCSRFToken(options: RequestInit = {}): RequestInit {
  try {
    let token = getCsrfToken();
    
    // If no token in memory, try to fetch one
    if (!token) {
      // Note: This is async but we can't make this function async
      // The caller should ensure fetchCsrfTokenIfNeeded() is called first
      logger.warn('[CSRF] No token available, ensure fetchCsrfTokenIfNeeded() is called first');
      return options;
    }

    // Create new headers object if none exists
    const headers = new Headers(options.headers);
    headers.set(CSRF_HEADER_NAME, token);
    
    return {
      ...options,
      headers,
    };
  } catch (e) {
    logger.error('[CSRF] Error applying CSRF token', e);
    return options;
  }
}

/**
 * Create fetch options with CSRF token for non-GET requests
 * @param method The HTTP method
 * @param body The request body
 * @returns Fetch options with CSRF token and content type
 */
export function createCSRFRequest(method: string, body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // Apply CSRF token
  return applyCSRFToken(options);
}

/**
 * Initialize CSRF protection for the application
 * SECURITY FIX: Now uses secure endpoint instead of cookie-based approach
 */
export async function initCSRFProtection(): Promise<void> {
  try {
    // Fetch initial CSRF token
    await fetchCsrfTokenIfNeeded();
    logger.info('CSRF protection initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize CSRF protection', error);
  }
}

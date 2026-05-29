/**
 * CSRF token management for signed/stateless tokens
 * Strategy: Don't block on token fetch. If a request gets 403 CSRF error, fetch token and retry.
 * This allows forms to work even if backend is temporarily unreachable.
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

let cachedToken: string | null = null;
let fetchAttemptInProgress = false;

/**
 * Fetch a fresh CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CSRF endpoint returned ${response.status}`);
    }

    const data = await response.json();
    const token = data.csrfToken;

    if (!token) {
      throw new Error('No CSRF token in response');
    }

    // Cache in memory
    cachedToken = token;

    // Also store in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.debug('CSRF token fetch failed:', error);
    throw error;
  }
}

/**
 * Get cached or stored CSRF token (never throws)
 */
export function getCsrfToken(): string | null {
  // Check memory cache first
  if (cachedToken) {
    return cachedToken;
  }

  // Check sessionStorage
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (stored) {
      cachedToken = stored;
      return stored;
    }
  }

  return null;
}

/**
 * Ensure we have a valid CSRF token (fetch if needed)
 * Returns token or null gracefully (doesn't throw or block)
 */
export async function ensureCsrfToken(): Promise<string | null> {
  const token = getCsrfToken();
  if (token) {
    return token;
  }

  // Prevent concurrent fetch attempts
  if (fetchAttemptInProgress) {
    return null;
  }

  fetchAttemptInProgress = true;
  try {
    return await fetchCsrfToken();
  } catch {
    // Gracefully return null instead of throwing
    // Requests without tokens will get 403 and can retry with token
    return null;
  } finally {
    fetchAttemptInProgress = false;
  }
}

/**
 * Apply CSRF token to request options (returns unchanged options if no token)
 */
export function applyCSRFToken(options: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  if (!token) {
    return options;
  }

  const headers = new Headers(options.headers);
  headers.set(CSRF_HEADER, token);

  return { ...options, headers };
}

/**
 * Make a CSRF-protected request
 * Strategy: Send without token first. If 403 CSRF error, fetch token and retry.
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Try to apply cached token if available
  const csrfOptions = applyCSRFToken(options);

  let response = await fetch(url, {
    ...csrfOptions,
    credentials: 'include',
  });

  // If 403 CSRF error, fetch token and retry
  if (response.status === 403) {
    try {
      const body = await response.clone().json();
      const isCsrfError = body.code?.includes('CSRF') || body.error?.toLowerCase().includes('csrf');
      
      if (isCsrfError) {
        try {
          // Fetch a fresh token
          const token = await fetchCsrfToken();
          
          // Apply new token and retry
          const headers = new Headers(options.headers);
          headers.set(CSRF_HEADER, token);
          
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } catch (fetchError) {
          console.warn('Failed to fetch CSRF token for retry:', fetchError);
          return response;
        }
      }
    } catch {
      // Couldn't parse body, return original 403
      return response;
    }
  }

  return response;
}

/**
 * Initialize CSRF protection on app load
 * Gracefully handles cases where API isn't available
 * Does NOT block app startup
 */
export async function initializeCsrf(): Promise<void> {
  try {
    // Try to fetch a token early, but don't fail if unavailable
    // This optimizes the happy path where backend is available
    await fetchCsrfToken();
  } catch {
    // Silent fail - app works without tokens
    // Forms will fetch tokens on-demand when they get 403 responses
  }
}

/**
 * Clear cached CSRF token (for logout)
 */
export function clearCsrfToken(): void {
  cachedToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
}

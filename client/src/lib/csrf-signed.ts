/**
 * CSRF token management for signed/stateless tokens
 * Replaces the old session-based CSRF implementation
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

let cachedToken: string | null = null;

/**
 * Fetch a fresh CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    const token = data.csrfToken;

    if (!token) {
      throw new Error('No CSRF token in response');
    }

    // Cache in memory
    cachedToken = token;

    // Also store in sessionStorage for the session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * Get cached or stored CSRF token
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
 */
export async function ensureCsrfToken(): Promise<string> {
  const token = getCsrfToken();
  if (token) {
    return token;
  }
  return fetchCsrfToken();
}

/**
 * Apply CSRF token to request options
 */
export function applyCSRFToken(options: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  if (!token) {
    console.warn('No CSRF token available');
    return options;
  }

  const headers = new Headers(options.headers);
  headers.set(CSRF_HEADER, token);

  return { ...options, headers };
}

/**
 * Make a CSRF-protected request
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Ensure token before request
  await ensureCsrfToken();

  // Apply token to request
  const csrfOptions = applyCSRFToken(options);

  const response = await fetch(url, {
    ...csrfOptions,
    credentials: 'include',
  });

  // If 403 with CSRF error, refresh token and retry
  if (response.status === 403) {
    const body = await response.json();
    if (body.code?.includes('CSRF')) {
      console.log('CSRF token expired, refreshing...');
      const newToken = await fetchCsrfToken();
      const headers = new Headers(options.headers);
      headers.set(CSRF_HEADER, newToken);

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}

/**
 * Initialize CSRF protection on app load
 */
export async function initializeCsrf(): Promise<void> {
  try {
    await fetchCsrfToken();
    console.log('✅ CSRF protection initialized');
  } catch (error) {
    console.error('⚠️  Failed to initialize CSRF:', error);
    // App should still work even if CSRF fails
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

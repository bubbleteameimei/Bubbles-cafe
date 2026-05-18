/**
 * CSRF token management for signed/stateless tokens
 * Gracefully handles cases where API isn't available (e.g., preview environments)
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

let cachedToken: string | null = null;
let fetchAttemptInProgress = false;
let apiAvailable: boolean | null = null; // null = unknown, true = available, false = unavailable

/**
 * Fetch a fresh CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
  // Don't retry if API is known to be unavailable
  if (apiAvailable === false) {
    throw new Error('API not available');
  }

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
      apiAvailable = false;
      throw new Error(`CSRF endpoint returned ${response.status}`);
    }

    const data = await response.json();
    const token = data.csrfToken;

    if (!token) {
      throw new Error('No CSRF token in response');
    }

    // Mark API as available on success
    apiAvailable = true;

    // Cache in memory
    cachedToken = token;

    // Also store in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    // Mark API as unavailable on network/CORS errors
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Aborted') ||
      error.message.includes('Network')
    )) {
      apiAvailable = false;
    }

    // Don't spam logs if API is just unavailable
    if (apiAvailable !== false) {
      console.debug('CSRF token fetch failed:', error);
    }

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
 * Returns token or null gracefully (doesn't throw)
 */
export async function ensureCsrfToken(): Promise<string | null> {
  const token = getCsrfToken();
  if (token) {
    return token;
  }

  // Don't attempt to fetch if API is known to be unavailable
  if (apiAvailable === false) {
    return null;
  }

  // Prevent concurrent fetch attempts
  if (fetchAttemptInProgress) {
    return null;
  }

  fetchAttemptInProgress = true;
  try {
    return await fetchCsrfToken();
  } catch {
    // Return null instead of throwing - requests will work without token
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
 * Make a CSRF-protected request (gracefully handles missing tokens)
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Try to ensure token, but don't fail if unavailable
  await ensureCsrfToken();

  // Apply token to request if available
  const csrfOptions = applyCSRFToken(options);

  const response = await fetch(url, {
    ...csrfOptions,
    credentials: 'include',
  });

  // If 403 with CSRF error, try to refresh token and retry once
  if (response.status === 403) {
    try {
      const body = await response.clone().json();
      if (body.code?.includes('CSRF')) {
        try {
          await fetchCsrfToken();
          const headers = new Headers(options.headers);
          const token = getCsrfToken();
          if (token) {
            headers.set(CSRF_HEADER, token);
            return fetch(url, {
              ...options,
              headers,
              credentials: 'include',
            });
          }
        } catch {
          // Refresh failed, return original 403
          return response;
        }
      }
    } catch {
      // Couldn't parse body, return original response
      return response;
    }
  }

  return response;
}

/**
 * Initialize CSRF protection on app load
 * Gracefully handles cases where API isn't available
 */
export async function initializeCsrf(): Promise<void> {
  try {
    await fetchCsrfToken();
    console.log('✅ CSRF protection initialized');
  } catch {
    // Silent fail - app works without CSRF token (with limitations)
    // Some endpoints may require CSRF, but those will fail with 403
  }
}

/**
 * Clear cached CSRF token (for logout)
 */
export function clearCsrfToken(): void {
  cachedToken = null;
  apiAvailable = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
}

/**
 * Check if API is available (for diagnostics)
 */
export function isApiAvailable(): boolean | null {
  return apiAvailable;
}

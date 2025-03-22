/**
 * CSRF Token Utilities
 * 
 * This module handles functionality for retrieving and applying
 * CSRF tokens to API requests for enhanced security.
 * Uses session-based tokens via cookies.
 */

// Constants for CSRF token handling
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Track if we've fetched a token
let csrfToken: string | null = null;

/**
 * Get the CSRF token from cookies
 * @returns The CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  // Return cached token if we have one
  if (csrfToken) return csrfToken;

  try {
    // Get all cookies and find the CSRF token
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === CSRF_COOKIE_NAME) {
        // Store token in memory and return it
        csrfToken = cookieValue ? decodeURIComponent(cookieValue) : null;
        return csrfToken;
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving CSRF token:', error);
    return null;
  }
}

/**
 * Fetch a new CSRF token from the server if needed
 * @returns Promise resolving to the token
 */
export async function fetchCsrfTokenIfNeeded(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  
  try {
    // Make a GET request to a simple endpoint to get a fresh token
    // The server will set the CSRF cookie on the response
    await fetch('/health', {
      method: 'GET',
      credentials: 'include'
    });
    
    // Now try to get the token from cookies
    return getCsrfToken();
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

/**
 * Apply CSRF token to fetch options
 * @param options Fetch options object
 * @returns Updated fetch options with CSRF token
 */
export function applyCSRFToken(options: RequestInit = {}): RequestInit {
  const token = getCsrfToken();
  
  // If no token found, return original options but log a warning
  if (!token) {
    console.warn('No CSRF token found for request');
    return options;
  }
  
  // Create headers if they don't exist
  const headers = new Headers(options.headers || {});
  
  // Add token to headers
  headers.set(CSRF_HEADER_NAME, token);
  
  return {
    ...options,
    headers
  };
}

/**
 * Create fetch options with CSRF token for non-GET requests
 * @param method HTTP method
 * @param body Request body (will be JSON stringified)
 * @returns Fetch options with CSRF token and content type
 */
export function createCSRFRequest(method: string, body?: any): RequestInit {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Always include credentials
  };
  
  // Add body if provided
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  // Apply CSRF token
  return applyCSRFToken(options);
}

/**
 * Initialize CSRF protection for the application
 * Sets up fetch interceptors to automatically include CSRF token in all non-GET requests
 */
export async function initCSRFProtection(): Promise<void> {
  console.log('Initializing CSRF protection...');
  
  // Try to get initial token
  await fetchCsrfTokenIfNeeded();
  
  const originalFetch = window.fetch;
  
  // Type-safe implementation for fetch override
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Don't intercept requests to external domains
    if (typeof input === 'string' && input.startsWith('http') && !input.includes(window.location.host)) {
      return originalFetch(input, init);
    }
    
    // Only apply CSRF token to non-GET/HEAD requests
    if (init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
      // Make sure we have a token
      if (!getCsrfToken()) {
        await fetchCsrfTokenIfNeeded();
      }
      
      const csrfOptions = applyCSRFToken(init);
      return originalFetch(input, csrfOptions);
    }
    
    // Otherwise proceed with the original fetch
    return originalFetch(input, init);
  };
  
  console.log('CSRF protection initialized successfully');
}
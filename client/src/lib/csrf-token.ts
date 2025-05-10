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
    // Use a more reliable cookie parsing approach with regex
    const match = document.cookie.match(new RegExp(
      '(^|;)\\s*' + CSRF_COOKIE_NAME + '\\s*=\\s*([^;]+)')
    );
    
    if (match && match[2]) {
      // Store token in memory and return it
      csrfToken = decodeURIComponent(match[2]);
      console.log(`[CSRF] Retrieved token from cookies: ${csrfToken.substring(0, 10)}...`);
      return csrfToken;
    }
    
    // Alternative parsing method as a fallback
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        const cookieName = parts[0];
        const cookieValue = parts.slice(1).join('='); // Handle values with = in them
        
        if (cookieName === CSRF_COOKIE_NAME) {
          // Store token in memory and return it
          csrfToken = cookieValue ? decodeURIComponent(cookieValue) : null;
          console.log(`[CSRF] Retrieved token via fallback: ${csrfToken?.substring(0, 10)}...`);
          return csrfToken;
        }
      }
    }
    
    console.warn('[CSRF] No token found in cookies');
    return null;
  } catch (error) {
    console.error('[CSRF] Error retrieving CSRF token:', error);
    return null;
  }
}

/**
 * Fetch a new CSRF token from the server if needed
 * @returns Promise resolving to the token
 */
export async function fetchCsrfTokenIfNeeded(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  
  // Get the API base URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  
  try {
    // Make a GET request to the health endpoint which returns the CSRF token
    // The server will also set the CSRF cookie on the response
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch CSRF token, server responded with:', response.status);
      return null;
    }
    
    // Get the response JSON which includes the token
    const data = await response.json();
    
    // Store the token from the response
    if (data && data.csrfToken) {
      csrfToken = data.csrfToken;
      return csrfToken;
    }
    
    // If the server didn't include the token in the response, try to get it from cookies
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
  // Try to get a token
  let token = getCsrfToken();
  
  // If no token found, try to extract directly from document.cookie as a last resort
  if (!token) {
    try {
      // One more attempt with direct regex extraction
      const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN\s*=\s*([^;]+)/);
      if (match && match[2]) {
        token = decodeURIComponent(match[2]);
        console.log(`[CSRF] Retrieved token directly: ${token.substring(0, 10)}...`);
        // Update the cached token
        csrfToken = token;
      }
    } catch (e) {
      console.error('[CSRF] Error in final token extraction attempt:', e);
    }
  }
  
  // If still no token found, return original options but log a warning
  if (!token) {
    console.warn('[CSRF] No CSRF token found for request, request may fail');
    // Still try to include credentials to get a token cookie even if we don't have one now
    return { 
      ...options,
      credentials: 'include' 
    };
  }
  
  // Create headers if they don't exist
  const headers = new Headers(options.headers || {});
  
  // Add token to headers
  headers.set(CSRF_HEADER_NAME, token);
  
  // Log the token we're using (first 10 chars for security)
  console.log(`[CSRF] Applied token to request: ${token.substring(0, 10)}...`);
  
  return {
    ...options,
    headers,
    credentials: 'include' // Always include credentials
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
    // Get the API base URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
    
    // For cross-domain API calls, determine if it's to our backend API
    const isApiCall = typeof input === 'string' && 
      ((API_BASE_URL && input.startsWith(API_BASE_URL)) || 
       (!API_BASE_URL && !input.startsWith('http')));
      
    // Don't intercept requests to external domains that aren't our API
    if (typeof input === 'string' && input.startsWith('http') && 
        !input.includes(window.location.host) && !isApiCall) {
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
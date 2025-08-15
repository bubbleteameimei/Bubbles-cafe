/**
 * CSRF Token Utilities
 * 
 * This module provides utilities for handling CSRF tokens and automatically applying
 * CSRF tokens to API requests for enhanced security.
 */

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
    // Use the new secure CSRF token endpoint
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch CSRF token, server responded with:', response.status);
      return null;
    }

    const data = await response.json();
    if (data && data.csrfToken) {
      csrfToken = data.csrfToken;
      return csrfToken;
    }

    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
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
      console.warn('[CSRF] No token available, ensure fetchCsrfTokenIfNeeded() is called first');
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
    console.error('[CSRF] Error applying CSRF token:', e);
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
    console.log('CSRF protection initialized successfully');
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
}
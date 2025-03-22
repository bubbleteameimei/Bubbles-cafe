/**
 * Helper function to make API requests with proper headers and CSRF protection
 * @param method The HTTP method (GET, POST, etc.)
 * @param endpoint The API endpoint
 * @param body Optional request body for POST/PUT/PATCH requests
 * @returns The fetch response
 */
import { applyCSRFToken, fetchCsrfTokenIfNeeded } from './csrf-token';

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for auth
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  // Apply CSRF token for non-GET requests
  if (method !== 'GET') {
    // Ensure we have a fresh token first
    await fetchCsrfTokenIfNeeded();
    
    try {
      const response = await fetch(endpoint, applyCSRFToken(options));
      
      // If we get a 403 with a specific message about CSRF, try to refresh the token and retry
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          if (errorData && errorData.error && errorData.error.includes('CSRF')) {
            console.warn('CSRF token validation failed, refreshing token and retrying...');
            
            // Force refresh the token
            await fetchCsrfTokenIfNeeded();
            
            // Retry the request with a fresh token
            return fetch(endpoint, applyCSRFToken(options));
          }
        } catch (e) {
          // If we can't parse the error response, just return the original response
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  return fetch(endpoint, options);
}
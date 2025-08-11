/**
 * Helper function to make API requests with proper headers and CSRF protection
 * @param method The HTTP method (GET, POST, etc.)
 * @param endpoint The API endpoint
 * @param body Optional request body for POST/PUT/PATCH requests
 * @returns The fetch response
 */
import { applyCSRFToken, fetchCsrfTokenIfNeeded } from './csrf-token';

// Resolve API base URL dynamically:
// 1. Prefer compile-time VITE_API_URL (set in Vercel env)
// 2. Fallback to a hard-coded Render domain if running on bubblescafe.space
// 3. Otherwise use relative path (works in dev when the API is served from same host)

let API_BASE_URL: string = import.meta.env.VITE_API_URL || '';

if (!API_BASE_URL && typeof window !== 'undefined') {
  const { hostname, protocol } = window.location;

  // If frontend is on bubblescafe.space/* assume backend is the Render service
  if (hostname.endsWith('bubblescafe.space')) {
    API_BASE_URL = `${protocol}//bubbles-cafe-backend.onrender.com`;
  }
}

// Minimal runtime banner for debugging deployment issues
if (typeof window !== 'undefined') {
  const banner = `[Client] API_BASE_URL=${API_BASE_URL || '(relative)'} env.PROD=${import.meta.env.PROD}`;
  // eslint-disable-next-line no-console
  console.log(banner);
}

// Export for other modules that need the resolved URL
export { API_BASE_URL };

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

  // Construct the full URL
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  // Apply CSRF token for non-GET requests
  if (method !== 'GET') {
    // Ensure we have a fresh token first
    await fetchCsrfTokenIfNeeded();
    
    try {
      const response = await fetch(url, applyCSRFToken(options));
      
      // If we get a 403 with a specific message about CSRF, try to refresh the token and retry
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          if (errorData && errorData.error && errorData.error.includes('CSRF')) {
            console.warn('CSRF token validation failed, refreshing token and retrying...');
            
            // Force refresh the token
            await fetchCsrfTokenIfNeeded();
            
            // Retry the request with a fresh token
            return fetch(url, applyCSRFToken(options));
          }
        } catch (e) {
          // If we can't parse the error response, just return the original response
        }
      }
      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  return fetch(url, options);
}
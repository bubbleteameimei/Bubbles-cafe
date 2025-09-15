/**
 * Helper function to make API requests with proper headers and CSRF protection
 * @param method The HTTP method (GET, POST, etc.)
 * @param endpoint The API endpoint
 * @param body Optional request body for POST/PUT/PATCH requests
 * @returns The fetch response
 */
import { applyCSRFToken, fetchCsrfTokenIfNeeded } from './csrf-token';
import { formatError, notifyError, ErrorCategory, ErrorSeverity } from './error-handler';

// This will be set in production deployment to the URL of the backend API server
// For local development, we leave it empty to use relative paths
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
      console.error('API request failed:', error);
      throw error;
    }
  }

  return fetch(url, options);
}

/**
 * Helper to request JSON with consistent error handling
 */
export async function apiJson<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any,
  options?: { showToast?: boolean; fallbackMessage?: string }
): Promise<T> {
  try {
    const response = await apiRequest(method, endpoint, body);

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const text = await response.text().catch(() => '');
    const data = isJson && text ? (JSON.parse(text) as any) : (text as unknown as any);

    if (!response.ok) {
      const messageFromServer = (data && (data.error || data.message)) ? String(data.error || data.message) : undefined;
      const status = response.status;
      const friendly = options?.fallbackMessage ||
        (status === 401 || status === 403 ? 'Please sign in to continue.' :
         status === 404 ? 'The requested resource was not found.' :
         status === 429 ? 'Too many requests. Please try again later.' :
         status >= 500 ? 'Server error. Please try again shortly.' :
         'Request failed. Please try again.');

      const appError = formatError({ message: messageFromServer || friendly, status }, ErrorCategory.API, status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.ERROR);
      if (options?.showToast) notifyError(appError);
      throw appError;
    }

    return data as T;
  } catch (err) {
    // Network or parsing failure
    const appError = formatError(err, ErrorCategory.NETWORK, ErrorSeverity.ERROR);
    if (options?.showToast) notifyError(appError);
    throw appError;
  }
}

export async function getJson<T = any>(endpoint: string, options?: { showToast?: boolean; fallbackMessage?: string }): Promise<T> {
  return apiJson<T>('GET', endpoint, undefined, options);
}
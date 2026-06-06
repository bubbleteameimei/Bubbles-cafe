/**
 * Helper function to make API requests with proper headers and CSRF protection
 * @param method The HTTP method (GET, POST, etc.)
 * @param endpoint The API endpoint
 * @param body Optional request body for POST/PUT/PATCH requests
 * @returns The fetch response
 */
import { applyCSRFToken, fetchCsrfTokenIfNeeded, isCsrfRequired, refreshCsrfToken } from './csrf-token';
import { formatError, notifyError, ErrorCategory, ErrorSeverity } from './error-handler';
import { getApiBaseUrl } from './asset-path';
import { supabase, initSupabase } from './supabase';

// Compute the API base dynamically with preview-awareness and env override
function resolveApiBase(): string {
  try { return getApiBaseUrl(); } catch { return import.meta.env.VITE_API_URL || ''; }
}

// Attach Supabase access token as Authorization header when available
async function attachAuthHeader(options: RequestInit): Promise<RequestInit> {
  try {
    const ready = await initSupabase();
    if (!ready) return options;

    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) return options;

    const token = data.session.access_token;
    const headers = new Headers(options.headers as any);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return { ...options, headers };
  } catch {
    return options;
  }
}

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const baseOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for auth
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    baseOptions.body = JSON.stringify(body);
  }

  // Attach Supabase auth header when available
  const options = await attachAuthHeader(baseOptions);

  // Construct the full URL
  const base = resolveApiBase();
  const url = base ? `${base}${endpoint}` : endpoint;

  if (method !== 'GET' && isCsrfRequired()) {
    await fetchCsrfTokenIfNeeded();

    try {
      const response = await fetch(url, applyCSRFToken(options));

      if (response.status === 403) {
        try {
          const errorData = await response.json().catch(() => ({}));
          const isCsrfError =
            typeof errorData?.error === 'string' &&
            errorData.error.toLowerCase().includes('csrf');
          if (isCsrfError) {
            await refreshCsrfToken();
            return fetch(url, applyCSRFToken(options));
          }
        } catch {
          await refreshCsrfToken();
          return fetch(url, applyCSRFToken(options));
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
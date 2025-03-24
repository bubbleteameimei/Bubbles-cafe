import { QueryClient } from '@tanstack/react-query';
import { getApiPath } from './asset-path';

// Enhanced API error with better type checking and error categorization
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }

  // Helper methods to identify error types
  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isForbiddenError(): boolean {
    return this.status === 403;
  }

  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  get isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }
}

// Improved error handling with more detailed parsing
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    let errorMessage;
    
    try {
      // Try to parse as JSON first
      errorData = await res.json();
      errorMessage = errorData.error || errorData.message || `HTTP Error ${res.status}`;
    } catch (e) {
      // If JSON parsing fails, try text
      try {
        const textContent = await res.text();
        errorData = { rawText: textContent };
        errorMessage = textContent || `HTTP Error ${res.status}`;
      } catch (textError) {
        // If all parsing fails, use a generic message
        errorData = { message: 'An unknown error occurred' };
        errorMessage = `HTTP Error ${res.status}`;
      }
    }

    // Categorize errors based on status code
    let errorCode;
    switch (res.status) {
      case 401:
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorCode = 'NOT_FOUND';
        break;
      case 422:
      case 400:
        errorCode = 'VALIDATION_ERROR';
        break;
      default:
        errorCode = res.status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR';
    }

    throw new APIError(errorMessage, res.status, errorData, errorCode);
  }
}

// Enhanced API request with input validation and better error handling
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Validate inputs
  if (!url) {
    throw new APIError('API URL is required', undefined, undefined, 'INVALID_REQUEST');
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Always include credentials for auth cookies
    ...options,
  };

  try {
    // Use getApiPath to ensure proper URL formation in cross-domain setup
    const fullUrl = url.startsWith('http') ? url : getApiPath(url);
    
    if (import.meta.env.DEV) {
      console.log(`API Request to ${fullUrl}`, requestOptions.method);
    }
    
    // Handle network errors explicitly
    const timeoutId = setTimeout(() => {
      console.warn(`API request to ${fullUrl} is taking longer than expected`);
    }, 5000); // 5-second timeout warning
    
    let res: Response;
    try {
      res = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);
    } catch (networkError) {
      clearTimeout(timeoutId);
      console.error(`Network error for request to ${fullUrl}:`, networkError);
      throw new APIError(
        'Network error: Cannot connect to server. Please check your internet connection.',
        undefined,
        { originalError: networkError },
        'NETWORK_ERROR'
      );
    }

    await throwIfResNotOk(res);
    
    // Parse response based on content type
    const contentType = res.headers.get('content-type');
    let responseData: T;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await res.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new APIError(
          'Failed to parse JSON response', 
          res.status, 
          { parseError: String(jsonError) },
          'PARSE_ERROR'
        );
      }
    } else {
      try {
        const textResponse = await res.text();
        try {
          // Try to parse as JSON even if content-type is not JSON
          responseData = JSON.parse(textResponse) as T;
        } catch {
          // If parsing fails, return text as is
          responseData = textResponse as unknown as T;
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
        throw new APIError(
          'Failed to read response', 
          res.status, 
          { readError: String(textError) },
          'READ_ERROR'
        );
      }
    }
    
    return responseData;
  } catch (error) {
    // Rethrow APIErrors directly since they're already formatted
    if (error instanceof APIError) {
      throw error;
    }
    
    // Get proper URL for logging
    const requestUrl = url.startsWith('http') ? url : getApiPath(url);
    
    // Convert unexpected errors to APIErrors
    console.error(`API Request failed (${requestUrl} ${options.method || 'GET'}):`, error);
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      { originalError: error },
      'UNEXPECTED_ERROR'
    );
  }
}

// Configure query client with enhanced error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth, forbidden, or validation errors
        if (error instanceof APIError) {
          if (error.isAuthError || error.isForbiddenError || 
              error.isValidationError || error.isNotFoundError) {
            return false;
          }
          
          // Only retry network errors and server errors
          if (error.isNetworkError || error.isServerError) {
            return failureCount < 2; // Retry up to twice for these errors
          }
        }
        return failureCount < 1; // Only retry once for other errors
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    mutations: {
      onError: (error) => {
        if (error instanceof APIError && error.isAuthError) {
          // Redirect to login for auth errors
          console.error('Authentication required. Redirecting to login page.');
          // Don't use window.location.href to avoid hard reloads
          // Let the component handle this with proper error UI
        }
      }
    }
  },
});
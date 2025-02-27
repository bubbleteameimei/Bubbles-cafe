import { QueryClient } from "@tanstack/react-query";

// Create a new QueryClient instance with retry configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// Enhanced error handling for API responses
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API requests with enhanced error handling
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  // Use port 3000 for backend API calls in development
  const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Always include credentials for cross-origin requests
    ...options,
    mode: 'cors', // Enable CORS
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Log detailed error information
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API request failed:', {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      if (response.status === 401) {
        console.error('Unauthorized access:', endpoint);
        throw new ApiError('Unauthorized access', 401, errorData);
      }

      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error:', error);
      throw new ApiError('Network error - Please check your connection', 0);
    }

    console.error('API request failed:', error);
    throw new ApiError('An unexpected error occurred', 500);
  }
}
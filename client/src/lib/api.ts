import { QueryClient } from "@tanstack/react-query";

// Create a new QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Helper function for API requests
export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  // Use the correct port for development
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

    if (response.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access:', endpoint);
      throw new Error('Unauthorized access');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
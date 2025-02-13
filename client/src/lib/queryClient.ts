import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Always include credentials for all requests
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request failed (${method} ${url}):`, error);
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          // Don't retry auth errors
          if (error.message.includes('401')) return false;
          // Don't retry forbidden requests
          if (error.message.includes('403')) return false;
          // Don't retry not found
          if (error.message.includes('404')) return false;
        }
        return failureCount < 2; // Only retry twice for other errors
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'online',
      refetchInterval: false
    },
    mutations: {
      retry: false,
      networkMode: 'online',
      onError: (error) => {
        console.error('Mutation error:', error);
        // Handle authentication errors globally
        if (error instanceof Error && error.message.includes('401')) {
          window.location.href = "/auth";
        }
      },
      onMutate: (variables) => {
        // Log mutation attempts in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Starting mutation:', variables);
        }
      },
      onSettled: (_data, error, variables, context) => {
        // Always refetch related queries after mutation
        if (error) {
          console.error('Mutation failed:', { error, variables, context });
        }
        // Invalidate affected queries
        queryClient.invalidateQueries();
      }
    },
  },
});
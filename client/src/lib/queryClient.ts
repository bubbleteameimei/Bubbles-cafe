import { QueryClient, QueryFunction } from "@tanstack/react-query";

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

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => {
  const queryFn: QueryFunction<T> = async (context) => {
    try {
      const res = await fetch(context.queryKey[0] as string, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.status === 401) {
        console.log('401 Unauthorized response detected');
        if (options.on401 === "returnNull") {
          return null;
        } else if (options.on401 === "redirect") {
          window.location.href = "/admin/login";
          return null;
        }
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };
  return queryFn;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          // Don't retry auth errors
          if (error.message.includes('401')) {
            return false;
          }
          // Don't retry forbidden requests
          if (error.message.includes('403')) {
            return false;
          }
          // Don't retry not found
          if (error.message.includes('404')) {
            return false;
          }
        }
        return failureCount < 2; // Only retry twice for other errors
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
        // Handle authentication errors globally
        if (error instanceof Error && error.message.includes('401')) {
          window.location.href = "/admin/login";
        }
      }
    },
  },
});
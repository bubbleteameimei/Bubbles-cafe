import { QueryClient } from '@tanstack/react-query';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { message: 'An unknown error occurred' };
    }

    const errorMessage = errorData.error || errorData.message || `HTTP Error ${res.status}`;
    throw new APIError(errorMessage, res.status, errorData);
  }
}

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    console.log(`API Request to ${url}`);
    const res = await fetch(url, options);
    await throwIfResNotOk(res);
    const responseData: T = await res.json();
    return responseData;
  } catch (error) {
    console.error(`API Request failed (${url} ${options.method})`, error);
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
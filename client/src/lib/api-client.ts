import { csrfFetch } from './csrf-signed';

interface ApiClientOptions {
  getAccessToken?: () => string | null;
  onTokenRefresh?: (token: string) => Promise<void>;
}

/**
 * API client that handles JWT auth and CSRF tokens
 */
export class ApiClient {
  private getAccessToken: () => string | null;
  private onTokenRefresh?: (token: string) => Promise<void>;

  constructor(options: ApiClientOptions = {}) {
    this.getAccessToken = options.getAccessToken || (() => null);
    this.onTokenRefresh = options.onTokenRefresh;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    // Add JWT token if available
    const token = this.getAccessToken();
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');

    // For state-changing requests, use CSRF protection
    const method = (options.method || 'GET').toUpperCase();
    const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method);

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    // Use CSRF-protected fetch for non-safe methods
    const response = isSafeMethod
      ? await fetch(url, requestOptions)
      : await csrfFetch(url, requestOptions);

    // Handle 401 - token expired
    if (response.status === 401) {
      // Try to refresh token and retry once
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('auth_tokens'),
          }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (this.onTokenRefresh) {
            await this.onTokenRefresh(data.accessToken);
          }

          // Retry original request with new token
          headers.set('Authorization', `Bearer ${data.accessToken}`);
          const retryOptions: RequestInit = {
            ...requestOptions,
            headers,
          };

          const retryResponse = isSafeMethod
            ? await fetch(url, retryOptions)
            : await csrfFetch(url, retryOptions);

          const responseData = await retryResponse.json();
          return { data: responseData, status: retryResponse.status };
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  async get<T>(url: string): Promise<T> {
    const { data, status } = await this.request<T>(url, { method: 'GET' });
    if (status >= 400) {
      throw new Error((data as any)?.error || 'Request failed');
    }
    return data;
  }

  async post<T>(url: string, body: any): Promise<T> {
    const { data, status } = await this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (status >= 400) {
      throw new Error((data as any)?.error || 'Request failed');
    }
    return data;
  }

  async patch<T>(url: string, body: any): Promise<T> {
    const { data, status } = await this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (status >= 400) {
      throw new Error((data as any)?.error || 'Request failed');
    }
    return data;
  }

  async delete<T>(url: string): Promise<T> {
    const { data, status } = await this.request<T>(url, { method: 'DELETE' });
    if (status >= 400) {
      throw new Error((data as any)?.error || 'Request failed');
    }
    return data;
  }
}

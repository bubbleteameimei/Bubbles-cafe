type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiError = {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
};

const inflightRequests = new Map<string, Promise<any>>();

function buildKey(method: HttpMethod, url: string, body?: unknown) {
  return `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
}

export async function apiFetch<T>(
  url: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    signal?: AbortSignal;
    dedupe?: boolean;
  } = {}
): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const key = buildKey(method, url, options.body);
  if (options.dedupe !== false && inflightRequests.has(key)) {
    return inflightRequests.get(key) as Promise<T>;
  }

  const exec = fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: options.credentials ?? 'include',
    signal: options.signal,
  })
    .then(async (res) => {
      const requestId = res.headers.get('X-Request-Id') || undefined;
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

      if (!res.ok) {
        const error: ApiError = {
          status: res.status,
          code: (payload as any)?.code,
          message: (payload as any)?.message || res.statusText,
          requestId,
        };
        throw error;
      }
      return payload as T;
    })
    .finally(() => {
      inflightRequests.delete(key);
    });

  inflightRequests.set(key, exec);
  return exec;
}


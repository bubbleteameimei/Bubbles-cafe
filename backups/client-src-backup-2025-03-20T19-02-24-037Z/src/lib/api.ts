/**
 * Helper function to make API requests with proper headers
 * @param method The HTTP method (GET, POST, etc.)
 * @param endpoint The API endpoint
 * @param body Optional request body for POST/PUT/PATCH requests
 * @returns The fetch response
 */
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

  return fetch(endpoint, options);
}
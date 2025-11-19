import { Router } from 'itty-router';

const router = Router();

interface Env {
  BACKEND_URL: string;
}

router.all('*', async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const backendUrl = env.BACKEND_URL;
  
  // Construct the backend request URL
  const targetUrl = new URL(url.pathname + url.search, backendUrl);
  
  // Create a new request with the same method, headers, and body
  const backendRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });
  
  try {
    const response = await fetch(backendRequest);
    
    // Clone the response to modify headers if needed
    const newResponse = new Response(response.body, response);
    
    // Add CORS headers if needed
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return newResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to reach backend server' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

export default router.handle;

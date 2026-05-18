/**
 * Asset Path Utility
 * 
 * This utility helps manage asset paths in both development and production environments,
 * particularly for cross-domain deployments when the frontend and backend are on different domains.
 */

/**
 * Normalize a URL string by trimming trailing slashes
 */
function normalizeUrl(url: string): string {
  try { return url.replace(/\/*$/, ''); } catch { return url; }
}

/**
 * Get the proper base URL for API calls depending on the environment.
 * Uses Render backend (https://bubbles-cafe.onrender.com) as primary backend.
 */
export function getApiBaseUrl(): string {
  // Production Render backend
  const RENDER_BACKEND = 'https://bubbles-cafe.onrender.com';

  // Check for explicit environment overrides first
  const explicitBackend = [
    import.meta.env.VITE_API_URL as string | undefined,
    import.meta.env.VITE_BACKEND_BASE_URL as string | undefined,
    import.meta.env.VITE_BACKEND_URL as string | undefined,
    import.meta.env.VITE_API_BASE_URL as string | undefined,
    import.meta.env.VITE_DEFAULT_API_URL as string | undefined,
  ].find(Boolean);

  if (explicitBackend) {
    return normalizeUrl(explicitBackend);
  }

  // In development, check for local Express server or use Render
  if (import.meta.env.DEV) {
    try {
      const host = typeof window !== 'undefined' ? (window.location?.hostname || '') : '';

      // If running on localhost, try local Express server first
      if (host.includes('localhost') || host === '127.0.0.1') {
        return 'http://localhost:3001';
      }

      // For remote previews (Builder.io, Vercel, etc.), use Render backend
      const isRemotePreview =
        /\.builderio\.xyz$/.test(host) ||
        /\.vercel\.app$/.test(host) ||
        /\.vercel\.dev$/.test(host) ||
        /\.repl\.co$/.test(host) ||
        /\.replit\.dev$/.test(host) ||
        /\.replit\.app$/.test(host);

      if (isRemotePreview) {
        return RENDER_BACKEND;
      }
    } catch { /* no-op */ }

    // Default dev: try localhost Express first
    return 'http://localhost:3001';
  }

  // Production: use Render backend
  return RENDER_BACKEND;
}

/**
 * Get the path to an API endpoint, respecting environment configuration
 * 
 * @param path The API path without leading slash (e.g. "api/posts")
 * @returns The full path to the API endpoint
 */
export function getApiPath(path: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Get the path to an asset, respecting environment configuration
 * 
 * @param path The asset path without leading slash (e.g. "images/logo.png")
 * @returns The full path to the asset
 */
export function getAssetPath(path: string): string {
  const baseUrl = getApiBaseUrl();
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Asset Path Utility
 * 
 * This utility helps manage asset paths in both development and production environments,
 * particularly for cross-domain deployments when the frontend and backend are on different domains.
 */

/**
 * Get the proper base URL for asset loading depending on the environment
 */
export function getApiBaseUrl(): string {
  // In development, prefer relative paths to use Vite proxy
  if (import.meta.env.DEV) return '';

  // In production with split deployment, prefer explicit env
  const explicit = (import.meta.env.VITE_API_URL as string | undefined) || undefined;
  if (explicit) return explicit.replace(/\/+$/, '');

  // Derive from current hostname: map bubblescafe.space -> api.bubblescafe.space
  try {
    const { protocol, hostname } = window.location;
    if (hostname.startsWith('api.')) {
      return `${protocol}//${hostname}`;
    }
    // Handle common www. subdomain
    const host = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    return `${protocol}//api.${host}`;
  } catch {
    return '';
  }
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
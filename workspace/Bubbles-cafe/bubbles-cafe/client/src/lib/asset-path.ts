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
  // In production with split deployment, use the VITE_API_URL
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }
  
  // In development or single-domain deployment, use relative paths
  return '';
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
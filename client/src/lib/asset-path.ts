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

  // Derive from current hostname and special-case preview platforms first
  try {
    const { protocol, hostname } = window.location;

    // If already on api.* subdomain, use it as-is
    if (hostname.startsWith('api.')) {
      return `${protocol}//${hostname}`;
    }

    // Vercel previews (*.vercel.app, *.vercel.dev) and similar ephemeral hosts should use relative URLs
    const isPreviewHost =
      /\.vercel\.app$/.test(hostname) ||
      /\.vercel\.dev$/.test(hostname) ||
      /\.repl\.co$/.test(hostname) ||
      /\.replit\.dev$/.test(hostname) ||
      /\.replit\.app$/.test(hostname);

    if (isPreviewHost) {
      // Always prefer relative endpoints on preview so cookies/sessions remain same-origin via rewrites
      return '';
    }
  } catch {
    // fall through to explicit/env or sensible default
  }

  // In production with split deployment, prefer explicit env
  const explicit = (import.meta.env.VITE_API_URL as string | undefined) || undefined;
  if (explicit) return explicit.replace(/\/*$/, '');

  // Derive from current hostname as a final fallback
  try {
    const { protocol, hostname } = window.location;
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
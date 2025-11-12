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
 * Prioritizes explicit environment configuration to avoid relying on rewrites.
 */
export function getApiBaseUrl(): string {
  // In development, prefer relative paths to use Vite proxy
  if (import.meta.env.DEV) return '';

  // Prefer explicit env overrides first (works on preview domains without rewrites)
  const explicitCandidates = [
    import.meta.env.VITE_API_URL as string | undefined,
    import.meta.env.VITE_BACKEND_BASE_URL as string | undefined,
    import.meta.env.VITE_BACKEND_URL as string | undefined,
    import.meta.env.VITE_API_BASE_URL as string | undefined,
    import.meta.env.VITE_DEFAULT_API_URL as string | undefined,
  ].filter(Boolean) as string[];

  if (explicitCandidates.length > 0) {
    return normalizeUrl(explicitCandidates[0]);
  }

  // Derive from current hostname with special-cases
  try {
    const { protocol, hostname } = window.location;

    // If already on api.* subdomain, use it as-is
    if (hostname.startsWith('api.')) {
      return `${protocol}//${hostname}`;
    }

    // Preview hosts (Vercel/Replit) typically rely on rewrites; prefer a safe default backend domain
    const isPreviewHost =
      /\.vercel\.app$/.test(hostname) ||
      /\.vercel\.dev$/.test(hostname) ||
      /\.repl\.co$/.test(hostname) ||
      /\.replit\.dev$/.test(hostname) ||
      /\.replit\.app$/.test(hostname);

    if (isPreviewHost) {
      // Fallback to canonical backend domain when no explicit base is set.
      // This project uses api.bubblescafe.space as the default backend.
      return 'https://api.bubblescafe.space';
    }

    // Default split deployment: api.<root-domain>
    const host = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
    return `${protocol}//api.${host}`;
  } catch {
    // Final fallback to canonical backend
    return 'https://api.bubblescafe.space';
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
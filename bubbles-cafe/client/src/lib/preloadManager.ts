/**
 * PreloadManager
 * 
 * This utility handles preloading of critical assets (images, scripts, stylesheets, fonts)
 * to improve performance and user experience during page transitions.
 */

// Track preloaded resources to avoid duplication
const preloadedResources = new Set<string>();

// Resource types
type ResourceType = 'image' | 'script' | 'style' | 'font' | 'fetch';

// Cache control options
type CacheControl = 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache';

// Preload options
interface PreloadOptions {
  /** Priority of the resource (high resources load first) */
  priority?: 'high' | 'low' | 'auto';
  
  /** Resource type */
  as?: ResourceType;
  
  /** Cache control */
  cache?: CacheControl;
  
  /** For images, crossorigin is often needed */
  crossOrigin?: boolean;
  
  /** For fonts, display strategy */
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  
  /** Callback when resource is loaded */
  onLoad?: () => void;
  
  /** Callback when resource fails to load */
  onError?: (error: Error) => void;
  
  /** Whether to log preloading activity (defaults to dev mode only) */
  log?: boolean;
}

/**
 * Preload a resource
 * 
 * @param url URL of the resource to preload
 * @param options Preload options
 * @returns Promise that resolves when the resource is loaded or rejects on error
 */
export function preload(url: string, options: PreloadOptions = {}): Promise<void> {
  // Skip if already preloaded
  if (preloadedResources.has(url)) {
    if (options.log || import.meta.env.DEV) {
      console.log(`[Preloader] Resource already preloaded: ${url}`);
    }
    return Promise.resolve();
  }
  
  const {
    priority = 'auto',
    as = determineResourceType(url),
    cache = 'default',
    crossOrigin = as === 'image' || as === 'font',
    fontDisplay = 'swap',
    onLoad,
    onError,
    log = import.meta.env.DEV
  } = options;
  
  if (log) {
    console.log(`[Preloader] Preloading ${as}: ${url}`);
  }
  
  return new Promise<void>((resolve, reject) => {
    // Add to tracking set
    preloadedResources.add(url);
    
    if (as === 'fetch') {
      // For API requests, use fetch API
      fetch(url, { cache })
        .then(response => {
          if (!response.ok) throw new Error(`Failed to preload: ${url}`);
          if (log) console.log(`[Preloader] Successfully preloaded: ${url}`);
          if (onLoad) onLoad();
          resolve();
        })
        .catch(error => {
          if (log) console.error(`[Preloader] Error preloading: ${url}`, error);
          if (onError) onError(error);
          reject(error);
        });
      return;
    }
    
    // Create preload link element
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    
    if (as === 'font') {
      // Add font display strategy
      link.setAttribute('data-font-display', fontDisplay);
    }
    
    // Set priority
    if (priority !== 'auto') {
      link.setAttribute('fetchpriority', priority);
    }
    
    // Handle load event
    link.onload = () => {
      if (log) console.log(`[Preloader] Successfully preloaded: ${url}`);
      if (onLoad) onLoad();
      resolve();
    };
    
    // Handle error event
    link.onerror = (error) => {
      if (log) console.error(`[Preloader] Error preloading: ${url}`, error);
      if (onError) onError(error as unknown as Error);
      reject(new Error(`Failed to preload: ${url}`));
    };
    
    // Add to document head
    document.head.appendChild(link);
  });
}

/**
 * Determine resource type based on URL
 */
function determineResourceType(url: string): ResourceType {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(extension)) {
    return 'image';
  }
  
  if (['js', 'mjs'].includes(extension)) {
    return 'script';
  }
  
  if (['css'].includes(extension)) {
    return 'style';
  }
  
  if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
    return 'font';
  }
  
  if (url.includes('/api/')) {
    return 'fetch';
  }
  
  // Default to script for unknown types
  return 'script';
}

/**
 * Preload multiple resources
 * 
 * @param urls URLs to preload
 * @param options Preload options
 * @returns Promise that resolves when all resources are loaded or rejects on first error
 */
export function preloadAll(urls: string[], options: PreloadOptions = {}): Promise<void[]> {
  return Promise.all(urls.map(url => preload(url, options)));
}

/**
 * Preload an image
 * 
 * @param url Image URL
 * @param options Preload options
 * @returns Promise that resolves when the image is loaded
 */
export function preloadImage(url: string, options: PreloadOptions = {}): Promise<void> {
  return preload(url, { ...options, as: 'image' });
}

/**
 * Preload a font file
 * 
 * @param url Font URL or Google Fonts name
 * @param options Preload options
 * @returns Promise that resolves when the font is loaded
 */
export function preloadFont(url: string, options: PreloadOptions = {}): Promise<void> {
  // For Google Fonts, handle differently by loading a stylesheet
  if (url.includes('fonts.googleapis.com') || url.startsWith('Megrim') || url.startsWith('Crimson')) {
    // Create a link for Google Fonts
    const fontName = url.startsWith('Megrim') ? 'Megrim' : 
                    url.startsWith('Crimson') ? 'Crimson+Text' : url;
    
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}&display=${options.fontDisplay || 'swap'}`;
    
    // For Google Fonts, we need to create a stylesheet link instead of preload
    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      
      link.onload = () => {
        console.log(`[Preloader] Successfully loaded Google Font: ${fontName}`);
        if (options.onLoad) options.onLoad();
        resolve();
      };
      
      link.onerror = (error) => {
        console.error(`[Preloader] Error loading Google Font: ${fontName}`, error);
        if (options.onError) options.onError(error as unknown as Error);
        reject(new Error(`Failed to load font: ${fontName}`));
      };
      
      // Add to document head
      document.head.appendChild(link);
    });
  }
  
  // For local font files
  return preload(url, { 
    ...options, 
    as: 'font',
    fontDisplay: options.fontDisplay || 'swap',
    crossOrigin: true
  });
}

/**
 * Preload critical page resources based on current route
 * 
 * @param route Current route
 * @param assets Optional additional assets to preload
 */
export async function preloadRoute(route: string, assets: string[] = []): Promise<void> {
  console.log(`[Preloader] Preloading assets for route: ${route}`);
  
  // Common assets for all routes (background images removed)
  const commonAssets = [
    '/fonts/horror-type.woff2',
  ];
  
  // Route-specific assets (background images removed)
  let routeAssets: string[] = [];
  
  switch (route) {
    case '/':
    case '/home':
      routeAssets = [
        // Background images removed
      ];
      break;
      
    case '/story':
    case '/stories':
      routeAssets = [
        // Background images removed
      ];
      break;
      
    case '/author':
    case '/profile':
      routeAssets = [
        '/images/default-avatar.png',
      ];
      break;
      
    case '/settings':
      routeAssets = [
        // Background images removed
      ];
      break;
      
    default:
      // For unknown routes, just preload common assets
      break;
  }
  
  // Combine all assets
  const allAssets = [...commonAssets, ...routeAssets, ...assets];
  
  // Start preloading in order of priority
  try {
    // Preload high priority assets first
    const highPriorityAssets = allAssets.slice(0, 2);
    await preloadAll(highPriorityAssets, { priority: 'high' });
    
    // Then preload the rest
    const remainingAssets = allAssets.slice(2);
    preloadAll(remainingAssets, { priority: 'low' });
    
    console.log(`[Preloader] Successfully triggered preload for ${allAssets.length} assets`);
  } catch (error) {
    console.error('[Preloader] Error preloading assets:', error);
  }
}

/**
 * Preload API data for a route
 * 
 * @param endpoint API endpoint URL
 * @param options Fetch options
 * @returns Promise with the fetched data
 */
export async function preloadApiData<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`[Preloader] Preloading API data: ${endpoint}`);
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[Preloader] Failed to preload API data from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Clear preloaded resources tracking
 * Useful when navigating between sections to allow re-preloading
 */
export function clearPreloadedResources(): void {
  preloadedResources.clear();
  console.log('[Preloader] Cleared preloaded resources cache');
}

/**
 * Check if a resource is preloaded
 */
export function isPreloaded(url: string): boolean {
  return preloadedResources.has(url);
}

/**
 * Get count of preloaded resources
 */
export function getPreloadedCount(): number {
  return preloadedResources.size;
}

export default {
  preload,
  preloadAll,
  preloadImage,
  preloadFont,
  preloadRoute,
  preloadApiData,
  clearPreloadedResources,
  isPreloaded,
  getPreloadedCount,
};
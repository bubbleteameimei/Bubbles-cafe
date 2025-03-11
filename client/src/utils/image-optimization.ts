
/**
 * Formats image URLs to use optimal formats and sizes
 * @param url Original image URL
 * @param width Desired width
 * @param height Desired height (optional)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(url: string, width: number, height?: number): string {
  // If the URL is already using a modern format, keep it
  if (url.match(/\.(webp|avif)(\?.*)?$/i)) {
    return url;
  }
  
  // Check if URL contains query parameters
  const hasParams = url.includes('?');
  const separator = hasParams ? '&' : '?';
  
  // Add width parameter
  let optimizedUrl = `${url}${separator}w=${width}`;
  
  // Add height parameter if provided
  if (height) {
    optimizedUrl += `&h=${height}`;
  }
  
  // Try to convert to WebP if supported
  if (typeof window !== 'undefined' && 
      window.navigator.userAgent.indexOf('Safari') > -1 && 
      window.navigator.userAgent.indexOf('Chrome') === -1) {
    // Safari doesn't support WebP well, use original format
    return optimizedUrl;
  } else {
    // Add format=webp for other browsers
    return `${optimizedUrl}&format=webp`;
  }
}

/**
 * Creates a responsive image srcset
 * @param baseUrl Base image URL
 * @param widths Array of widths to generate
 * @returns Srcset string for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => `${getOptimizedImageUrl(baseUrl, width)} ${width}w`)
    .join(', ');
}

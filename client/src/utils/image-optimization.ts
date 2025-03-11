/**
 * Utility functions for image optimization
 */

/**
 * Check connection speed and optimize images accordingly
 */
export function optimizeImagesForConnection() {
  if (navigator.connection && 'effectiveType' in navigator.connection) {
    const connection = navigator.connection as any;
    const isSlowConnection = ['slow-2g', '2g'].includes(connection.effectiveType);

    if (isSlowConnection) {
      document.querySelectorAll("img").forEach(img => {
        const lowRes = img.getAttribute('data-lowres');
        if (lowRes) {
          img.src = lowRes;
        }
      });
    }
  }
}

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
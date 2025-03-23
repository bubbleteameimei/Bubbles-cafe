
import { useEffect } from 'react';

/**
 * Lazy loads images that are not in the viewport
 */
export function useLazyLoadImages() {
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    
    images.forEach(img => observer.observe(img));
    
    return () => {
      images.forEach(img => observer.unobserve(img));
      observer.disconnect();
    };
  }, []);
}

/**
 * Preloads critical resources for faster page transitions
 * @param urls Array of URLs to preload
 */
export function usePreloadResources(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      // Determine resource type from extension
      if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/.test(url)) {
        link.as = 'image';
      } else if (/\.(woff|woff2|ttf|otf)$/.test(url)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }, [urls]);
}

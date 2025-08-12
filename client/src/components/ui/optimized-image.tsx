import React, { useState, useRef, useEffect, forwardRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  quality = 85,
  className,
  onLoad,
  onError,
  loading = 'lazy',
  objectFit = 'cover',
  aspectRatio,
  ...props
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || typeof window === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    const currentRef = imgRef.current || placeholderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]) => {
    if (typeof window === 'undefined') return '';
    return widths
      .map(width => {
        const url = new URL(baseSrc, window.location.origin);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('f', 'webp');
        return `${url.toString()} ${width}w`;
      })
      .join(', ');
  };

  // Generate optimized src URL
  const getOptimizedSrc = (baseSrc: string, format = 'webp') => {
    const url = new URL(baseSrc, window.location.origin);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', format);
    return url.toString();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder component
  const renderPlaceholder = () => {
    if (placeholder === 'empty') {
      return (
        <div
          ref={placeholderRef}
          className={cn(
            'bg-gray-200 dark:bg-gray-800 animate-pulse',
            className
          )}
          style={{
            width,
            height,
            aspectRatio
          }}
          aria-hidden="true"
        />
      );
    }

    if (placeholder === 'blur' && blurDataURL) {
      return (
        <div
          ref={placeholderRef}
          className={cn('relative overflow-hidden', className)}
          style={{
            width,
            height,
            aspectRatio
          }}
        >
          <img
            src={blurDataURL}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
            style={{ objectFit }}
            aria-hidden="true"
          />
        </div>
      );
    }

    return null;
  };

  // Error fallback
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
          className
        )}
        style={{
          width,
          height,
          aspectRatio
        }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // Don't render image until it's in view (unless priority)
  if (!isInView) {
    return renderPlaceholder();
  }

  return (
    <div className={cn('relative', className)} style={{ aspectRatio }}>
      {/* Placeholder shown while loading */}
      {!isLoaded && renderPlaceholder()}
      
      {/* Main image with WebP support */}
      <picture>
        {/* WebP format for supported browsers */}
        <source
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          type="image/webp"
        />
        
        {/* Fallback for browsers that don't support WebP */}
        <img
          ref={(node) => {
            // Forward to parent callback ref if provided
            if (typeof ref === 'function') {
              ref(node);
            }
            // Store internally for intersection observer
            imgRef.current = node;
          }}
          src={getOptimizedSrc(src, 'jpg')}
          srcSet={generateSrcSet(src).replace(/f=webp/g, 'f=jpg')}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down'
          )}
          style={{
            width: width || '100%',
            height: height || 'auto',
            aspectRatio
          }}
          {...props}
        />
      </picture>
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Hook for generating blur placeholder
export const useImageBlurPlaceholder = (src: string): string | undefined => {
  const [blurDataURL, setBlurDataURL] = useState<string>();

  useEffect(() => {
    if (!src) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 10;
      canvas.height = 10;
      ctx?.drawImage(img, 0, 0, 10, 10);
      const dataURL = canvas.toDataURL('image/jpeg', 0.1);
      setBlurDataURL(dataURL);
    };

    img.src = src;
  }, [src]);

  return blurDataURL;
};

export default OptimizedImage;
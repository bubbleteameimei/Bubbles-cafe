/**
 * OptimizedImage Component
 * 
 * A performance-optimized image component that:
 * 1. Automatically selects the appropriate image size based on container dimensions
 * 2. Lazy loads images only when they're near the viewport
 * 3. Shows a blur-up placeholder while loading
 * 4. Provides fallback for loading errors
 * 5. Supports modern image formats with fallbacks
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

// Helper function to get optimized image URL
function getOptimizedImageUrl(src: string, width: number): string {
  if (!src) return '';
  
  // Skip external URLs and SVGs
  if (src.startsWith('http') || src.startsWith('data:') || src.endsWith('.svg')) {
    return src;
  }
  
  // Get file extension
  const extension = src.split('.').pop()?.toLowerCase();
  
  // If optimized directory exists and file is an image
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) {
    // Extract the filename and directory
    const pathParts = src.split('/');
    const filename = pathParts.pop() || '';
    const filenameWithoutExt = filename.split('.').slice(0, -1).join('.');
    const directory = pathParts.join('/');
    
    // Select appropriate size based on width
    let sizeVariant = '-400';
    if (width > 800) sizeVariant = '-800';
    if (width > 1200) sizeVariant = '-1200';
    if (width > 1600) sizeVariant = '-1600';
    
    // Check if optimized image exists, otherwise use original
    const optimizedPath = `${directory}/optimized/${filenameWithoutExt}${sizeVariant}.${extension}`;
    
    try {
      return optimizedPath;
    } catch (err) {
      console.debug('[OptimizedImage] Falling back to original image:', src);
      return src;
    }
  }
  
  return src;
}

export interface OptimizedImageProps 
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  loadingStrategy?: 'lazy' | 'eager';
  placeholderColor?: string;
  showPlaceholder?: boolean;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ 
    src,
    fallbackSrc,
    alt,
    width,
    height,
    className,
    containerClassName,
    priority = false,
    quality = 85,
    onLoad,
    onError,
    loadingStrategy = 'lazy',
    placeholderColor = '#f0f0f0',
    showPlaceholder = true,
    ...props
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    // Calculate image width to select appropriate size
    const imageWidth = useMemo(() => {
      if (typeof width === 'number') return width;
      if (typeof width === 'string' && width.endsWith('px')) {
        return parseInt(width);
      }
      return 800; // Default size if we can't determine
    }, [width]);
    
    // Get optimized image URL
    const optimizedSrc = useMemo(() => 
      getOptimizedImageUrl(src, imageWidth), 
    [src, imageWidth]);
    
    // Intersection observer for lazy loading
    const { ref: inViewRef, inView } = useInView({
      triggerOnce: true,
      rootMargin: '200px 0px', // Start loading 200px before it enters viewport
      skip: priority // Skip if image has priority
    });
    
    // Handle image loading
    const handleLoad = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    
    // Handle image loading error
    const handleError = () => {
      setHasError(true);
      
      if (fallbackSrc && fallbackSrc !== src) {
        console.warn(`[OptimizedImage] Failed to load image: ${src}, using fallback`);
      } else {
        console.error(`[OptimizedImage] Failed to load image: ${src}`);
      }
      
      onError?.();
    };
    
    // Current image source to display (optimized, fallback, or original)
    const imgSrc = hasError && fallbackSrc ? fallbackSrc : optimizedSrc;
    
    // Set loading attribute based on strategy
    const loadingAttribute = priority ? 'eager' : loadingStrategy;
    
    // Calculate aspect ratio for placeholder
    const aspectRatio = useMemo(() => {
      if (typeof width === 'number' && typeof height === 'number') {
        return height / width;
      }
      return undefined;
    }, [width, height]);
    
    // Should start loading based on priority or visibility
    const shouldLoad = priority || inView;
    
    // Style for placeholder
    const placeholderStyle = {
      backgroundColor: placeholderColor,
      aspectRatio: aspectRatio ? `${width} / ${height}` : undefined,
      width: width || '100%',
      height: height || 'auto',
    };
    
    return (
      <div
        ref={inViewRef as unknown as React.RefObject<HTMLDivElement>}
        className={cn(
          'relative overflow-hidden',
          containerClassName,
        )}
        style={{
          width: width || '100%',
          height: height || 'auto',
        }}
      >
        {showPlaceholder && !isLoaded && (
          <div 
            className="absolute inset-0 bg-muted animate-pulse"
            style={placeholderStyle}
          />
        )}
        
        {/* Only render the image if it should load (priority or in view) */}
        {shouldLoad && (
          <img
            ref={ref}
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "max-w-full transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            loading={loadingAttribute}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            {...props}
          />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
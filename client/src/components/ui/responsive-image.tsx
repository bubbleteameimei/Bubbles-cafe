
import React from 'react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileSrc?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  mobileSrc,
  className,
  width,
  height,
  loading = 'lazy'
}) => {
  const { isMobile } = useMobileDetection();
  
  // Use mobile-specific image if available and on mobile device
  const imageSrc = isMobile && mobileSrc ? mobileSrc : src;
  
  return (
    <img 
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      style={{
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

export default ResponsiveImage;
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  srcSets?: {
    width: number;
    path: string;
  }[];
  placeholderColor?: string;
  lazyLoad?: boolean;
  fallbackSrc?: string;
}

export function ResponsiveImage({
  src,
  alt,
  srcSets,
  className,
  placeholderColor = '#121212',
  lazyLoad = true,
  fallbackSrc,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
  }, [src]);

  const buildSrcSet = () => {
    if (!srcSets || srcSets.length === 0) return undefined;
    return srcSets.map(set => `${set.path} ${set.width}w`).join(', ');
  };

  const handleError = () => {
    setError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ 
        backgroundColor: !isLoaded ? placeholderColor : 'transparent',
        transition: 'background-color 0.3s ease'
      }}
    >
      <img
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        srcSet={!error ? buildSrcSet() : undefined}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading={lazyLoad ? "lazy" : "eager"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={cn(
          "w-full h-auto transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
        {...props}
      />
    </div>
  );
}

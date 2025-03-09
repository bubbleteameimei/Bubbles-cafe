
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


// Skeleton component that returns absolutely nothing
import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Lightweight skeleton placeholder with minimal styles.
 * Use for inline loading states instead of global overlays.
 */
function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      style={style}
      {...props}
    />
  );
}

export { Skeleton }
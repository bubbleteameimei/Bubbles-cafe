
// Skeleton component that returns absolutely nothing
import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Lightweight skeleton placeholder with minimal styles.
 * Includes an optional shimmer effect that respects prefers-reduced-motion.
 */
function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background: reduceMotion
          ? 'var(--skeleton-bg, hsl(var(--muted)))'
          : 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted))/0.8 37%, hsl(var(--muted)) 63%)',
        backgroundSize: reduceMotion ? undefined : '400% 100%',
        animation: reduceMotion ? undefined : 'skeletonShimmer 1.2s ease-in-out infinite',
        ...style,
      }}
      {...props}
    >
      {/* Inline keyframes to avoid relying on global animate-pulse override */}
      {!reduceMotion && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes skeletonShimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `,
          }}
        />
      )}
    </div>
  );
}

export { Skeleton }
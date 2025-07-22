/**
 * LazyContentLoader Component
 * 
 * This component provides a wrapper to lazily load content with
 * loading skeletons, fade-in animations, and optional error states.
 * It improves perceived performance by showing placeholders while content loads.
 */

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyContentLoaderProps {
  /** Content to render when loaded */
  children: React.ReactNode;
  
  /** Whether the content is currently loading */
  isLoading?: boolean;
  
  /** Delay before showing skeleton (ms) */
  delay?: number;
  
  /** Error message to display if loading failed */
  error?: Error | string | null;
  
  /** Function to retry loading when an error occurs */
  onRetry?: () => void;
  
  /** Whether to delay unmounting when switching between loading states */
  useDelayedUnmounting?: boolean;
  
  /** Fade-in animation duration (ms) */
  fadeInDuration?: number;
  
  /** Only load content when scrolled into view */
  lazyLoad?: boolean;
  
  /** Margin around the element for triggering lazy loading */
  lazyLoadMargin?: string;
  
  /** Number of skeleton rows to show */
  skeletonRows?: number;
  
  /** Height of each skeleton row (px) */
  skeletonHeight?: number;
  
  /** Whether to show skeleton variation (uses different heights) */
  skeletonVariation?: boolean;
  
  /** Minimum time to show the loading state (ms) */
  minimumLoadingTime?: number;
  
  /** Additional CSS class for the container */
  className?: string;
  
  /** Additional CSS class for the skeleton */
  skeletonClassName?: string;
  
  /** Additional CSS class for the error alert */
  errorClassName?: string;
  
  /** Additional CSS class for the content */
  contentClassName?: string;
}

export function LazyContentLoader({
  children,
  isLoading = false,
  delay = 300,
  error = null,
  onRetry,
  useDelayedUnmounting = true, 
  fadeInDuration = 300,
  lazyLoad = false,
  lazyLoadMargin = '200px',
  skeletonRows = 3,
  skeletonHeight = 24,
  skeletonVariation = true,
  minimumLoadingTime = 500,
  className = '',
  skeletonClassName = '',
  errorClassName = '',
  contentClassName = '',
}: LazyContentLoaderProps) {
  const [showContent, setShowContent] = useState(!isLoading && !lazyLoad);
  const [showLoading, setShowLoading] = useState(isLoading);
  const [showError, setShowError] = useState(!!error);
  const [loadStart, setLoadStart] = useState<number | null>(null);
  
  // For lazy loading based on scroll position
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: lazyLoadMargin,
    // Skip if not using lazy loading
    skip: !lazyLoad
  });
  
  // Convert error to string
  const errorMessage = error 
    ? (error instanceof Error ? error.message : String(error))
    : null;
  
  // Handle loading state changes
  useEffect(() => {
    let loadingTimer: number | null = null;
    let delayTimer: number | null = null;
    let minimumLoadTimer: number | null = null;
    
    if (isLoading) {
      // Start loading, track time for minimum duration
      setLoadStart(Date.now());
      
      // Delay showing the loading state to avoid flashes
      delayTimer = window.setTimeout(() => {
        setShowLoading(true);
        setShowContent(false);
        setShowError(false);
      }, delay);
    } else {
      // Loading completed
      if (loadStart) {
        const elapsed = Date.now() - loadStart;
        const remaining = Math.max(0, minimumLoadingTime - elapsed);
        
        // Ensure minimum loading time to avoid flashes
        minimumLoadTimer = window.setTimeout(() => {
          if (error) {
            // Show error state
            setShowError(true);
            setShowLoading(false);
            
            // Delayed unmounting for smooth transitions
            if (useDelayedUnmounting) {
              loadingTimer = window.setTimeout(() => {
                setShowContent(false);
              }, fadeInDuration);
            } else {
              setShowContent(false);
            }
          } else {
            // Show content
            setShowContent(true);
            
            // Delayed unmounting for smooth transitions
            if (useDelayedUnmounting) {
              loadingTimer = window.setTimeout(() => {
                setShowLoading(false);
                setShowError(false);
              }, fadeInDuration);
            } else {
              setShowLoading(false);
              setShowError(false);
            }
          }
        }, remaining);
      } else {
        // Initial state or resets
        setShowError(!!error);
        setShowContent(!error);
        setShowLoading(false);
      }
    }
    
    // Cleanup timers
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (loadingTimer) clearTimeout(loadingTimer);
      if (minimumLoadTimer) clearTimeout(minimumLoadTimer);
    };
  }, [isLoading, error, delay, useDelayedUnmounting, fadeInDuration, minimumLoadingTime, loadStart]);
  
  // Handle lazy loading when scrolled into view
  useEffect(() => {
    if (lazyLoad && inView && !showContent && !isLoading) {
      setShowContent(true);
    }
  }, [lazyLoad, inView, showContent, isLoading]);
  
  // Create skeleton rows with some variation
  const renderSkeleton = () => {
    const rows = [];
    for (let i = 0; i < skeletonRows; i++) {
      // Add some height variation if enabled
      const height = skeletonVariation 
        ? skeletonHeight * (0.7 + Math.random() * 0.6) 
        : skeletonHeight;
      
      // Add some width variation if enabled
      const width = skeletonVariation 
        ? `${65 + Math.random() * 35}%` 
        : '100%';
      
      rows.push(
        <Skeleton 
          key={i} 
          className={cn('mb-2', skeletonClassName)}
          style={{ height, width }}
        />
      );
    }
    return rows;
  };
  
  // If content should be lazy loaded and not in view yet
  if (lazyLoad && !inView && !showContent) {
    return (
      <div 
        ref={ref}
        className={cn('min-h-[100px]', className)}
      >
        {renderSkeleton()}
      </div>
    );
  }
  
  return (
    <div className={cn('relative transition-opacity', className)}>
      {/* Loading skeleton */}
      {showLoading && (
        <div
          className={cn(
            'transition-opacity duration-300',
            showContent ? 'opacity-0' : 'opacity-100'
          )}
        >
          {renderSkeleton()}
        </div>
      )}
      
      {/* Error state */}
      {showError && (
        <Alert 
          variant="destructive"
          className={cn('my-2', errorClassName)}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage || 'An error occurred while loading content.'}
            
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Content */}
      {showContent && (
        <div
          className={cn(
            'transition-opacity',
            showLoading ? 'opacity-0' : 'opacity-100',
            contentClassName
          )}
          style={{ 
            transitionDuration: `${fadeInDuration}ms`,
            transitionProperty: 'opacity'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default LazyContentLoader;
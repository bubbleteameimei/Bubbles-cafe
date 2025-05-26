import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useGlobalLoadingOverlay } from './GlobalLoadingOverlay';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  minLoadingTime?: number;
}

export function EnhancedPageTransition({ 
  children, 
  minLoadingTime = 800 
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [currentChildren, setCurrentChildren] = useState(children);
  const prevLocationRef = useRef(location);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showLoadingOverlay, hideLoadingOverlay, setLoadingMessage } = useGlobalLoadingOverlay();

  // Simple page transition using just React state
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      console.log('[EnhancedPageTransition] Location changed, showing loading screen');
      setLoadingMessage('Loading page...');
      showLoadingOverlay();

      // Set a minimum loading time
      setTimeout(() => {
        const startTime = Date.now();

        // Simulate some loading time if needed
        const remaining = Math.max(0, minLoadingTime - (Date.now() - startTime));

        setTimeout(() => {
          setCurrentChildren(children);

          // Give the DOM a moment to update before hiding loading screen
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              hideLoadingOverlay();
              prevLocationRef.current = location;
            });
          });
        }, remaining);
      }, 50); // Small delay to ensure loading screen renders first
    } else {
      // If it's an initial render, just show the content
      setCurrentChildren(children);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, children, minLoadingTime, showLoadingOverlay, hideLoadingOverlay, setLoadingMessage]);

  return (
    <div className="page-transition-container">
      {/* Current page content */}
      <div className="page-content">
        {currentChildren}
      </div>
    </div>
  );
}

export default EnhancedPageTransition;
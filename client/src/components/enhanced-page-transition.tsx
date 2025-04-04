import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { LoadingScreen } from './ui/loading-screen';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  minLoadingTime?: number;
}

export function EnhancedPageTransition({
  children,
  minLoadingTime = 850, // Minimum time to show loading screen for visual consistency
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [showLoading, setShowLoading] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const prevLocationRef = useRef<string>(location);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const childrenRef = useRef(children);
  const transitionCompleteRef = useRef(true); // Track if transition is complete
  
  // Update children ref whenever children prop changes
  useEffect(() => {
    childrenRef.current = children;
    
    // If this is a children update during an active reader-to-reader transition,
    // we need to force update the visible children immediately
    if (!transitionCompleteRef.current) {
      console.log('[PageTransition] Children updated during active transition, forcing update');
      setCurrentChildren(children);
    }
  }, [children]);
  
  // Simple page transition using just React state
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      console.log(`[PageTransition] Location changed: ${prevLocationRef.current} -> ${location}`);
      transitionCompleteRef.current = false; // Mark transition as active
      
      // Enhanced detection for reader-to-reader transitions
      // This now properly handles both direct slugs (/reader/slug) and community stories (/community/story/slug)
      const basePath = (path: string) => path.split('?')[0];
      const currentBasePath = basePath(location);
      const prevBasePath = basePath(prevLocationRef.current);
      
      // Extract the route type (reader or community/story)
      const getRouteType = (path: string) => {
        if (path.startsWith('/reader/')) return 'reader';
        if (path.startsWith('/community/story/')) return 'community-story';
        if (path === '/reader') return 'reader-index';
        return 'other';
      };
      
      const currentType = getRouteType(currentBasePath);
      const prevType = getRouteType(prevBasePath);
      
      // Consider it a reader-to-reader transition if:
      // 1. Both are some kind of reader page (reader, community-story, reader-index)
      // 2. The URLs are different (not a refresh)
      // This improves handling of transitions between different story types
      const isReaderToReader = 
        (currentType === 'reader' || currentType === 'community-story' || currentType === 'reader-index') && 
        (prevType === 'reader' || prevType === 'community-story' || prevType === 'reader-index') &&
        // Don't treat as reader-to-reader if going to exactly the same URL
        // as this would be a refresh rather than navigation
        currentBasePath !== prevBasePath;
      
      console.log(`[PageTransition] isReaderToReader: ${isReaderToReader}`, {
        current: currentBasePath,
        prev: prevBasePath
      });
      
      // Start timing for minimum loading display
      startTimeRef.current = Date.now();
      
      // Always update the prev location immediately for reader-to-reader 
      // to ensure the reader component gets remounted with new props
      if (isReaderToReader) {
        prevLocationRef.current = location;
        
        // Force a more immediate content update for reader-to-reader transitions
        // This helps ensure the reader remounts with new URL params
        setCurrentChildren(childrenRef.current);
        
        // Short delay to allow data loading to start
        setTimeout(() => {
          transitionCompleteRef.current = true; // Mark transition as complete
        }, 50);
      } else {
        // Show loading immediately for non-reader transitions
        setShowLoading(true);
        
        // Clear any existing timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set a timeout to switch content
        timeoutRef.current = setTimeout(() => {
          // Calculate how much longer we need to show the loading screen
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, minLoadingTime - elapsed);
          
          console.log(`[PageTransition] Switching content after ${elapsed}ms, remaining: ${remaining}ms`);
          
          // After minimum loading time, swap in the new content 
          setTimeout(() => {
            // Important: Always update to the latest children reference
            // This ensures we're showing the most current content
            setCurrentChildren(childrenRef.current);
            
            // Give the DOM a moment to update before hiding loading screen
            requestAnimationFrame(() => {
              setShowLoading(false);
              prevLocationRef.current = location;
              transitionCompleteRef.current = true; // Mark transition as complete
              console.log(`[PageTransition] Transition complete to ${location}`);
            });
          }, remaining);
        }, 30);
      }
    } else {
      // If it's an initial render, just show the content
      setCurrentChildren(children);
      transitionCompleteRef.current = true;
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, minLoadingTime]); // Removed children from dependency array since we use ref
  
  return (
    <div className="page-transition-container">
      {/* Just use the standardized loading screen component */}
      {showLoading && <LoadingScreen />}
      
      {/* Current page content */}
      <div className="page-content">
        {currentChildren}
      </div>
    </div>
  );
}

export default EnhancedPageTransition;
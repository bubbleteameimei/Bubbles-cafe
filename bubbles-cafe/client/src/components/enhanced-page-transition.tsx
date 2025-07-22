import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useLoading } from './GlobalLoadingProvider';

interface EnhancedPageTransitionProps {
  children: React.ReactNode;
  minLoadingTime?: number;
}

export function EnhancedPageTransition({
  children,
  minLoadingTime = 850, // Reduced minimum loading time for better user experience (850ms is enough for animation)
}: EnhancedPageTransitionProps) {
  const [location] = useLocation();
  const [currentChildren, setCurrentChildren] = useState(children);
  const prevLocationRef = useRef<string>(location);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { showLoading, hideLoading } = useLoading();
  
  // Simple page transition using just React state
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      // Start timing for minimum loading display
      startTimeRef.current = Date.now();
      
      // Use the GlobalLoadingProvider instead of local state
      showLoading();
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to switch content
      timeoutRef.current = setTimeout(() => {
        // Calculate how much longer we need to show the loading screen
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        
        // After minimum loading time, swap in the new content 
        setTimeout(() => {
          // Update the child component to the new route's content
          setCurrentChildren(children);
          
          // Give the DOM a moment to update before hiding loading screen
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              hideLoading();
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
  }, [location, children, minLoadingTime, showLoading, hideLoading]);
  
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
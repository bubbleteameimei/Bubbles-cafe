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
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const prevLocationRef = useRef<string>(location);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Handler for when the loading animation completes
  const handleAnimationComplete = () => {
    setIsLoadingComplete(true);
  };
  
  // Simple page transition using just React state
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      // Start timing for minimum loading display
      startTimeRef.current = Date.now();
      
      // Reset loading complete flag
      setIsLoadingComplete(false);
      
      // Show loading immediately
      setShowLoading(true);
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to switch content
      timeoutRef.current = setTimeout(() => {
        // Update the child component to the new route's content
        setCurrentChildren(children);
        
        // Only hide loading screen after both:
        // 1. Animation has completed its full cycle
        // 2. Minimum loading time has passed (for slow networks)
        if (isLoadingComplete) {
          // Give the DOM a moment to update before hiding loading screen
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setShowLoading(false);
              prevLocationRef.current = location;
            });
          });
        }
      }, minLoadingTime); // Ensure minimum display time
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
  }, [location, children, minLoadingTime, isLoadingComplete]);
  
  // Effect to handle loading animation completion
  useEffect(() => {
    if (isLoadingComplete && timeoutRef.current) {
      // If min loading time has already elapsed, hide the loading screen
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= minLoadingTime) {
        // Update the route content if needed
        setCurrentChildren(children);
        
        // Hide loading screen
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShowLoading(false);
            prevLocationRef.current = location;
          });
        });
      }
    }
  }, [isLoadingComplete, children, location, minLoadingTime]);
  
  return (
    <div className="page-transition-container">
      {/* Use loading screen with animation complete callback */}
      {showLoading && <LoadingScreen onAnimationComplete={handleAnimationComplete} />}
      
      {/* Current page content */}
      <div className="page-content">
        {currentChildren}
      </div>
    </div>
  );
}

export default EnhancedPageTransition;
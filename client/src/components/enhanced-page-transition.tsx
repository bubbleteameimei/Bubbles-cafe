import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { LoadingScreen } from './ui/loading-screen';
import './transition.css'; // Will create this file for basic CSS transitions

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
  
  // Simple page transition using just React state and CSS
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      // Start timing for minimum loading display
      startTimeRef.current = Date.now();
      
      // Show loading immediately and freeze scrolling
      setShowLoading(true);
      document.body.style.overflow = 'hidden';
      
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
              setShowLoading(false);
              document.body.style.overflow = '';
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
      document.body.style.overflow = '';
    };
  }, [location, children, minLoadingTime]);
  
  return (
    <div 
      className="page-transition-container"
      style={{
        // Critical styles for proper full-width layout
        width: '100%',
        minWidth: '100%',
        maxWidth: '100vw',
        padding: 0,
        margin: 0,
        overflowX: 'hidden'
      }}
    >
      {/* Loading overlay - absolute positioned with high z-index */}
      {showLoading && <LoadingScreen />}
      
      {/* Current page content with inline styles for full-width enforcement */}
      <div 
        className="page-content"
        style={{
          width: '100%',
          minWidth: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          padding: 0
        }}
      >
        {currentChildren}
      </div>
    </div>
  );
}

export default EnhancedPageTransition;
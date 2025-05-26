import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

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

  // Simple page transition using just React state
  useEffect(() => {
    // Only trigger transition on actual location changes
    if (location !== prevLocationRef.current) {
      // Simple instant page transition without any loading delays
      setCurrentChildren(children);
      prevLocationRef.current = location;
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
  }, [location, children]);

  return (
    <div className="page-transition-container">
      {/* Current page content */}
      <div className="page-content">
        {currentChildren}
      </div>
    </div>
  );
}
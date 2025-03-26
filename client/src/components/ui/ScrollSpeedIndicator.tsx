import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollSpeedIndicatorProps {
  scrollType: 'normal' | 'fast' | 'slow';
  visible: boolean;
}

/**
 * Visual indicator that shows the current scroll speed mode
 * Appears as a subtle vertical bar on the right side of the screen
 */
const ScrollSpeedIndicator: React.FC<ScrollSpeedIndicatorProps> = ({
  scrollType,
  visible
}) => {
  // Fade out state handling
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  // Handle visibility changes with animation
  useEffect(() => {
    // If indicator should be visible
    if (visible) {
      setShouldRender(true);
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // First make invisible (triggers fade out)
      setIsVisible(false);
      
      // Then remove from DOM after animation
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [visible]);
  
  // Don't render if no need to show
  if (!shouldRender) return null;
  
  return (
    <div
      className={cn(
        "fixed right-2 top-1/2 -translate-y-1/2 h-20 w-1.5 rounded-full transition-opacity duration-300 z-50",
        isVisible ? "opacity-80" : "opacity-0",
        scrollType === 'fast' ? "bg-red-500 h-32" : 
        scrollType === 'slow' ? "bg-blue-500 h-12" : 
        "bg-gray-400 h-20"
      )}
      aria-hidden="true"
    />
  );
};

export default ScrollSpeedIndicator;
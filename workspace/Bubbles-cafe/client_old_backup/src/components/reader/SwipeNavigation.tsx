import React, { useEffect, useRef } from 'react';

interface SwipeNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  minSwipeDistance?: number;
}

/**
 * A component that wraps content and adds swipe navigation
 * This separates the swipe logic from the reader component to avoid hook ordering issues
 */
export function SwipeNavigation({
  onPrevious,
  onNext,
  disabled = false,
  children,
  minSwipeDistance = 70
}: SwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  useEffect(() => {
    const element = containerRef.current;
    if (!element || disabled) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      touchEndX.current = e.changedTouches[0].screenX;
      
      // Calculate swipe distance
      const swipeDistance = touchEndX.current - touchStartX.current;
      
      // Only trigger if swipe distance is significant enough
      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swiped left-to-right (going back, previous chapter)
          onPrevious();
        } else {
          // Swiped right-to-left (moving forward, next chapter)
          onNext();
        }
      }
      
      // Reset touch tracking
      touchStartX.current = null;
      touchEndX.current = null;
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onNext, onPrevious, disabled, minSwipeDistance]);
  
  return (
    <div ref={containerRef} className="swipe-navigation-container" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}

export default SwipeNavigation;
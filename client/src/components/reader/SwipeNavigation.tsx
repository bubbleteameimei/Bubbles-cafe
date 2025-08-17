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
  minSwipeDistance = 120
}: SwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  
  useEffect(() => {
    const element = containerRef.current;
    if (!element || disabled) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      touchStartX.current = t.screenX;
      touchStartY.current = t.screenY;
      touchStartTime.current = Date.now();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      const t = e.changedTouches[0];
      touchEndX.current = t.screenX;
      touchEndY.current = t.screenY;
      
      // Calculate swipe distance
      const swipeDistance = touchEndX.current - touchStartX.current;
      const verticalDistance = (touchEndY.current ?? 0) - (touchStartY.current ?? 0);
      const durationMs = touchStartTime.current ? Date.now() - touchStartTime.current : 0;
      
      // Only trigger if swipe distance is significant, vertical drift is small, and gesture not too quick
      const verticalLock = Math.abs(verticalDistance) < 40; // ignore if user mostly scrolled vertically
      const slowEnough = durationMs > 120; // ignore ultra-quick accidental flicks
      if (verticalLock && slowEnough && Math.abs(swipeDistance) >= minSwipeDistance) {
        // Prevent default browser behavior for our custom swipe
        e.preventDefault();
        
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
      touchStartY.current = null;
      touchEndY.current = null;
      touchStartTime.current = null;
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: false }); // Not passive to allow preventDefault
    
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
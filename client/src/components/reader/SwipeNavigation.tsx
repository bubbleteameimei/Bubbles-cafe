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
  minSwipeDistance = 90
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
      
      // Calculate swipe deltas
      const dx = (touchEndX.current ?? 0) - (touchStartX.current ?? 0);
      const dy = (touchEndY.current ?? 0) - (touchStartY.current ?? 0);
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const durationMs = touchStartTime.current ? Date.now() - touchStartTime.current : 0;
      const velocity = durationMs > 0 ? absDx / durationMs : 0; // px per ms
      
      // Heuristics:
      // - Prefer horizontal movement (ratio > 1.25)
      // - Allow a fast flick with lower distance (velocity >= 0.6 and distance >= 60)
      // - Allow a deliberate swipe (distance >= minSwipeDistance and vertical drift not dominant)
      const horizontalDominant = absDx > absDy * 1.25;
      const fastFlick = velocity >= 0.6 && absDx >= 60 && absDy <= absDx * 0.6;
      const deliberateSwipe = absDx >= minSwipeDistance && absDy <= 60 && horizontalDominant;
      const shouldSwipe = (fastFlick || deliberateSwipe) && absDx > 0;
      
      if (shouldSwipe) {
        // Prevent default browser behavior for our custom swipe
        e.preventDefault();
        
        if (dx > 0) {
          onPrevious();
        } else {
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
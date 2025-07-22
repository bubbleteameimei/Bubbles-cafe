import { useEffect, useRef, RefObject } from 'react';

interface SwipeNavigationOptions {
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  ref: RefObject<HTMLElement>;
  minSwipeDistance?: number;
}

/**
 * Hook to add chapter navigation via swipe gestures
 * 
 * Swipe right-to-left navigates to the next chapter (natural direction of reading)
 * Swipe left-to-right navigates to the previous chapter (going back in reading)
 * 
 * @param options Configuration options for swipe navigation
 */
export function useSwipeNavigation({
  onPrevious,
  onNext,
  disabled = false,
  ref,
  minSwipeDistance = 100,
}: SwipeNavigationOptions): void {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipeGesture();
    };
    
    const handleSwipeGesture = () => {
      if (touchStartX.current === null || touchEndX.current === null) return;
      
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
  }, [onNext, onPrevious, disabled, ref, minSwipeDistance]);
}
import { useEffect, useState, RefObject } from 'react';

interface SwipeCloseOptions {
  onClose: () => void;
  minSwipeDistance?: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  ref?: RefObject<HTMLElement>;
  maxDiagonalRatio?: number;
}

/**
 * A hook that adds swipe-to-close functionality to an element with improved touch detection
 * @param options - Configuration options for the swipe gesture
 */
export function useSwipeClose({
  onClose,
  minSwipeDistance = 50,
  direction = 'left', // Default to swiping left to close (for right-side drawers)
  ref,
  maxDiagonalRatio = 0.8, // Maximum ratio of vertical to horizontal movement to consider a valid swipe
}: SwipeCloseOptions) {
  // Track both X and Y coordinates
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [hasTriggeredClose, setHasTriggeredClose] = useState(false);
  
  useEffect(() => {
    // Get the element to attach listeners to
    const element = ref?.current || document;
    
    // Type the event handlers properly
    const handleTouchStart = (e: Event) => {
      if (e instanceof TouchEvent) {
        setTouchStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
        setHasTriggeredClose(false);
      }
    };
    
    const handleTouchMove = (e: Event) => {
      if (!(e instanceof TouchEvent) || touchStart === null || hasTriggeredClose) return;
      
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      
      // Calculate horizontal and vertical distance
      const diffX = touchStart.x - touchCurrentX;
      const diffY = touchStart.y - touchCurrentY;
      
      // Get absolute values for calculations
      const absDiffX = Math.abs(diffX);
      const absDiffY = Math.abs(diffY);
      
      // Only process if it's primarily a horizontal swipe for left/right directions
      // or a vertical swipe for top/bottom directions
      const isHorizontal = (direction === 'left' || direction === 'right');
      const isValidDirection = isHorizontal 
        ? absDiffY / absDiffX <= maxDiagonalRatio // For horizontal, vertical should be minimal
        : absDiffX / absDiffY <= maxDiagonalRatio; // For vertical, horizontal should be minimal
      
      if (!isValidDirection) return;
      
      // Only trigger if we've moved enough in the correct direction
      let shouldClose = false;
      
      switch (direction) {
        case 'left':
          shouldClose = diffX > minSwipeDistance; // Swipe left (- value)
          break;
        case 'right':
          shouldClose = diffX < -minSwipeDistance; // Swipe right (+ value)
          break;
        case 'top':
          shouldClose = diffY > minSwipeDistance; // Swipe up (- value)
          break;
        case 'bottom':
          shouldClose = diffY < -minSwipeDistance; // Swipe down (+ value)
          break;
      }
      
      if (shouldClose) {
        setHasTriggeredClose(true);
        // Also find and click the close button to ensure the sheet closes properly
        const closeButton = document.querySelector('[data-close-button="true"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        } else {
          onClose(); // Fallback to onClose if button not found
        }
      }
    };
    
    const handleTouchEnd = () => {
      // Reset touch tracking
      setTouchStart(null);
      
      // Small delay to reset trigger state
      setTimeout(() => {
        setHasTriggeredClose(false);
      }, 300);
    };
    
    // Add event listeners with passive option to improve performance
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, hasTriggeredClose, onClose, minSwipeDistance, direction, ref, maxDiagonalRatio]);

  // Return nothing as the event listeners are attached in the effect
}

/**
 * Helper function to close a sheet component programmatically
 * This can be used outside the hook to close any sheet with the data-close-button attribute
 */
export function closeSheet() {
  const closeButton = document.querySelector('[data-close-button="true"]') as HTMLButtonElement;
  if (closeButton) {
    closeButton.click();
    return true;
  }
  return false;
}
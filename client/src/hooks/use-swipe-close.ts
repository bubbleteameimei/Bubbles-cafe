import { useEffect, useState, RefObject } from 'react';

interface SwipeCloseOptions {
  onClose: () => void;
  minSwipeDistance?: number;
  direction?: 'left' | 'right';
  ref?: RefObject<HTMLElement>;
}

/**
 * A hook that adds swipe-to-close functionality to an element
 * @param options - Configuration options for the swipe gesture
 * @returns A ref to attach to the element that should detect swipes
 */
export function useSwipeClose({
  onClose,
  minSwipeDistance = 50,
  direction = 'left', // Default to swiping left to close (for right-side drawers)
  ref,
}: SwipeCloseOptions) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
  useEffect(() => {
    // Get the element to attach listeners to
    const element = ref?.current || document;
    
    // Type the event handlers properly
    const handleTouchStart = (e: Event) => {
      if (e instanceof TouchEvent) {
        setTouchStartX(e.touches[0].clientX);
      }
    };
    
    const handleTouchMove = (e: Event) => {
      if (!(e instanceof TouchEvent) || touchStartX === null) return;
      
      const touchEndX = e.touches[0].clientX;
      const touchDiff = touchStartX - touchEndX;
      
      // For left direction: close when swiping left (touchDiff > 0)
      // For right direction: close when swiping right (touchDiff < 0)
      if (direction === 'left' && touchDiff > minSwipeDistance) {
        onClose();
        setTouchStartX(null); // Reset to prevent multiple triggers
      } else if (direction === 'right' && touchDiff < -minSwipeDistance) {
        onClose();
        setTouchStartX(null); // Reset to prevent multiple triggers
      }
    };
    
    const handleTouchEnd = () => {
      setTouchStartX(null);
    };
    
    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStartX, onClose, minSwipeDistance, direction, ref]);
}

import { useState, useEffect, useCallback, RefObject } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeOptions {
  threshold?: number; // Minimum distance in pixels
  timeout?: number; // Maximum time in ms
  preventDefaultOnSwipe?: boolean;
}

export function useSwipe<T extends HTMLElement>(
  ref: RefObject<T>,
  onSwipe?: (direction: SwipeDirection) => void,
  options: SwipeOptions = {}
): SwipeDirection {
  const [direction, setDirection] = useState<SwipeDirection>(null);
  
  const {
    threshold = 50,
    timeout = 300,
    preventDefaultOnSwipe = true
  } = options;

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    setDirection(direction);
    if (onSwipe) {
      onSwipe(direction);
    }
  }, [onSwipe]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;
      
      // If the touch event lasted longer than the timeout, it's not a swipe
      if (deltaTime > timeout) return;
      
      // Calculate absolute changes
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // Determine the direction with the largest change
      if (absX > absY && absX > threshold) {
        // Horizontal swipe
        const direction: SwipeDirection = deltaX > 0 ? 'right' : 'left';
        
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }
        
        handleSwipe(direction);
      } else if (absY > absX && absY > threshold) {
        // Vertical swipe
        const direction: SwipeDirection = deltaY > 0 ? 'down' : 'up';
        
        if (preventDefaultOnSwipe) {
          e.preventDefault();
        }
        
        handleSwipe(direction);
      }
    };
    
    // Attach event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    
    // Clean up
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, threshold, timeout, preventDefaultOnSwipe, handleSwipe]);
  
  return direction;
}

import { useEffect, useState, useRef } from 'react';

export interface AdaptiveScrollOptions {
  enabled?: boolean;
  sensitivity?: number;
  showIndicator?: boolean; // Kept for backward compatibility but no longer used
}

/**
 * Hook that implements the Multi-Speed Scroll feature
 * 
 * This hook provides a more intuitive and subtle scrolling experience:
 * - Fast gestures are detected but amplification is minimal to avoid disorientation
 * - Slow gestures use natural browser scrolling for predictable behavior
 * - No visual indicators are shown to create a cleaner user experience
 */
const useAdaptiveScroll = ({
  enabled = true,
  sensitivity = 1.2, // Reduced sensitivity for more natural feel
  showIndicator = false // Visual indicators disabled by default
}: AdaptiveScrollOptions = {}) => {
  // Current scroll type (still tracked internally but no longer displayed)
  const [scrollType, setScrollType] = useState<'normal' | 'fast' | 'slow'>('normal');
  // Is currently scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Refs to track scroll velocity and timing
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);
  const velocityHistory = useRef<number[]>([]);
  
  // Apply scroll behavior based on user interaction
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Handle wheel (desktop) events with a more subtle approach
    const handleWheel = (e: WheelEvent) => {
      // Clear any previous scroll timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Get current time and calculate time difference
      const now = performance.now();
      const timeDelta = now - lastScrollTime.current;
      
      // Only measure if we have a meaningful time difference
      if (timeDelta > 10) {
        // Calculate velocity (adjust direction based on deltaY sign)
        const direction = e.deltaY > 0 ? 1 : -1;
        const velocity = Math.abs(e.deltaY) / timeDelta;
        
        // Add to velocity history for smoothing
        velocityHistory.current.push(velocity);
        if (velocityHistory.current.length > 3) { // Reduced history size for faster response
          velocityHistory.current.shift();
        }
        
        // Get average velocity from history
        const avgVelocity = velocityHistory.current.reduce((sum, vel) => sum + vel, 0) / 
                          velocityHistory.current.length;
        
        // Only enhance very fast scrolls (higher threshold)
        if (avgVelocity > 0.8) {
          setScrollType('fast');
          
          // Apply a modest amplification for fast gestures
          // This is subtle enough that users won't be disoriented
          if (!e.defaultPrevented) {
            window.scrollBy({
              top: e.deltaY * sensitivity * direction,
              behavior: 'auto'  // Use auto for fast response
            });
            e.preventDefault();
          }
        } 
        // For all other scrolling, use browser's native behavior
        else {
          // Still track the state for internal purposes
          setScrollType(avgVelocity < 0.1 ? 'slow' : 'normal');
          // But don't modify the scroll behavior
        }
        
        // Indicate scrolling is active
        setIsScrolling(true);
        
        // Update timing references
        lastScrollTime.current = now;
        lastScrollY.current = window.scrollY;
      }
      
      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        setScrollType('normal');
      }, 150);
    };
    
    // Handle touch events for mobile with a more subtle approach
    let touchStartY = 0;
    let touchStartTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = performance.now();
      
      // Reset velocity history for new gesture
      velocityHistory.current = [];
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // For touch devices, we'll track the scroll type but let the browser
      // handle the actual scrolling for more predictable behavior
      const touchY = e.touches[0].clientY;
      const touchTime = performance.now();
      const timeDelta = touchTime - touchStartTime;
      
      // Only process if we have enough data
      if (timeDelta > 10) {
        // Calculate velocity and direction
        const distance = touchStartY - touchY;
        const velocity = Math.abs(distance) / timeDelta;
        
        // Add to velocity history
        velocityHistory.current.push(velocity);
        if (velocityHistory.current.length > 3) {
          velocityHistory.current.shift();
        }
        
        // Calculate average velocity
        const avgVelocity = velocityHistory.current.reduce((sum, vel) => sum + vel, 0) / 
                          velocityHistory.current.length;
        
        // Update scroll type based on velocity
        if (avgVelocity > 0.8) {
          setScrollType('fast');
        } 
        else if (avgVelocity < 0.1) {
          setScrollType('slow');
        }
        else {
          setScrollType('normal');
        }
        
        setIsScrolling(true);
        
        // Update reference points
        touchStartY = touchY;
        touchStartTime = touchTime;
      }
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to detect scroll end
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        setScrollType('normal');
      }, 150);
    };
    
    const handleTouchEnd = () => {
      // For very fast flicks, we'll add just a subtle momentum effect
      if (scrollType === 'fast' && velocityHistory.current.length > 0) {
        const lastVelocity = velocityHistory.current[velocityHistory.current.length - 1];
        
        // Only apply modest momentum for very fast flicks
        if (lastVelocity > 0.9) {
          const direction = touchStartY > window.innerHeight / 2 ? -1 : 1;
          const momentum = lastVelocity * 500 * sensitivity; // Reduced multiplier
          
          window.scrollBy({
            top: momentum * direction,
            behavior: 'smooth'
          });
        }
      }
      
      // Reset velocity history
      velocityHistory.current = [];
    };
    
    // Register event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, sensitivity]);
  
  return {
    scrollType,
    isScrolling
  };
};

export default useAdaptiveScroll;
import { useEffect, useState, useRef } from 'react';

export interface AdaptiveScrollOptions {
  enabled?: boolean;
  sensitivity?: number;
  showIndicator?: boolean;
}

/**
 * Hook that implements the Multi-Speed Scroll feature
 * 
 * This hook monitors scroll events and adjusts scrolling behavior
 * based on the speed of the user's gesture:
 * - Fast flicks: amplified scrolling with momentum
 * - Slow drags: precise, gentle scrolling
 */
const useAdaptiveScroll = ({
  enabled = true,
  sensitivity = 1.5,
  showIndicator = true
}: AdaptiveScrollOptions = {}) => {
  // Current scroll type
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
    
    // Handle wheel (desktop) events
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
        if (velocityHistory.current.length > 5) {
          velocityHistory.current.shift();
        }
        
        // Get average velocity from history
        const avgVelocity = velocityHistory.current.reduce((sum, vel) => sum + vel, 0) / 
                          velocityHistory.current.length;
        
        // Fast scroll beyond threshold
        if (avgVelocity > 0.5) {
          if (scrollType !== 'fast') {
            setScrollType('fast');
          }
          
          // Apply amplified scroll for fast gestures
          if (!e.defaultPrevented) {
            window.scrollBy({
              top: e.deltaY * sensitivity * direction,
              behavior: 'auto'  // Use auto for immediate response
            });
            e.preventDefault();
          }
        } 
        // Slow, precise scrolling
        else if (avgVelocity < 0.1 && avgVelocity > 0) {
          if (scrollType !== 'slow') {
            setScrollType('slow');
          }
          
          // Apply reduced scroll for slow gestures
          if (!e.defaultPrevented) {
            window.scrollBy({
              top: e.deltaY * 0.7 * direction, // Reduced sensitivity
              behavior: 'smooth'  // Smooth for precision
            });
            e.preventDefault();
          }
        }
        // Normal scrolling
        else {
          if (scrollType !== 'normal') {
            setScrollType('normal');
          }
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
    
    // Handle touch events for mobile
    let touchStartY = 0;
    let touchStartTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = performance.now();
      
      // Reset velocity history for new gesture
      velocityHistory.current = [];
    };
    
    const handleTouchMove = (e: TouchEvent) => {
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
        
        // Fast flick detected
        if (avgVelocity > 0.5) {
          setScrollType('fast');
        } 
        // Slow drag detected
        else if (avgVelocity < 0.1) {
          setScrollType('slow');
        }
        // Normal speed
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
      // Handle momentum scrolling for fast flicks
      if (scrollType === 'fast' && velocityHistory.current.length > 0) {
        const lastVelocity = velocityHistory.current[velocityHistory.current.length - 1];
        
        // Amplify scrolling effect based on final velocity
        const momentum = lastVelocity * 1000 * sensitivity;
        
        // Apply momentum scroll
        if (momentum > 50) {
          const direction = touchStartY > window.innerHeight / 2 ? -1 : 1;
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
  }, [enabled, sensitivity, scrollType]);
  
  return {
    scrollType,
    isScrolling
  };
};

export default useAdaptiveScroll;
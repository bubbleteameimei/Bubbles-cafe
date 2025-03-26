import { useState, useEffect, useRef, useCallback } from 'react';

interface InactivityDetectionOptions {
  inactivityTimeout?: number; // milliseconds
  scrollSpeedThreshold?: number; // pixels per second
  minimumInactiveTime?: number; // milliseconds
}

/**
 * Hook to detect user inactivity based on scroll speed and time
 * Triggers a callback when user has stopped scrolling for a period of time
 */
const useInactivityDetection = ({
  inactivityTimeout = 3000, // 3 seconds default
  scrollSpeedThreshold = 10, // 10px/s default
  minimumInactiveTime = 1000 // 1 second minimum
}: InactivityDetectionOptions = {}) => {
  const [isInactive, setIsInactive] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const scrollSpeedRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Calculate scroll speed and set up inactivity timer
  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const timeDelta = currentTime - lastScrollTimeRef.current;
    
    if (timeDelta > 0) {
      // Calculate scroll speed in pixels per second
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current);
      scrollSpeedRef.current = (scrollDelta / timeDelta) * 1000;
      
      // If scroll speed is below threshold, start or reset inactivity timer
      if (scrollSpeedRef.current < scrollSpeedThreshold) {
        clearInactivityTimer();
        inactivityTimerRef.current = setTimeout(() => {
          // Only set inactive if we've been below threshold for minimum time
          if (Date.now() - lastScrollTimeRef.current >= minimumInactiveTime) {
            setIsInactive(true);
          }
        }, inactivityTimeout);
      } else {
        // If scrolling faster than threshold, clear timer and set not inactive
        clearInactivityTimer();
        setIsInactive(false);
      }
    }
    
    // Update reference values
    lastScrollYRef.current = currentScrollY;
    lastScrollTimeRef.current = currentTime;
  }, [clearInactivityTimer, inactivityTimeout, minimumInactiveTime, scrollSpeedThreshold]);

  // Reset inactivity state when user starts scrolling again
  const resetInactivity = useCallback(() => {
    setIsInactive(false);
  }, []);

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add wheel event to detect any scroll attempts
    window.addEventListener('wheel', resetInactivity, { passive: true });
    
    // Add touch events for mobile
    window.addEventListener('touchmove', resetInactivity, { passive: true });
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', resetInactivity);
      window.removeEventListener('touchmove', resetInactivity);
      clearInactivityTimer();
    };
  }, [handleScroll, resetInactivity, clearInactivityTimer]);

  return { isInactive };
};

export default useInactivityDetection;
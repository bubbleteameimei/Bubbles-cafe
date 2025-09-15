import { useState, useEffect, useRef, useCallback } from 'react';

interface InactivityDetectionOptions {
  inactivityTimeout?: number; // milliseconds
  scrollSpeedThreshold?: number; // pixels per second
  minimumInactiveTime?: number; // milliseconds
  uiHideDelay?: number; // milliseconds - specific delay for UI hiding
}

/**
 * Enhanced hook to detect user inactivity based on scroll speed and time
 * Also provides UI hiding functionality for distraction-free mode
 */
const useInactivityDetection = ({
  inactivityTimeout = 3000, // 3 seconds default
  scrollSpeedThreshold = 10, // 10px/s default
  minimumInactiveTime = 1000, // 1 second minimum
  uiHideDelay = 2000 // 2 seconds default for UI hiding
}: InactivityDetectionOptions = {}) => {
  const [isInactive, setIsInactive] = useState(false);
  const [shouldHideUI, setShouldHideUI] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const lastActivityTimeRef = useRef(Date.now());
  const scrollSpeedRef = useRef(0);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uiHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Clear UI hide timer
  const clearUiHideTimer = useCallback(() => {
    if (uiHideTimerRef.current) {
      clearTimeout(uiHideTimerRef.current);
      uiHideTimerRef.current = null;
    }
  }, []);

  // Reset all timers and activity state
  const resetActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();
    setIsInactive(false);
    setShouldHideUI(false);
    clearInactivityTimer();
    clearUiHideTimer();
    
    // Set new timer for UI hiding
    uiHideTimerRef.current = setTimeout(() => {
      setShouldHideUI(true);
    }, uiHideDelay);
  }, [clearInactivityTimer, clearUiHideTimer, uiHideDelay]);

  // Calculate scroll speed and set up inactivity timer
  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    const currentScrollY = window.scrollY;
    const timeDelta = currentTime - lastScrollTimeRef.current;
    
    // Reset activity status
    resetActivity();
    
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
  }, [clearInactivityTimer, inactivityTimeout, minimumInactiveTime, resetActivity, scrollSpeedThreshold]);

  // Handle any mouse movement
  const handleMouseMove = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  // Handle any key press
  const handleKeyPress = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  useEffect(() => {
    // Set initial timer for UI hiding
    uiHideTimerRef.current = setTimeout(() => {
      setShouldHideUI(true);
    }, uiHideDelay);

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add mouse movement listener
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Add key press listener
    window.addEventListener('keydown', handleKeyPress, { passive: true });
    
    // Add wheel event to detect any scroll attempts
    window.addEventListener('wheel', resetActivity, { passive: true });
    
    // Add touch events for mobile
    window.addEventListener('touchmove', resetActivity, { passive: true });
    window.addEventListener('touchstart', resetActivity, { passive: true });
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('wheel', resetActivity);
      window.removeEventListener('touchmove', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
      clearInactivityTimer();
      clearUiHideTimer();
    };
  }, [
    handleScroll, 
    handleMouseMove, 
    handleKeyPress, 
    resetActivity, 
    clearInactivityTimer, 
    clearUiHideTimer, 
    uiHideDelay
  ]);

  return { isInactive, shouldHideUI, resetActivity };
};

export default useInactivityDetection;
import { memo, useEffect, useRef } from "react";

// This is a completely rewritten version of the loading screen that prioritizes
// reliability and performance over complex features
export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  // Use refs to store original body state and callback execution state
  const scrollY = useRef(0);
  const callbackFired = useRef(false);
  
  // Effects should run only once on mount/unmount and be completely self-contained
  useEffect(() => {
    // Save current scroll position first
    scrollY.current = window.scrollY;
    
    // Apply loading state - Use classes only, avoiding direct style manipulation
    document.documentElement.classList.add('disable-scroll');
    document.body.classList.add('loading-active');
    
    // Reset callback fired state
    callbackFired.current = false;
    
    // Create a hard timeout that will force-close the loading screen
    // This is crucial to ensure the loading screen never gets stuck
    const forceCloseTimer = setTimeout(() => {
      if (!callbackFired.current && onAnimationComplete) {
        callbackFired.current = true;
        console.log("Loading screen force-closed after 2 seconds");
        
        // Run cleanup before calling completion callback
        document.documentElement.classList.remove('disable-scroll');
        document.body.classList.remove('loading-active');
        
        // Execute callback last to allow proper cleanup
        onAnimationComplete();
      }
    }, 2000);
    
    // Comprehensive cleanup on unmount - ensures complete state reset
    return () => {
      // Clear the timeout first
      clearTimeout(forceCloseTimer);
      
      // Remove all classes
      document.documentElement.classList.remove('disable-scroll');
      document.body.classList.remove('loading-active');
      
      // Restore scroll position if needed
      window.scrollTo(0, scrollY.current);
      
      console.log("[LoadingScreen] Cleanup complete, scroll restored");
    };
  }, [onAnimationComplete]);
  
  return (
    <div 
      id="eden-loading-screen"
      className="eden-loading-overlay"
      aria-label="Loading screen"
      aria-live="polite"
      role="status"
    >
      <div className="eden-loading-background"></div>
      <div className="eden-loading-content">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>
    </div>
  );
});

export default LoadingScreen;
import { memo, useEffect, useRef } from "react";
import { usePreloading } from "@/hooks/use-preloading";

// This is a completely rewritten version of the loading screen that prioritizes
// reliability and performance over complex features
export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  // Use refs to store original body state and callback execution state
  const scrollY = useRef(0);
  const callbackFired = useRef(false);
  
  // Use our preloading hook to ensure critical assets are loaded
  const { preloadAssets, preloadFont } = usePreloading();
  
  // Effects should run only once on mount/unmount and be completely self-contained
  useEffect(() => {
    // Save current scroll position first
    scrollY.current = window.scrollY;
    
    // Apply loading state - Use classes only, avoiding direct style manipulation
    document.documentElement.classList.add('disable-scroll');
    document.body.classList.add('loading-active');
    
    // Immediately force loading the Megrim font to prevent box placeholders
    preloadFont('Megrim', { 
      priority: 'high',
      fontDisplay: 'swap',
      log: true,
      onLoad: () => console.log("Megrim font loaded successfully"),
      onError: (err: any) => console.error("Failed to load Megrim font:", err)
    });
    
    // Preload other critical assets needed for the loading screen
    preloadAssets([
      // Background images removed
    ]);
    
    // Reset callback fired state
    callbackFired.current = false;
    
    // Single timeout for proper loading completion
    const loadingTimer = setTimeout(() => {
      if (!callbackFired.current && onAnimationComplete) {
        callbackFired.current = true;
        
        // Run cleanup before calling completion callback
        document.documentElement.classList.remove('disable-scroll');
        document.body.classList.remove('loading-active');
        
        // Execute callback
        onAnimationComplete();
      }
    }, 1500); // Reduced to reasonable duration
    
    // Comprehensive cleanup on unmount - ensures complete state reset
    return () => {
      // Clear the timeout first
      clearTimeout(loadingTimer);
      
      // Remove all classes
      document.documentElement.classList.remove('disable-scroll');
      document.body.classList.remove('loading-active');
      
      // Only restore scroll position if it's not the homepage to prevent unwanted scrolling
      if (window.location.pathname !== '/') {
        window.scrollTo(0, scrollY.current);
      }
      
      console.log("[LoadingScreen] Cleanup complete, scroll restored");
    };
  }, [onAnimationComplete, preloadAssets, preloadFont]);
  
  return (
    <div 
      id="app-loading-screen"
      className="loading-screen"
      aria-label="Loading screen"
      aria-live="polite"
      role="status"
    >
      {/* Main loading text with Megrim font */}
      <div className="loader">
        <span style={{ fontFamily: 'Megrim, monospace' }}>L</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>O</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>A</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>D</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>I</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>N</span>
        <span style={{ fontFamily: 'Megrim, monospace' }}>G</span>
      </div>
    </div>
  );
});

export default LoadingScreen;
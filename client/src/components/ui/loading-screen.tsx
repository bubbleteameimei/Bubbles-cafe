import { memo, useEffect, useRef } from "react";
import { usePreloading } from "@/hooks/use-preloading";
import preloadManager from "@/lib/preloadManager";

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
      onError: (err) => console.error("Failed to load Megrim font:", err)
    });
    
    // Preload other critical assets needed for the loading screen
    preloadAssets([
      // Try different background paths based on what's available
      '/loading-background.jpeg',
      '/images/background.jpeg',
      '/images/horror-background.jpg'
    ]);
    
    // Reset callback fired state
    callbackFired.current = false;
    
    // Create a hard timeout that will force-close the loading screen
    // This is crucial to ensure the loading screen never gets stuck
    const forceCloseTimer = setTimeout(() => {
      if (!callbackFired.current && onAnimationComplete) {
        callbackFired.current = true;
        console.log("Loading screen force-closed after 2.5 seconds");
        
        // Run cleanup before calling completion callback
        document.documentElement.classList.remove('disable-scroll');
        document.body.classList.remove('loading-active');
        
        // Execute callback last to allow proper cleanup
        onAnimationComplete();
      }
    }, 2500); // Increased to 2.5 seconds to give more time for fonts to load
    
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
  }, [onAnimationComplete, preloadAssets, preloadFont]);
  
  return (
    <div 
      id="eden-loading-screen"
      className="eden-loading-overlay"
      aria-label="Loading screen"
      aria-live="polite"
      role="status"
    >
      <div className="eden-loading-background"></div>
      
      {/* Main loading text with Megrim font */}
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
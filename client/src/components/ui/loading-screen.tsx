import { memo, useEffect } from "react";

/**
 * Global loading screen component for use with Suspense and LoadingContext
 * Shows a fullscreen loading experience during code-splitting and lazy loading
 * 
 * This component applies additional techniques to ensure it appears above all other UI elements:
 * 1. Uses maximum z-index (999999)
 * 2. Applies CSS isolation to create a new stacking context
 * 3. Prevents any margin/padding affecting overlay position
 * 4. Temporarily disables scrolling while loading is shown
 */
export const LoadingScreen = memo(() => {
  // Disable scrolling while loading screen is active
  useEffect(() => {
    // Store original overflow setting
    const originalOverflow = document.body.style.overflow;
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Restore original overflow on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-background flex items-center justify-center" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        margin: 0,
        padding: 0,
        isolation: 'isolate',
        // Ensure it's above all other elements with a high z-index
        zIndex: 9999999
      }}
      aria-live="polite" // Accessibility improvement
      role="status"
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground/80 animate-pulse">Loading content...</p>
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
import { memo, useEffect, useRef } from "react";
import { usePreloading } from "@/hooks/use-preloading";

// Import the loading screen CSS to ensure it's loaded immediately
import "@/styles/loading-screen.css";

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

    // Immediately force loading the Megrim font to prevent fallback flashes
    preloadFont('Megrim', { 
      priority: 'high',
      fontDisplay: 'swap',
      log: true,
      onLoad: () => console.log("Megrim font loaded successfully"),
      onError: (err: unknown) => console.error("Failed to load Megrim font:", err)
    });

    // Preload other critical assets needed for the loading screen
    preloadAssets([
      // Background images removed
    ]);

    // Reset callback fired state
    callbackFired.current = false;

    // Create a hard timeout that will force-close the loading screen
    // This is crucial to ensure the loading screen never gets stuck
    const forceCloseTimer = setTimeout(() => {
      if (!callbackFired.current && onAnimationComplete) {
        callbackFired.current = true;
        console.log("Loading screen force-closed after minimum duration");

        // Run cleanup before calling completion callback
        document.documentElement.classList.remove('disable-scroll');
        document.body.classList.remove('loading-active');

        // Execute callback last to allow proper cleanup
        onAnimationComplete();
      }
    }, 2500); // Increased duration to see the animation better

    // Comprehensive cleanup on unmount - ensures complete state reset
    return () => {
      // Clear the timeout first
      clearTimeout(forceCloseTimer);

      // Remove all classes
      document.documentElement.classList.remove('disable-scroll');
      document.body.classList.remove('loading-active');

      // Do not forcibly restore scroll on unmount to avoid jumpy transitions

      console.log("[LoadingScreen] Cleanup complete, scroll restored");
    };
  }, [onAnimationComplete, preloadAssets, preloadFont]);

  return (
    <div 
      id="eden-loading-screen"
      className="loading-screen"
      aria-label="Loading screen"
      aria-live="polite"
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '200% 200%',
        animation: 'backgroundShift 4s ease-in-out infinite',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999999,
        overflow: 'hidden'
      }}
    >
      {/* Main loading text with Megrim font and inline animations */}
      <div 
        className="loader"
        style={{
          display: 'flex',
          gap: '0.5rem',
          fontFamily: '"Megrim", cursive',
          fontSize: '3rem',
          fontWeight: 400,
          color: '#ffffff',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          letterSpacing: '0.2em'
        }}
      >
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0s',
          opacity: 0.7
        }}>L</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.1s',
          opacity: 0.7
        }}>O</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.2s',
          opacity: 0.7
        }}>A</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.3s',
          opacity: 0.7
        }}>D</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.4s',
          opacity: 0.7
        }}>I</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.5s',
          opacity: 0.7
        }}>N</span>
        <span style={{ 
          display: 'inline-block', 
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.6s',
          opacity: 0.7
        }}>G</span>
      </div>

      {/* CSS keyframes defined inline to ensure they load */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes letterPulse {
            0%, 100% {
              opacity: 0.7 !important;
              transform: scale(1) !important;
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
            }
            50% {
              opacity: 1 !important;
              transform: scale(1.1) !important;
              text-shadow: 0 0 30px rgba(255, 255, 255, 0.8) !important,
                           0 0 40px rgba(255, 255, 255, 0.6) !important;
            }
          }

          @keyframes backgroundShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @media (max-width: 768px) {
            .loader {
              font-size: 2rem !important;
              gap: 0.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .loader {
              font-size: 1.5rem !important;
              gap: 0.2rem !important;
            }
          }
        `
      }} />
    </div>
  );
});

export default LoadingScreen;
import { Spinner } from './spinner';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-2">
        <Spinner />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

import { memo, useEffect } from "react";

/**
 * Standardized loading screen component for use across the entire application
 * Shows a fullscreen loading experience with letter-by-letter animation
 * 
 * This component applies additional techniques to ensure it appears above all other UI elements:
 * 1. Uses maximum z-index (999999)
 * 2. Applies backdrop blur for a modern effect
 * 3. Uses consistent animation pattern across all loading states
 * 4. Temporarily disables scrolling while loading is shown
 * 5. Includes proper ARIA attributes for accessibility
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
      className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50" 
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
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
      aria-live="polite"
      role="status"
    >
      <div className="loader">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>

      {/* ARIA live region for accessibility */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading content, please wait...
      </div>

      <style>{`
        .loader {
          display: flex;
          gap: 0.5rem;
        }

        .loader span {
          font-size: 22px;
          font-family: 'Space Mono', monospace;
          font-weight: 600;
          animation: blur 2s linear infinite;
          line-height: 20px;
          transition: all 0.5s;
          letter-spacing: 0.2em;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .loader span:nth-child(1) { animation-delay: 0.0s; }
        .loader span:nth-child(2) { animation-delay: 0.2s; }
        .loader span:nth-child(3) { animation-delay: 0.4s; }
        .loader span:nth-child(4) { animation-delay: 0.6s; }
        .loader span:nth-child(5) { animation-delay: 0.8s; }
        .loader span:nth-child(6) { animation-delay: 1.0s; }
        .loader span:nth-child(7) { animation-delay: 1.2s; }

        @keyframes blur {
          0%, 90%, 100% {
            filter: blur(0);
            opacity: 1;
          }
          
          50% {
            filter: blur(5px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
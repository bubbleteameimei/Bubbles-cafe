import { memo, useEffect, useState, createContext, useContext } from "react";

/**
 * Super simplified loading screen and context
 * This handles the loading animation and all loading state in one simple file.
 */

// Create a simple context for loading state
type LoadingContextType = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {},
});

/**
 * React hook for accessing loading state
 */
export function useLoading() {
  return useContext(LoadingContext);
}

/**
 * Loading Provider Component
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => {
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  // Make the loading context available globally for API compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Expose the loading context to window for compatibility
      (window as any).__SIMPLIFIED_LOADING_CONTEXT__ = {
        isLoading,
        showLoading,
        hideLoading
      };
    }
    
    return () => {
      // Clean up on unmount
      if (typeof window !== 'undefined') {
        delete (window as any).__SIMPLIFIED_LOADING_CONTEXT__;
      }
    };
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingScreen />}
    </LoadingContext.Provider>
  );
};

/**
 * Standardized loading screen component
 * Shows a fullscreen loading experience with letter-by-letter animation
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
      className="loading-overlay"
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
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #000000;
          z-index: 9999999;
          isolation: isolate;
        }

        .loader {
          display: flex;
          gap: 0.5rem;
        }

        .loader span {
          display: inline-block;
          font-size: 22px;
          font-family: monospace;
          font-weight: 600;
          line-height: 20px;
          letter-spacing: 0.2em;
          color: white;
          text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.4);
        }

        .loader span:nth-child(1) { animation: pulse 1.5s infinite 0.0s; }
        .loader span:nth-child(2) { animation: pulse 1.5s infinite 0.1s; }
        .loader span:nth-child(3) { animation: pulse 1.5s infinite 0.2s; }
        .loader span:nth-child(4) { animation: pulse 1.5s infinite 0.3s; }
        .loader span:nth-child(5) { animation: pulse 1.5s infinite 0.4s; }
        .loader span:nth-child(6) { animation: pulse 1.5s infinite 0.5s; }
        .loader span:nth-child(7) { animation: pulse 1.5s infinite 0.6s; }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
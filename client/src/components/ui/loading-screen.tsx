import { memo, useEffect, useState } from "react";

export const LoadingScreen = memo(({ timeout = 10000 }: { timeout?: number }) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add a timeout to show a message if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeout);

    // Set a maximum loading time to prevent infinite loading
    const maxTimer = setTimeout(() => {
      setLoading(false);
    }, timeout + 5000);

    // Add a class to hide all elements except the loading screen
    document.body.classList.add('loading-active');
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimer);
      document.body.classList.remove('loading-active');
    };
  }, [timeout]);

  if (!loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Unable to load content</h2>
        <p className="text-muted-foreground mb-4 text-center">
          We're having trouble loading the content. Please try refreshing the page.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
      <div className="loader mb-6">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>

      {showTimeoutMessage && (
        <p className="text-muted-foreground text-sm animate-fade-in max-w-md text-center px-4">
          This is taking longer than expected. Please wait a moment...
        </p>
      )}

      {/* ARIA live region for accessibility */}
      <div className="sr-only" role="status" aria-live="polite">
        {showTimeoutMessage 
          ? "Loading is taking longer than expected. Please wait a moment..."
          : "Loading content, please wait..."
        }
      </div>

      <style>{`
        /* Hide all elements when loading except the loading screen */
        body.loading-active > *:not(.fixed) {
          display: none !important;
        }
        
        .loader {
          display: flex;
          gap: 0.5rem;
        }

        .loader span {
          font-size: 28px; /* Increased size */
          font-family: 'Space Mono', monospace;
          font-weight: 600;
          animation: blur 1.8s linear infinite; /* Slightly faster animation */
          line-height: 20px;
          letter-spacing: 0.2em;
          color: var(--primary);
          transition: color 0.2s ease; /* Smooth transition for color changes */
        }

        .loader span:nth-child(1) { animation-delay: 0.0s; }
        .loader span:nth-child(2) { animation-delay: 0.2s; }
        .loader span:nth-child(3) { animation-delay: 0.4s; }
        .loader span:nth-child(4) { animation-delay: 0.6s; }
        .loader span:nth-child(5) { animation-delay: 0.8s; }
        .loader span:nth-child(6) { animation-delay: 1.0s; }
        .loader span:nth-child(7) { animation-delay: 1.2s; }

        @keyframes blur {
          0%, 80% {
            filter: blur(0);
            opacity: 1;
            transform: translateY(0);
          }
          40% {
            filter: blur(5px);
            opacity: 0.5;
            transform: translateY(-3px);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
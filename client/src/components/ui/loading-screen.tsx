import { memo, useEffect } from "react";

export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  useEffect(() => {
    // Call onAnimationComplete after exactly one full animation cycle (2s)
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999]">
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
          0% {
            filter: blur(0px);
            opacity: 1;
          }
          50% {
            filter: blur(4px);
            opacity: 0.5;
          }
          100% {
            filter: blur(0px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default LoadingScreen;
import { memo } from "react";

export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  // Add minimal callback functionality to ensure loading completes
  // Complete the animation after 2 seconds as requested
  if (onAnimationComplete) {
    setTimeout(onAnimationComplete, 2000);
  }
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-50">
      {/* Import Megrim font from Google Fonts */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Megrim&display=swap');
      </style>
      
      <div className="loader">
        <span className="text-uppercase">L</span>
        <span className="text-uppercase">O</span>
        <span className="text-uppercase">A</span>
        <span className="text-uppercase">D</span>
        <span className="text-uppercase">I</span>
        <span className="text-uppercase">N</span>
        <span className="text-uppercase">G</span>
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

        .text-uppercase {
          text-transform: uppercase;
        }

        .loader span {
          font-size: 24px;
          font-family: 'Megrim', cursive;
          font-weight: 400;
          animation: blur 2s linear infinite;
          line-height: 24px;
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
          0% {
            filter: blur(0px);
            opacity: 1;
          }
          50% {
            filter: blur(6px);
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
import { memo } from "react";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-[2px] z-50 transition-all duration-300">
      <div className="loader p-4 rounded-md bg-background/20">
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
          font-size: 20px;
          font-family: 'Space Mono', monospace, sans-serif;
          font-weight: 600;
          animation: fade 1.6s ease-in-out infinite;
          line-height: 20px;
          transition: all 0.3s;
          letter-spacing: 0.2em;
          color: hsl(var(--foreground));
        }

        .loader span:nth-child(1) { animation-delay: 0.0s; }
        .loader span:nth-child(2) { animation-delay: 0.1s; }
        .loader span:nth-child(3) { animation-delay: 0.2s; }
        .loader span:nth-child(4) { animation-delay: 0.3s; }
        .loader span:nth-child(5) { animation-delay: 0.4s; }
        .loader span:nth-child(6) { animation-delay: 0.5s; }
        .loader span:nth-child(7) { animation-delay: 0.6s; }
        
        @keyframes fade {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default LoadingScreen;
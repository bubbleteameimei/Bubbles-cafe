
import { memo } from "react";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999]" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
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
          position: relative;
          z-index: 10000;
        }

        .loader span {
          font-size: 28px;
          font-family: 'Space Mono', monospace;
          font-weight: 600;
          animation: blur 2s linear infinite;
          line-height: 20px;
          transition: all 0.5s;
          letter-spacing: 0.2em;
          color: #ff0000;
          text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
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
          }

          40% {
            filter: blur(5px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      {/* Loading Text Animation */}
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
}
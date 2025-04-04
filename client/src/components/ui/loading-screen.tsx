import { memo } from "react";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Additional overlay to ensure complete opacity */}
      <div className="absolute inset-0 bg-black opacity-95"></div>
      
      {/* Subtle gradient for visual interest */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-90"></div>
      
      <div className="loading-text relative z-10">
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
        .loading-text {
          display: flex;
          gap: 0.5rem;
        }

        .loading-text span {
          font-size: 22px;
          font-family: 'Space Mono', monospace;
          font-weight: 600;
          animation: blurText 3s linear infinite;
          line-height: 20px;
          transition: all 0.5s;
          letter-spacing: 0.2em;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .loading-text span:nth-child(1) { animation-delay: 0.0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.3s; }
        .loading-text span:nth-child(3) { animation-delay: 0.6s; }
        .loading-text span:nth-child(4) { animation-delay: 0.9s; }
        .loading-text span:nth-child(5) { animation-delay: 1.2s; }
        .loading-text span:nth-child(6) { animation-delay: 1.5s; }
        .loading-text span:nth-child(7) { animation-delay: 1.8s; }

        @keyframes blurText {
          0% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1);
          }
          50% {
            filter: blur(5px);
            opacity: 0.3;
            transform: scale(1.1);
          }
          100% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
});

export default LoadingScreen;
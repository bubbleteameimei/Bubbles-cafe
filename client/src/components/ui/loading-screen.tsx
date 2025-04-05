import { memo } from "react";

export const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
      <div className="absolute inset-0 bg-black opacity-95"></div>
      
      <div className="text-loader relative z-10">
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
        .text-loader {
          display: flex;
          gap: 0.5rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .text-loader span {
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

        .text-loader span:nth-child(1) { animation-delay: 0.0s; }
        .text-loader span:nth-child(2) { animation-delay: 0.2s; }
        .text-loader span:nth-child(3) { animation-delay: 0.4s; }
        .text-loader span:nth-child(4) { animation-delay: 0.6s; }
        .text-loader span:nth-child(5) { animation-delay: 0.8s; }
        .text-loader span:nth-child(6) { animation-delay: 1.0s; }
        .text-loader span:nth-child(7) { animation-delay: 1.2s; }
        
        @keyframes blur {
          0% {
            filter: blur(0px);
            opacity: 1;
          }
          50% {
            filter: blur(5px);
            opacity: 0.3;
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
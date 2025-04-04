import { memo, useEffect, useState } from "react";

// Animation cycle is 4s according to CSS (updated)
// Last letter starts 2.4s into the animation
// We add enough buffer to ensure full cycles + full fade out
const MIN_ANIMATION_DISPLAY_TIME = 4800; // ms - Ensures at least one full animation cycle + complete fade out

export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  const [animationStartTime] = useState(() => Date.now());
  
  useEffect(() => {
    if (!onAnimationComplete) return;
    
    const animationTimer = setTimeout(() => {
      const elapsedTime = Date.now() - animationStartTime;
      
      if (elapsedTime < MIN_ANIMATION_DISPLAY_TIME) {
        // If we haven't displayed for minimum time, wait the remaining time
        const remainingTime = MIN_ANIMATION_DISPLAY_TIME - elapsedTime;
        setTimeout(onAnimationComplete, remainingTime);
      } else {
        // We've already shown the animation long enough
        onAnimationComplete();
      }
    }, 100); // Small initial delay to ensure component is mounted
    
    return () => clearTimeout(animationTimer);
  }, [animationStartTime, onAnimationComplete]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 overflow-hidden">
      {/* Base layer - complete black */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Horror-themed animated background layer */}
      <div className="absolute inset-0 bg-noise"></div>
      
      {/* Deep vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette"></div>
      
      {/* Subtle pulse effect */}
      <div className="absolute inset-0 bg-pulse"></div>
      
      {/* Vertical scanlines for that old horror movie feel */}
      <div className="absolute inset-0 scanlines"></div>
      
      {/* The main loading text with individual letters */}
      <div className="loading-text relative z-10">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>
      
      {/* Subtle horror message that fades in and out beneath main text */}
      <div className="horror-message relative z-10 mt-12">
        Preparing your nightmare...
      </div>

      {/* ARIA live region for accessibility */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading content, please wait...
      </div>

      <style>{`
        /* Loading text styles */
        .loading-text {
          display: flex;
          gap: 0.5rem;
        }

        .loading-text span {
          font-size: 28px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          animation: blurText 4s ease-in-out infinite;
          line-height: 20px;
          transition: all 0.6s;
          letter-spacing: 0.25em;
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          will-change: filter, opacity, transform;
        }

        .loading-text span:nth-child(1) { animation-delay: 0.0s; }
        .loading-text span:nth-child(2) { animation-delay: 0.4s; }
        .loading-text span:nth-child(3) { animation-delay: 0.8s; }
        .loading-text span:nth-child(4) { animation-delay: 1.2s; }
        .loading-text span:nth-child(5) { animation-delay: 1.6s; }
        .loading-text span:nth-child(6) { animation-delay: 2.0s; }
        .loading-text span:nth-child(7) { animation-delay: 2.4s; }

        /* Horror message styles */
        .horror-message {
          font-family: 'Crimson Text', serif;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          animation: fadeInOut 8s ease-in-out infinite;
        }

        /* Horror background animations */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          animation: noiseAnimation 0.5s infinite;
        }

        .bg-radial-vignette {
          background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.9) 70%, rgba(0, 0, 0, 1) 100%);
        }

        .bg-pulse {
          background: transparent;
          animation: pulse 4s ease-in-out infinite;
        }

        .scanlines {
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 51%);
          background-size: 100% 4px;
          opacity: 0.15;
        }

        /* Animation keyframes */
        @keyframes blurText {
          0% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          25% {
            filter: blur(3px);
            opacity: 0.7;
            transform: scale(1.05) translateY(-2px);
          }
          50% {
            filter: blur(7px);
            opacity: 0.2;
            transform: scale(1.2) translateY(-5px);
          }
          75% {
            filter: blur(3px);
            opacity: 0.7;
            transform: scale(1.05) translateY(-2px);
          }
          100% {
            filter: blur(0px);
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: inset 0 0 200px rgba(139, 0, 0, 0); }
          50% { box-shadow: inset 0 0 200px rgba(139, 0, 0, 0.15); }
        }

        @keyframes noiseAnimation {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); }
          30% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          50% { transform: translate(-1px, 1px); }
          60% { transform: translate(1px, -1px); }
          70% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -2px); }
          90% { transform: translate(-1px, 1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
});

export default LoadingScreen;
import { memo, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface PageTransitionLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const PageTransitionLoader = memo(({ isVisible, onComplete }: PageTransitionLoaderProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide after maximum 2 seconds to prevent infinite loading
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className="page-transition-loader">
      {/* Full screen overlay with backdrop blur */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center">
        {/* Loading text with higher z-index - Megrim font preloaded in index.html */}
        <div className="loader relative z-10">
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

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .loader span {
            font-size: 20px;
            letter-spacing: 0.1em;
          }
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .loader span {
            animation: none;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
});

PageTransitionLoader.displayName = 'PageTransitionLoader';

export default PageTransitionLoader;
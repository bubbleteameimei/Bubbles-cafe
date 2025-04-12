import { memo, useEffect, useState } from "react";

export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  // State to determine if image background should be shown (1 out of 20 chance - 5%)
  const [showImageBackground] = useState(() => {
    // Generate random number between 0-19, if 0 then show image (5% chance)
    return Math.floor(Math.random() * 20) < 1;
  });
  
  // Completely disable scrolling while loading screen is active
  useEffect(() => {
    // Save current styles
    const bodyStyles = {
      overflow: document.body.style.overflow,
      height: document.body.style.height,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      bottom: document.body.style.bottom
    };
    
    const htmlStyles = {
      overflow: document.documentElement.style.overflow,
      height: document.documentElement.style.height,
      position: document.documentElement.style.position
    };
    
    // Completely immobilize the body with multiple techniques
    // Technique 1: Fixed position with dimensions
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.width = '100%';
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    
    // Technique 2: Apply to HTML element
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.position = 'relative';
    
    // Technique 3: Temporarily add a specific class
    document.body.classList.add('no-scroll-loading');
    
    console.log("[LoadingScreen] Scroll disabled with multiple techniques");
    
    // Restore original styles when loading is complete
    return () => {
      // Restore body styles
      document.body.style.overflow = bodyStyles.overflow;
      document.body.style.height = bodyStyles.height;
      document.body.style.position = bodyStyles.position;
      document.body.style.width = bodyStyles.width;
      document.body.style.top = bodyStyles.top;
      document.body.style.left = bodyStyles.left;
      document.body.style.right = bodyStyles.right;
      document.body.style.bottom = bodyStyles.bottom;
      
      // Restore HTML styles
      document.documentElement.style.overflow = htmlStyles.overflow;
      document.documentElement.style.height = htmlStyles.height;
      document.documentElement.style.position = htmlStyles.position;
      
      // Remove the temporary class
      document.body.classList.remove('no-scroll-loading');
      
      console.log("[LoadingScreen] Scroll re-enabled");
    };
  }, []);
  
  // Complete the animation after 2 seconds as requested
  useEffect(() => {
    if (onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [onAnimationComplete]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Conditionally show image background or just dark background */}
      {showImageBackground ? (
        // Background image with dark overlay (special 5% chance)
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundImage: `url(/loading-background.jpeg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'fixed', // Ensure fixed position
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
      ) : (
        // Regular black background (95% chance)
        <div 
          className="absolute inset-0 z-0 bg-black backdrop-blur-md"
          style={{
            position: 'fixed', // Ensure fixed position
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        ></div>
      )}
      
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
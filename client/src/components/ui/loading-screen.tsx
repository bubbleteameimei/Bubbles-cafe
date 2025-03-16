import { memo, useEffect } from "react";

export const LoadingScreen = memo(() => {
  // Ensure the viewport is properly filled by locking body overflow
  useEffect(() => {
    // Save the original overflow, height, and position styles
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalPosition = document.body.style.position;
    
    // Apply styles to ensure the loading screen fills the viewport
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Cleanup function to restore original styles
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-[9999] w-[100vw] h-[100vh] overflow-hidden">
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
      
      <div className="loader z-10">
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
        .bg-radial-gradient {
          background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%);
        }
        
        .loader {
          display: flex;
          gap: 0.5rem;
          position: relative;
        }

        .loader span {
          font-size: 28px;
          font-family: 'Space Mono', monospace;
          font-weight: 600;
          animation: flicker 3s linear infinite;
          line-height: 20px;
          transition: all 0.5s;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }

        .loader span:nth-child(1) { animation-delay: 0.0s; }
        .loader span:nth-child(2) { animation-delay: 0.2s; }
        .loader span:nth-child(3) { animation-delay: 0.4s; }
        .loader span:nth-child(4) { animation-delay: 0.6s; }
        .loader span:nth-child(5) { animation-delay: 0.8s; }
        .loader span:nth-child(6) { animation-delay: 1.0s; }
        .loader span:nth-child(7) { animation-delay: 1.2s; }

        @keyframes flicker {
          0%, 80% {
            filter: blur(0);
            opacity: 1;
            transform: translateY(0);
          }
          40% {
            filter: blur(3px);
            opacity: 0.7;
            transform: translateY(-1px);
          }
          45% {
            filter: blur(5px);
            opacity: 0.5;
            transform: translateY(1px);
          }
        }
      `}</style>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";
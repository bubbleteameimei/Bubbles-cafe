
import { memo, useEffect } from "react";

// Styles for the loading animation
const loaderStyles = `
  .loader {
    display: flex;
    gap: 0.5rem;
  }

  .loader span {
    font-size: 32px;
    font-family: 'Space Mono', monospace;
    font-weight: 600;
    animation: blur 2s linear infinite;
    line-height: 28px;
    transition: all 0.5s;
    letter-spacing: 0.2em;
    color: var(--primary);
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
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
`;

// Inject styles into the document head once
const injectStyles = () => {
  if (!document.getElementById('loading-screen-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'loading-screen-styles';
    styleElement.textContent = loaderStyles;
    document.head.appendChild(styleElement);
  }
};

export const LoadingScreen = memo(() => {
  // Prevent scrolling on the body while loading
  useEffect(() => {
    // Inject the styles
    injectStyles();
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen flex flex-col items-center justify-center bg-background z-[999999]" 
      style={{ 
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0, 
        left: 0,
        zIndex: 999999
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
      
      <div className="loader relative z-10">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>

      {/* ARIA live region for accessibility */}
      <div className="sr-only relative z-10" role="status" aria-live="polite">
        Loading content, please wait...
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

import { memo, useEffect, useLayoutEffect } from "react";
import "../../styles/loading-screen.css";

export const LoadingScreen = memo(() => {
  // Force immediate style application with useLayoutEffect for critical styling
  useLayoutEffect(() => {
    // Create and inject a style element with critical loading screen styles
    // This ensures the loading screen is visible immediately, even before CSS files load
    const styleElement = document.createElement("style");
    styleElement.setAttribute("id", "critical-loading-styles");
    styleElement.textContent = `
      .loading-screen {
        position: fixed !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.9) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        z-index: 9999999 !important;
        top: 0 !important;
        left: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        pointer-events: all !important;
        flex-direction: column !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateZ(0) !important;
      }
      body.loading-active {
        overflow: hidden !important;
      }
    `;
    
    // Only append if it doesn't already exist
    if (!document.getElementById("critical-loading-styles")) {
      document.head.appendChild(styleElement);
    }
    
    // Disable scrolling using direct style manipulation for immediate effect
    document.body.style.overflow = 'hidden';
    document.body.classList.add('loading-active');
    
    // Force browser to apply styles immediately
    document.body.offsetHeight; // Trigger reflow
    
    return () => {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.classList.remove('loading-active');
      
      // Keep the critical styles for future use
    };
  }, []);

  // Regular useEffect for non-critical styling and cleanup
  useEffect(() => {
    // Force loading the CSS with high priority
    const linkElement = document.createElement("link");
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", "/src/styles/loading-screen.css");
    linkElement.setAttribute("id", "loading-screen-styles");
    linkElement.setAttribute("precedence", "high");
    
    // Only append if it doesn't already exist
    if (!document.getElementById("loading-screen-styles")) {
      document.head.appendChild(linkElement);
    }

    return () => {
      // Don't remove the styles to ensure they remain available for future loading screens
    };
  }, []);

  return (
    <div 
      className="loading-screen"
      aria-modal="true"
      role="dialog"
      style={{
        // Inline critical styles as a fallback for immediate visibility
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999999,
        flexDirection: 'column',
        margin: 0,
        padding: 0
      }}
    >
      {/* Loading animation with simplified, more reliable styling */}
      <div 
        className="loader" 
        aria-hidden="true"
        style={{
          // Inline styles for critical animation elements
          display: 'flex',
          gap: '0.5rem',
          position: 'absolute',
          zIndex: 10000000,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          whiteSpace: 'nowrap'
        }}
      >
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
    </div>
  );
});

export default LoadingScreen;
import { memo, useEffect } from "react";
import "../../styles/loading-screen.css";

export const LoadingScreen = memo(() => {
  // Ensure styles are loaded and disable scrolling
  useEffect(() => {
    // This ensures the CSS is always loaded and prioritized
    const linkElement = document.createElement("link");
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", "/src/styles/loading-screen.css");
    linkElement.setAttribute("id", "loading-screen-styles");
    
    // Add priority to ensure it loads quickly
    linkElement.setAttribute("precedence", "high");
    
    // Only append if it doesn't already exist
    if (!document.getElementById("loading-screen-styles")) {
      document.head.appendChild(linkElement);
    }

    // Disable scrolling when loading screen is shown
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      // Clean up when component unmounts, but check if it exists first
      const existingLink = document.getElementById("loading-screen-styles");
      if (existingLink && document.head.contains(existingLink)) {
        document.head.removeChild(existingLink);
      }
      
      // Restore original overflow setting
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md z-[999999] w-screen h-screen left-0 top-0 right-0 bottom-0 overflow-hidden"
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100vw',
        height: '100vh',
        margin: '0',
        padding: '0'
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Loading animation */}
      <div className="loader" aria-hidden="true" style={{ position: 'relative' }}>
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
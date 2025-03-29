import { memo, useEffect } from "react";
import "../../styles/loading-screen.css";

export const LoadingScreen = memo(() => {
  // Ensure styles are loaded
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

    return () => {
      // Clean up when component unmounts, but check if it exists first
      const existingLink = document.getElementById("loading-screen-styles");
      if (existingLink && document.head.contains(existingLink)) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-[9999] w-[100vw] h-[100vh] left-0 top-0 right-0 bottom-0 overflow-hidden"
      aria-modal="true"
      role="dialog"
    >
      {/* Loading animation */}
      <div className="loader" aria-hidden="true">
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
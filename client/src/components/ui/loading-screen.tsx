import { memo, useEffect } from "react";
import "../../styles/loading-screen.css";

export const LoadingScreen = memo(() => {
  // Import the styles when the component mounts
  useEffect(() => {
    // This is to ensure the CSS is loaded
    const linkElement = document.createElement("link");
    linkElement.setAttribute("rel", "stylesheet");
    linkElement.setAttribute("type", "text/css");
    linkElement.setAttribute("href", "/src/styles/loading-screen.css");
    document.head.appendChild(linkElement);

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(linkElement);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-[9999] w-screen h-screen">
      <div className="loader">
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
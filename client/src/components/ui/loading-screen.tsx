import { memo, useEffect } from "react";

export const LoadingScreen = memo(() => {
  // Prevent scrolling on the body while loading
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* Create a portal container at the root level for the loading screen */}
      <div 
        className="fixed inset-0 w-full h-full z-[9999]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
        }}
      >
        <div className="flex gap-2 relative z-10">
          {['L','O','A','D','I','N','G'].map((letter, index) => (
            <span 
              key={index}
              style={{
                fontSize: '32px',
                fontFamily: '"Space Mono", monospace',
                fontWeight: 600,
                color: 'white',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                animation: 'loaderBlur 2s linear infinite',
                animationDelay: `${index * 0.2}s`
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* ARIA live region for accessibility */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        {/* Inline styles for animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loaderBlur {
            0%, 80% {
              filter: blur(0);
              opacity: 1;
            }
            40% {
              filter: blur(5px);
              opacity: 0.5;
            }
          }
        `}} />
      </div>
    </>
  );
});

LoadingScreen.displayName = "LoadingScreen";
import { memo, useEffect } from "react";

export const LoadingScreen = memo(() => {
  // Prevent scrolling on the body while loading
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    
    // Hide header and footer
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      document.body.style.overflow = '';
      
      // Restore header and footer visibility
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <>
      {/* Full screen loading overlay */}
      <div 
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
        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
          {['L','O','A','D','I','N','G'].map((letter, index) => (
            <span 
              key={index}
              style={{
                fontSize: '22px',
                fontFamily: '"Space Mono", monospace',
                fontWeight: 600,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                animation: 'loaderBlur 2s linear infinite',
                animationDelay: `${index * 0.2}s`,
                lineHeight: '20px',
                letterSpacing: '0.2em'
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* ARIA live region for accessibility */}
        <div style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }} role="status" aria-live="polite">
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
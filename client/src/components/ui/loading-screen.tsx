import { memo } from "react";

// Presentational loading screen only; no timers or side effects.
// Visibility is controlled by the parent (GlobalLoadingProvider/AppContent).
export const LoadingScreen = memo(({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
  return (
    <div
      id="eden-loading-screen"
      className="loading-screen"
      aria-label="Loading screen"
      aria-live="polite"
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '200% 200%',
        animation: 'backgroundShift 4s ease-in-out infinite',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999999,
        overflow: 'hidden'
      }}
    >
      <div
        className="loader"
        style={{
          display: 'flex',
          gap: '0.5rem',
          fontFamily: '"Megrim", cursive',
          fontSize: '3rem',
          fontWeight: 400,
          color: '#ffffff',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          letterSpacing: '0.2em'
        }}
      >
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0s',
          opacity: 0.7
        }}>L</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.1s',
          opacity: 0.7
        }}>O</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.2s',
          opacity: 0.7
        }}>A</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.3s',
          opacity: 0.7
        }}>D</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.4s',
          opacity: 0.7
        }}>I</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.5s',
          opacity: 0.7
        }}>N</span>
        <span style={{
          display: 'inline-block',
          animation: 'letterPulse 2s ease-in-out infinite',
          animationDelay: '0.6s',
          opacity: 0.7
        }}>G</span>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes letterPulse {
            0%, 100% {
              opacity: 0.7 !important;
              transform: scale(1) !important;
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
            }
            50% {
              opacity: 1 !important;
              transform: scale(1.1) !important;
              text-shadow: 0 0 30px rgba(255, 255, 255, 0.8) !important,
                           0 0 40px rgba(255, 255, 255, 0.6) !important;
            }
          }

          @keyframes backgroundShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @media (max-width: 768px) {
            .loader {
              font-size: 2rem !important;
              gap: 0.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .loader {
              font-size: 1.5rem !important;
              gap: 0.2rem !important;
            }
          }
        `
      }} />
    </div>
  );
});

export default LoadingScreen;
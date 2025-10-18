import { memo } from 'react';

/**
 * Minimal Megrim loading screen component.
 * Keeps animations subtle and removes cursive fallback.
 */
export const LoadingScreen = memo(
  ({ onAnimationComplete }: { onAnimationComplete?: () => void }) => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <div
        className="loading-screen"
        role="status"
        aria-live="polite"
        aria-label="Loading"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999999,
          overflow: 'hidden',
          pointerEvents: 'all',
        }}
        onAnimationEnd={() => {
          try {
            onAnimationComplete?.();
          } catch {}
        }}
      >
        <div
          className="loader"
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            position: 'relative',
            zIndex: 10,
            fontFamily: 'Megrim, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif',
            fontSize: '34px',
            color: '#ffffff',
          }}
        >
          {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 2px',
                opacity: 0.95,
                willChange: 'filter, opacity',
                animation: reduceMotion ? undefined : 'blurText 1.5s linear infinite alternate',
                animationDelay: reduceMotion ? undefined : `${i * 0.2}s`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes blurText {
            0%   { filter: blur(0px);   opacity: 1; }
            100% { filter: blur(1.5px); opacity: 0.86; }
          }

          @media (prefers-reduced-motion: reduce) {
            .loader span {
              animation: none !important;
            }
          }

          @media (max-width: 768px) {
            .loader {
              font-size: 30px !important;
            }
          }

          @media (max-width: 480px) {
            .loader {
              font-size: 28px !important;
            }
          }
        `,
          }}
        />
      </div>
    );
  },
);

export default LoadingScreen;

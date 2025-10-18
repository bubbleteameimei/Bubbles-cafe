import { memo } from 'react';

/**
 * Full Megrim intro loading screen with animated "LOADING" letters.
 * Presentational only (no side effects); parent controls visibility.
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
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background:
            'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
          backgroundSize: '200% 200%',
          animation: reduceMotion ? undefined : 'backgroundShift 4s ease-in-out infinite',
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
        {/* Radial vignette overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* Megrim LOADING text */}
        <div
          className="loader"
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            gap: '0.5rem',
            position: 'relative',
            zIndex: 10,
            fontFamily: '"Megrim", cursive',
            fontSize: '3rem',
            fontWeight: 400,
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((ch, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: 0.9,
                willChange: 'transform, opacity, filter',
                animation: reduceMotion ? undefined : 'blur 2s linear infinite',
                animationDelay: reduceMotion ? undefined : `${i * 0.2}s`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Accessible live region */}
        <div className="sr-only" role="status" aria-live="polite">
          Loading content, please wait...
        </div>

        {/* Inline keyframes to avoid external CSS dependency */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes blur {
            0%   { filter: blur(0px);   opacity: 1;   transform: scale(1); }
            50%  { filter: blur(6px);   opacity: 0.55; transform: scale(1.06); }
            100% { filter: blur(0px);   opacity: 1;   transform: scale(1); }
          }

          @keyframes backgroundShift {
            0%, 100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
          }

          @media (max-width: 768px) {
            .loader {
              font-size: 2rem !important;
              gap: 0.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .loader {
              font-size: 1.6rem !important;
              gap: 0.2rem !important;
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

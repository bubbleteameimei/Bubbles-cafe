import React, { useEffect, useState } from 'react';

/**
 * IntroLoader
 * Shows the Megrim intro loading screen on every app start
 * for a minimum of ~2.6 seconds to complete an animation cycle.
 */
const INTRO_MIN_MS = 2600;

const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), INTRO_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="loading" role="status" aria-live="polite" aria-label="Loading">
      <div className="loader" aria-hidden="false">
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </div>

      {/* Accessible live region for screen readers */}
      <div className="sr-only">Loading content, please wait…</div>

      {/* Inline CSS adapted to our framework without excessive !important flags */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .loading {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 99999999;
          }

          .loader {
            position: absolute;
            top: 0; bottom: 0; left: 0; right: 0;
            margin: auto;
            text-align: center;
            width: 100%;
            height: 100px;
            line-height: 100px;
            font-family: 'Megrim', sans-serif;
            font-size: 34px;
            color: #fff;
          }

          .loader span {
            display: inline-block;
            margin: 0 5px;
            opacity: 0.85;
            transition: transform 0.3s ease, opacity 0.3s ease, filter 0.3s ease;
            will-change: transform, opacity, filter;
            animation: letterPulse 2s ease-in-out infinite;
          }

          .loader span:nth-child(1) { animation-delay: 0s; }
          .loader span:nth-child(2) { animation-delay: 0.1s; }
          .loader span:nth-child(3) { animation-delay: 0.2s; }
          .loader span:nth-child(4) { animation-delay: 0.3s; }
          .loader span:nth-child(5) { animation-delay: 0.4s; }
          .loader span:nth-child(6) { animation-delay: 0.5s; }
          .loader span:nth-child(7) { animation-delay: 0.6s; }

          @keyframes letterPulse {
            0%, 100% {
              opacity: 0.85;
              transform: scale(1);
              filter: blur(0px);
              text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            }
            50% {
              opacity: 1;
              transform: scale(1.08);
              filter: blur(4px);
              text-shadow: 0 0 30px rgba(255, 255, 255, 0.85),
                           0 0 40px rgba(255, 255, 255, 0.65);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .loader span {
              animation: none;
            }
          }

          @media (max-width: 640px) {
            .loader { font-size: 28px; }
          }
        `,
        }}
      />
    </div>
  );
};

export default IntroLoader;
import React, { useEffect, useState } from 'react';

/**
 * IntroLoader
 * Shows the Megrim intro loading screen on every app start
 * for a minimum of 2.6 seconds to complete an animation cycle.
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
      <div className="loading-text" aria-hidden="false">
        <span className="loading-text-words">L</span>
        <span className="loading-text-words">O</span>
        <span className="loading-text-words">A</span>
        <span className="loading-text-words">D</span>
        <span className="loading-text-words">I</span>
        <span className="loading-text-words">N</span>
        <span className="loading-text-words">G</span>
      </div>

      {/* Accessible live region for screen readers */}
      <div className="sr-only">Loading content, please wait…</div>

      {/* Inline CSS translated from the provided SASS/SCSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 99999999;
          }

          .loading-text {
            position: absolute;
            top: 0; bottom: 0; left: 0; right: 0;
            margin: auto;
            text-align: center;
            width: 100%;
            height: 100px;
            line-height: 100px;
          }
          .loading-text .loading-text-words {
            display: inline-block;
            margin: 0 5px;
            color: #fff;
            font-family: 'Megrim', cursive;
            font-size: 34px;
            filter: blur(0px);
            will-change: filter, opacity, transform;
            animation: blur-text 1.5s 0s infinite linear alternate;
          }
          .loading-text .loading-text-words:nth-child(1) { animation-delay: 0s; }
          .loading-text .loading-text-words:nth-child(2) { animation-delay: 0.2s; }
          .loading-text .loading-text-words:nth-child(3) { animation-delay: 0.4s; }
          .loading-text .loading-text-words:nth-child(4) { animation-delay: 0.6s; }
          .loading-text .loading-text-words:nth-child(5) { animation-delay: 0.8s; }
          .loading-text .loading-text-words:nth-child(6) { animation-delay: 1s; }
          .loading-text .loading-text-words:nth-child(7) { animation-delay: 1.2s; }

          @keyframes blur-text {
            0%   { filter: blur(0px);   opacity: 1;   transform: scale(1); }
            100% { filter: blur(4px);   opacity: 0.75; transform: scale(1.06); }
          }

          @media (max-width: 640px) {
            .loading-text .loading-text-words {
              font-size: 28px;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default IntroLoader;
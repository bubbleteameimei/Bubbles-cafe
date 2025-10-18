import React, { useEffect, useState } from 'react';

/**
 * IntroLoader
 * Shows the Megrim intro loading screen on every app start
 * for a minimum of ~2.6 seconds to complete an animation cycle.
 * - Centers text perfectly via flexbox
 * - Attempts to load Megrim via FontFace API; falls back to rendering immediately with sans-serif fallback (no cursive)
 * - Uses staggered blur keyframes (one letter pulsing at a time)
 * - Reduced blur, tighter spacing, medium text (34px)
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

      {/* Inline CSS adapted to our framework: centered, reduced blur, tighter spacing, medium text */}
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
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loader {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Megrim', system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 34px;
            color: #fff;
          }

          .loader span {
            display: inline-block;
            margin: 0 2px;
            opacity: 0.95;
            will-change: filter, opacity;
            animation: blurText 1.5s linear infinite alternate;
          }

          .loader span:nth-child(1) { animation-delay: 0s; }
          .loader span:nth-child(2) { animation-delay: 0.2s; }
          .loader span:nth-child(3) { animation-delay: 0.4s; }
          .loader span:nth-child(4) { animation-delay: 0.6s; }
          .loader span:nth-child(5) { animation-delay: 0.8s; }
          .loader span:nth-child(6) { animation-delay: 1.0s; }
          .loader span:nth-child(7) { animation-delay: 1.2s; }

          /* Blur effect is inside keyframes only; reduced intensity */
          @keyframes blurText {
            0%   { filter: blur(0px);   opacity: 1; }
            100% { filter: blur(1.5px); opacity: 0.86; }
          }

          @media (prefers-reduced-motion: reduce) {
            .loader span {
              animation: none;
            }
          }

          @media (max-width: 640px) {
            .loader { font-size: 30px; }
            .loader span { margin: 0 1.5px; }
          }
        `,
        }}
      />
    </div>
  );
};

export default IntroLoader;
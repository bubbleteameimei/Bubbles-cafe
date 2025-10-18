import React, { useEffect, useState } from 'react';

/**
 * IntroLoader
 * Shows the Megrim intro on every app start.
 * - Perfect centering with flexbox
 * - One-letter-at-a-time staggered animation
 * - 46px, bold, tight spacing, no glow
 * - Always dismisses after a fixed duration so it can't get stuck
 */
const INTRO_DURATION_MS = 3000;

const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState(true);

  // Always dismiss after a fixed duration to prevent getting stuck on slow/failed font loads
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), INTRO_DURATION_MS);
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
            /* Do not block pointer events to avoid feeling broken while scrolling behind */
            pointer-events: none;
          }

          .loader {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Megrim', system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 46px;
            font-weight: 700;
            color: #fff;
          }

          .loader span {
            display: inline-block;
            margin: 0 1px;
            opacity: 1;
            will-change: filter, opacity;
            animation: letterFlash 3.5s linear infinite;
          }

          /* Staggered delays so only one letter animates at a time */
          .loader span:nth-child(1) { animation-delay: 0s;   }
          .loader span:nth-child(2) { animation-delay: 0.5s; }
          .loader span:nth-child(3) { animation-delay: 1.0s; }
          .loader span:nth-child(4) { animation-delay: 1.5s; }
          .loader span:nth-child(5) { animation-delay: 2.0s; }
          .loader span:nth-child(6) { animation-delay: 2.5s; }
          .loader span:nth-child(7) { animation-delay: 3.0s; }

          /* One-letter-at-a-time: brief blur window then return to normal */
          @keyframes letterFlash {
            0%, 7%   { filter: blur(0px);   opacity: 1; }
            8%, 14%  { filter: blur(1px);   opacity: 0.92; }
            15%, 100%{ filter: blur(0px);   opacity: 1; }
          }

          @media (prefers-reduced-motion: reduce) {
            .loader span { animation: none; }
          }

          @media (max-width: 640px) {
            .loader { font-size: 40px; }
            .loader span { margin: 0 1px; }
          }
        `,
        }}
      />
    </div>
  );
};

export default IntroLoader;
import React, { useEffect, useState } from 'react';

/**
 * IntroLoader
 * Shows the Megrim intro on every app start.
 * - No fallback font flash: letters render only after Megrim is loaded
 * - Perfect centering with flexbox
 * - One-letter-at-a-time staggered animation
 * - 46px, bold, tight spacing, no glow
 */
const INTRO_MIN_MS = 3000;

const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [fontReady, setFontReady] = useState(false);

  // Wait for Megrim font before showing letters to avoid any fallback flash
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if ((document as any).fonts && typeof (document as any).fonts.load === 'function') {
          // Try to load Megrim explicitly, then wait for all fonts ready
          try {
            await (document as any).fonts.load('1em Megrim');
          } catch {}
          await (document as any).fonts.ready;
        }
      } catch {}
      if (!cancelled) setFontReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Ensure the intro is visible for at least INTRO_MIN_MS after font is ready
  useEffect(() => {
    if (!fontReady) return;
    const t = setTimeout(() => setVisible(false), INTRO_MIN_MS);
    return () => clearTimeout(t);
  }, [fontReady]);

  if (!visible) return null;

  return (
    <div className="loading" role="status" aria-live="polite" aria-label="Loading">
      {/* Only render letters when Megrim is ready to avoid any font swap flash */}
      {fontReady && (
        <div className="loader" aria-hidden="false">
          <span>L</span>
          <span>O</span>
          <span>A</span>
          <span>D</span>
          <span>I</span>
          <span>N</span>
          <span>G</span>
        </div>
      )}

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
            .loader { font-size: 36px; }
            .loader span { margin: 0 1px; }
          }
        `,
        }}
      />
    </div>
  );
};

export default IntroLoader;
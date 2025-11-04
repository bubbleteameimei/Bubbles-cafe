import React, { useEffect, useState, useRef, useCallback } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Extended character pool for glitching - more unsettling symbols
const GLITCH_CHARS = "!@#$%^&*()_+-={}|[]\\:\"<>?/.,;'~`";

// Website's header fonts (restored)
const HEADER_FONTS = [
  "'Castoro Titling', serif",
  "'Gilda Display', serif",
  "'Newsreader', serif",
  "'Cormorant Garamond', serif"
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [blurActive, setBlurActive] = useState(false);
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

  // Ensure required display fonts are available for the glitch header
  useEffect(() => {
    const id = 'glitch-fonts-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Castoro+Titling&family=Gilda+Display&family=Newsreader:wght@400;600&family=Cormorant+Garamond:wght@400;600&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Cleanup function to clear all timeouts
  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  };

  // Schedule controlled glitch pulses (clamped for readability)
  const scheduleRandomGlitches = useCallback(() => {
    clearAllTimeouts();

    // Normalize intensity to [0, 1.5] to avoid runaway effects
    const i = clamp(typeof intensityFactor === 'number' ? intensityFactor : 1, 0, 10);
    const norm = i / 8; // With intensityFactor=8 -> norm=1

    // Per-character glitch probability (cap so letters remain visible)
    const glitchProb = clamp(0.12 + norm * 0.18, 0.12, 0.3); // max 30%

    // Timing controls (ensure positive delays)
    const minDelay = clamp(220 - norm * 120, 100, 220); // 100..220 ms
    const variance = clamp(380 - norm * 200, 120, 380); // 120..380 ms
    const initialShowMs = clamp(260 - norm * 120, 120, 260); // Initial time to show clean text
    const revertMin = 90;
    const revertVariance = 140;

    const randomGlitchEffect = () => {
      const chars = originalText.current.split('');
      const newChars = [...chars];

      for (let idx = 0; idx < chars.length; idx++) {
        const ch = chars[idx];
        if (ch === ' ') continue;
        if (Math.random() < glitchProb) {
          newChars[idx] = GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length));
        }
      }

      setDisplayText(newChars.join(''));

      // Occasional blur to enhance effect, bounded by intensity
      if (Math.random() < clamp(0.25 + norm * 0.25, 0.25, 0.5)) {
        setBlurActive(true);
        const blurDuration = 40 + Math.random() * 120;
        const blurTimeout = setTimeout(() => setBlurActive(false), blurDuration);
        timeoutIds.current.push(blurTimeout);
      }

      // Always revert to original after a short, bounded interval
      const revertTime = revertMin + Math.random() * revertVariance;
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
      }, revertTime);
      timeoutIds.current.push(revertTimeout);
    };

    const scheduleNext = () => {
      const nextGlitchDelay = minDelay + Math.random() * variance;
      const timeout = setTimeout(() => {
        randomGlitchEffect();
        scheduleNext();
      }, nextGlitchDelay);
      timeoutIds.current.push(timeout);
    };

    // Show clean text briefly before first glitch so the message is legible
    const startTimeout = setTimeout(() => {
      randomGlitchEffect();
      scheduleNext();
    }, initialShowMs);
    timeoutIds.current.push(startTimeout);
  }, [intensityFactor]);

  // Initialize and cleanup glitch effect
  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    scheduleRandomGlitches();

    return () => {
      clearAllTimeouts();
    };
  }, [text, intensityFactor, scheduleRandomGlitches]);

  // Generate randomized blur effect
  const getBlurStyle = () => {
    if (blurActive) {
      const blurAmount = 0.5 + Math.random() * 2.5;
      return `blur(${blurAmount}px)`;
    }
    return 'none';
  };

  // Choose a random header font from the website's fonts
  const getRandomHeaderFont = () => {
    if (!HEADER_FONTS.length) return "'Castoro Titling', serif";
    const randomIndex = Math.floor(Math.random() * HEADER_FONTS.length);
    return HEADER_FONTS[randomIndex];
  };

  return (
    <span
      className={`pure-red-text ${className}`} // Added pure-red-text class for targeted styling
      style={{
        position: 'relative',
        display: 'inline-block',
        color: '#ff0000', // Pure red, no RGB mixing
        fontFamily: getRandomHeaderFont(),
        fontWeight: 'bold',
        letterSpacing: Math.random() < 0.5 ? '0.5px' : '-0.5px',
        filter: getBlurStyle(),
        transition: 'filter 0.08s ease, letter-spacing 0.12s ease',
        textShadow: 'none',
        animation: 'none !important',
        WebkitTextFillColor: '#ff0000',
        WebkitTextStroke: '0 transparent',
      }}
    >
      {displayText}
    </span>
  );
}

export default CreepyTextGlitch;
import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
  duration?: number;     // ms of glitching before settling (ignored if permanent)
  permanent?: boolean;   // keep glitching indefinitely
}

// Aggressive character pool for random replacements
const GLITCH_CHARS =
  "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡§±æøåñÇçÑÆØÅ";

// Header fonts (from the former red glitch)
const HEADER_FONTS = [
  "'Castoro Titling', serif",
  "'Gilda Display', serif",
  "'Newsreader', serif",
  "'Cormorant Garamond', serif",
];

// Ensure required display fonts are available for the glitch header
const ensureFonts = () => {
  const id = 'glitch-fonts-link';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Castoro+Titling&family=Gilda+Display&family=Newsreader:wght@400;600&family=Cormorant+Garamond:wght@400;600&display=swap';
    document.head.appendChild(link);
  }
};

const getRandomHeaderFont = () => {
  if (!HEADER_FONTS.length) return "'Castoro Titling', serif";
  const idx = Math.floor(Math.random() * HEADER_FONTS.length);
  return HEADER_FONTS[idx];
};

// Make a glitched version of the given text at high intensity
const makeGlitchText = (base: string, intensity: number) => {
  const glitchProbability = Math.min(0.95, 0.35 + intensity * 0.1); // up to ~0.95 at intensity 8
  let result = '';
  for (let i = 0; i < base.length; i++) {
    const ch = base[i];
    if (ch === ' ') {
      result += ch;
      continue;
    }
    if (Math.random() < glitchProbability) {
      const randomIndex = Math.floor(Math.random() * GLITCH_CHARS.length);
      result += GLITCH_CHARS[randomIndex];
    } else {
      result += ch;
    }
  }
  // Occasionally insert a random character to heighten chaos
  if (Math.random() < 0.4) {
    const insertChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    const position = Math.floor(Math.random() * Math.max(1, result.length));
    result = result.slice(0, position) + insertChar + result.slice(position);
  }
  return result;
};

export function CreepyTextGlitch({
  text,
  className = '',
  intensityFactor = 8,
  duration = 2000,
  permanent = false,
}: CreepyTextGlitchProps) {
  const originalText = useRef(text);
  const [displayText, setDisplayText] = useState(text);
  const [glitchActive, setGlitchActive] = useState(false);
  const timeouts = useRef<number[]>([]);

  // Clear all scheduled timers
  const clearAll = () => {
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
  };

  useEffect(() => {
    try {
      ensureFonts();
    } catch {}
  }, []);

  useEffect(() => {
    clearAll();
    originalText.current = text;
    setDisplayText(text);

    const start = Date.now();

    const schedulePulse = () => {
      // If duration ended and not permanent, settle on original text
      if (!permanent && Date.now() - start >= duration) {
        setDisplayText(originalText.current);
        setGlitchActive(false);
        return;
      }

      // Glitch frame: aggressive corruption with blur/jitter
      const glitched = makeGlitchText(originalText.current, intensityFactor);
      setDisplayText(glitched);
      setGlitchActive(true);

      // Hold the glitch briefly (fast, unsettling)
      const glitchHold = 50 + Math.random() * 110; // ~50–160ms
      const revertId = window.setTimeout(() => {
        // Clean frame: show original text to maintain legibility and fear factor
        setDisplayText(originalText.current);
        setGlitchActive(false);

        // Hold the clean frame, then schedule the next pulse
        const cleanHold = 120 + Math.random() * 180; // ~120–300ms
        const nextId = window.setTimeout(schedulePulse, cleanHold);
        timeouts.current.push(nextId);
      }, glitchHold);

      timeouts.current.push(revertId);
    };

    // Kick off pulses
    const initialId = window.setTimeout(schedulePulse, 30);
    timeouts.current.push(initialId);

    return clearAll;
  }, [text, intensityFactor, duration, permanent]);

  // Style: keep former pure-red color and header fonts, but apply blur/jitter only during glitch frames
  const letterSpacing = glitchActive ? `${(Math.random() * 0.9 - 0.2).toFixed(2)}px` : 'normal';
  const skewX = (Math.random() * 1.2 - 0.6).toFixed(2);
  const skewY = (Math.random() * 1.2 - 0.6).toFixed(2);
  const translateX = (Math.random() * 1.4 - 0.7).toFixed(2);
  const translateY = (Math.random() * 1.4 - 0.7).toFixed(2);

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        color: '#ff0000',
        fontFamily: getRandomHeaderFont(),
        fontWeight: 'bold',
        letterSpacing,
        textShadow: glitchActive
          ? '0 0 6px rgba(255,0,0,0.9), 0 0 12px rgba(255,0,0,0.6)'
          : 'none',
        filter: glitchActive ? 'blur(1px)' : 'none',
        transform: glitchActive
          ? `skew(${skewX}deg, ${skewY}deg) translate(${translateX}px, ${translateY}px)`
          : 'none',
        transition: 'text-shadow 0.12s ease, filter 0.1s ease, transform 0.1s ease, letter-spacing 0.12s ease',
      }}
    >
      {displayText}
    </span>
  );
}

export default CreepyTextGlitch;
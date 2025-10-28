import React, { useEffect, useState, useRef, useCallback } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

const GLITCH_CHARS = "!@#$%^&*()_+-={}|[]\\:\"<>?/.,;'~`";

const HEADER_FONTS = [
  "'Castoro Titling', serif",
  "'Gilda Display', serif",
  "'Newsreader', serif",
  "'Cormorant Garamond', serif",
];

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [blurActive, setBlurActive] = useState(false);
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);

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

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  };

  const scheduleRandomGlitches = useCallback(() => {
    clearAllTimeouts();

    const safeIntensity = Math.max(0, Math.min(intensityFactor ?? 1, 3));
    const perCharGlitchChance = Math.min(0.25, 0.08 * safeIntensity);

    const randomGlitchEffect = () => {
      const chars = originalText.current.split('');
      const newChars = chars.map((ch) => {
        if (ch === ' ') return ' ';
        return Math.random() < perCharGlitchChance
          ? GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length))
          : ch;
      });

      setDisplayText(newChars.join(''));

      if (Math.random() < 0.3 * safeIntensity) {
        setBlurActive(true);
        const blurDuration = 60 + Math.random() * 120;
        const blurTimeout = setTimeout(() => setBlurActive(false), blurDuration);
        timeoutIds.current.push(blurTimeout);
      }

      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
      }, 120 + Math.random() * 160);
      timeoutIds.current.push(revertTimeout);
    };

    const scheduleNext = () => {
      const maxDelay = 180 - 30 * safeIntensity;
      const minDelay = 60;
      const nextGlitchDelay = minDelay + Math.random() * Math.max(60, maxDelay);

      const timeout = setTimeout(() => {
        randomGlitchEffect();
        scheduleNext();
      }, nextGlitchDelay);

      timeoutIds.current.push(timeout);
    };

    scheduleNext();
  }, [intensityFactor]);

  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    scheduleRandomGlitches();
    return () => clearAllTimeouts();
  }, [text, scheduleRandomGlitches]);

  const getBlurStyle = () => {
    if (blurActive) {
      const blurAmount = 0.5 + Math.random() * 1.0;
      return `blur(${blurAmount}px)`;
    }
    return 'none';
  };

  const getRandomHeaderFont = () => {
    if (!HEADER_FONTS.length) return "'Castoro Titling', serif";
    const randomIndex = Math.floor(Math.random() * HEADER_FONTS.length);
    return HEADER_FONTS[randomIndex];
  };

  const letterSpacingJitter = `${(Math.random() * 0.2 - 0.1).toFixed(2)}px`;

  return (
    <span
      className={`pure-red-text ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        color: '#ff0000',
        fontFamily: getRandomHeaderFont(),
        fontWeight: 'bold',
        letterSpacing: letterSpacingJitter,
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
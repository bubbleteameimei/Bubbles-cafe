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

    const safeIntensity = Math.max(1, Math.min(intensityFactor ?? 1, 8));
    const perCharGlitchChance = Math.min(0.95, 0.12 * safeIntensity);

    const cycle = () => {
      // Glitch frame: heavily corrupt characters
      const chars = originalText.current.split('');
      const newChars = chars.map((ch) =>
        ch === ' '
          ? ' '
          : Math.random() < perCharGlitchChance
              ? GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length))
              : ch
      );
      setDisplayText(newChars.join(''));
      setBlurActive(true);

      // Short-lived glitch, then guaranteed revert for a clean frame
      const glitchDuration = 50 + Math.random() * 80; // ~50–130ms
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setBlurActive(false);
        // Keep the clean frame visible before the next glitch
        const cleanDuration = 120 + Math.random() * 160; // ~120–280ms
        const nextTimeout = setTimeout(() => {
          cycle();
        }, cleanDuration);
        timeoutIds.current.push(nextTimeout);
      }, glitchDuration);

      timeoutIds.current.push(revertTimeout);
    };

    cycle();
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

  const letterSpacingJitter = `${(Math.random() * 0.8 - 0.4).toFixed(2)}px`;

  const getJitterTransform = () => {
    const x = (Math.random() * 1.2 - 0.6).toFixed(2);
    const y = (Math.random() * 1.2 - 0.6).toFixed(2);
    return `translate(${x}px, ${y}px)`;
  };

  const isGlitched = displayText !== originalText.current;

  return (
    <span
      className={`pure-red-text ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        color: '#ff0000',
        fontFamily: getRandomHeaderFont(),
        fontWeight: 'bold',
        letterSpacing: isGlitched ? letterSpacingJitter : '0px',
        filter: getBlurStyle(),
        transform: isGlitched ? getJitterTransform() : 'none',
        transition: 'filter 0.06s ease, letter-spacing 0.1s ease, transform 0.08s ease',
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
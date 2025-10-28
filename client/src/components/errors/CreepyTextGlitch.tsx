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

    const safeIntensity = Math.max(0, Math.min(intensityFactor ?? 1, 8));
    const perCharGlitchChance = Math.min(0.85, 0.12 * safeIntensity);

    const randomGlitchEffect = () => {
      const chars = originalText.current.split('');
      const newChars = chars.map((ch) => {
        if (ch === ' ') return ' ';
        return Math.random() < perCharGlitchChance
          ? GLITCH_CHARS.charAt(Math.floor(Math.random() * GLITCH_CHARS.length))
          : ch;
      });

      setDisplayText(newChars.join(''));

      if (Math.random() < 0.6) {
        setBlurActive(true);
        const blurDuration = 80 + Math.random() * 140;
        const blurTimeout = setTimeout(() => setBlurActive(false), blurDuration);
        timeoutIds.current.push(blurTimeout);
      }

      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
      }, 90 + Math.random() * 140);
      timeoutIds.current.push(revertTimeout);
    };

    const scheduleNext = () => {
      const minDelay = 25;
      const maxDelay = 50;
      const nextGlitchDelay = minDelay + Math.random() * maxDelay;

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

  const letterSpacingJitter = `${(Math.random() * 0.8 - 0.4).toFixed(2)}px`;

  const getJitterTransform = () => {
    const x = (Math.random() * 1.2 - 0.6).toFixed(2);
    const y = (Math.random() * 1.2 - 0.6).toFixed(2);
    return `translate(${x}px, ${y}px)`;
  };

  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <span
        style={{
          color: '#ff0000',
          fontFamily: getRandomHeaderFont(),
          fontWeight: 'bold',
          letterSpacing: '0px',
          textShadow: 'none',
          WebkitTextFillColor: '#ff0000',
          WebkitTextStroke: '0 transparent',
        }}
      >
        {originalText.current}
      </span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          pointerEvents: 'none',
          color: '#ff0000',
          fontFamily: getRandomHeaderFont(),
          fontWeight: 'bold',
          letterSpacing: letterSpacingJitter,
          filter: getBlurStyle(),
          transform: getJitterTransform(),
          transition: 'filter 0.06s ease, letter-spacing 0.1s ease, transform 0.08s ease',
          textShadow: 'none',
          WebkitTextFillColor: '#ff0000',
          WebkitTextStroke: '0 transparent',
        }}
      >
        {displayText}
      </span>
    </span>
  );
}

export default CreepyTextGlitch;
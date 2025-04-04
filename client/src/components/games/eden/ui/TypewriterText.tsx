/**
 * Typewriter Text Component
 * 
 * This component displays text with a typewriter effect, character by character.
 * The speed and appearance can be affected by sanity and corruption levels.
 */
import React, { useState, useEffect, useRef } from 'react';
import { TypewriterTextProps } from '../types';
import '../styles/typewriter.css';
import { corruptText } from '../utils/gameUtils';

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  className = '',
  sanity = 100,
  corruption = 0
}) => {
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const characterIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Apply sanity effects to classes
  const getSanityClass = () => {
    if (sanity < 30) return 'eden-typewriter-very-low-sanity';
    if (sanity < 60) return 'eden-typewriter-low-sanity';
    return '';
  };

  // Apply corruption effects to classes
  const getCorruptionClass = () => {
    if (corruption > 70) return 'eden-typewriter-highly-corrupted';
    if (corruption > 40) return 'eden-typewriter-corrupted';
    return '';
  };

  // Adjust speed based on sanity
  const getAdjustedSpeed = () => {
    // Lower sanity = more erratic typing (sometimes faster, sometimes slower)
    if (sanity < 30) {
      return speed * (0.5 + Math.random());
    }
    if (sanity < 60) {
      return speed * (0.75 + Math.random() * 0.5);
    }
    return speed;
  };

  // Apply corruption to text
  const getProcessedText = () => {
    if (corruption > 70) {
      return corruptText(text, 0.3);
    }
    if (corruption > 40) {
      return corruptText(text, 0.1);
    }
    return text;
  };

  // Effect for typewriter animation
  useEffect(() => {
    const processedText = getProcessedText();
    characterIndexRef.current = 0;
    setDisplayedText([]);
    setIsDone(false);
    
    const typeNextChar = () => {
      if (characterIndexRef.current < processedText.length) {
        setDisplayedText(prev => [...prev, processedText[characterIndexRef.current]]);
        characterIndexRef.current++;
        
        // Schedule next character with adjusted speed
        timerRef.current = setTimeout(typeNextChar, getAdjustedSpeed());
      } else {
        setIsDone(true);
        if (onComplete) onComplete();
      }
    };
    
    // Start the typewriter effect
    timerRef.current = setTimeout(typeNextChar, getAdjustedSpeed());
    
    // Cleanup timer on unmount or text change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed, onComplete, sanity, corruption]);

  // Combine all the classes
  const typewriterClass = `eden-typewriter-container ${getSanityClass()} ${getCorruptionClass()} ${className} ${isDone ? 'eden-typewriter-done' : ''}`;

  return (
    <div className={typewriterClass}>
      {displayedText.map((char, index) => (
        <span 
          key={index} 
          className="eden-typewriter-char" 
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          {char}
        </span>
      ))}
      <span className="eden-typewriter-cursor"></span>
    </div>
  );
};

export default TypewriterText;
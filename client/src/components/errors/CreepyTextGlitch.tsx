import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Character pool for random replacements - added more disturbing characters and symbols
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡§±æøåñÇçÑÆØÅ₩₸₴₽₱₦₭₲₺₼₢₣₤₧₥₮₯₫₡₠₪₨№℗®©™";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [displayStyle, setDisplayStyle] = useState<React.CSSProperties>({});
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  
  // Cleanup function to clear all timeouts
  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  };
  
  // Initialize and cleanup glitch effect
  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    scheduleRandomGlitches();
    
    return () => {
      clearAllTimeouts();
    };
  }, [text]);
  
  // Schedule random glitches throughout the text
  const scheduleRandomGlitches = () => {
    clearAllTimeouts();
    
    // Convert text to array for easier manipulation
    const textArray = originalText.current.split('');
    
    // Intensified glitch effect - multiple characters at once
    const intensiveGlitch = () => {
      // Clone the current text
      const newTextArray = [...textArray];
      
      // Number of characters to glitch - scales with intensity factor
      const baseGlitchCount = 2 + Math.floor(Math.random() * 3);
      const glitchCount = Math.min(
        Math.floor(baseGlitchCount * intensityFactor),
        Math.floor(textArray.length * 0.6) // Cap at 60% of text length
      );
      const positions: number[] = [];
      
      // Select random positions to glitch
      for (let i = 0; i < glitchCount; i++) {
        let pos;
        do {
          pos = Math.floor(Math.random() * textArray.length);
        } while (
          newTextArray[pos] === ' ' || 
          positions.includes(pos)
        );
        
        positions.push(pos);
        
        // Get random replacement character
        const randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
        
        newTextArray[pos] = randomChar;
      }
      
      // Apply more intense style variations - more disturbing effects
      const newStyle: React.CSSProperties = {};
      
      // Much more aggressive visual effects
      if (Math.random() < 0.4 * intensityFactor) {
        newStyle.filter = `blur(${0.3 + Math.random() * 0.8 * intensityFactor}px)`;
      }
      
      if (Math.random() < 0.4 * intensityFactor) {
        newStyle.transform = `skew(${(Math.random() - 0.5) * 4 * intensityFactor}deg)`;
      }
      
      // Add text shadow for a creepy glow effect
      if (Math.random() < 0.5 * intensityFactor) {
        const color = Math.random() < 0.5 ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.9)';
        newStyle.textShadow = `0 0 ${2 + Math.random() * 5}px ${color}`;
      }
      
      // Occasionally invert or distort colors
      if (Math.random() < 0.3 * intensityFactor) {
        newStyle.filter = (newStyle.filter || '') + ` contrast(${150 + Math.random() * 150}%) invert(${Math.random() * 30}%)`;
      }
      
      // Set the glitched text and style
      setDisplayText(newTextArray.join(''));
      setDisplayStyle(newStyle);
      
      // Schedule revert after a brief moment - more intense = faster changes
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setDisplayStyle({});
      }, Math.max(30, 80 + Math.random() * 170 / intensityFactor)); // Faster reversion with higher intensity
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Function to glitch a single character at a random position
    const glitchRandomCharacter = () => {
      // Pick a random position in the text
      const pos = Math.floor(Math.random() * textArray.length);
      
      // Skip spaces
      if (textArray[pos] === ' ') {
        return;
      }
      
      // Save original character
      const originalChar = textArray[pos];
      
      // Replace with random character
      const randomChar = GLITCH_CHARS.charAt(
        Math.floor(Math.random() * GLITCH_CHARS.length)
      );
      
      // Update the text with the glitched character
      const newTextArray = [...textArray];
      newTextArray[pos] = randomChar;
      setDisplayText(newTextArray.join(''));
      
      // Schedule revert back to original character after a brief moment
      const revertTimeout = setTimeout(() => {
        const revertTextArray = [...newTextArray];
        revertTextArray[pos] = originalChar;
        setDisplayText(revertTextArray.join(''));
      }, Math.max(30, 80 + Math.random() * 120 / intensityFactor)); // Faster reversion with higher intensity
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Schedule more frequent and chaotic glitches
    const scheduleNext = () => {
      // Much shorter delays between glitches for a frantic effect
      const nextGlitchDelay = Math.max(5, (30 + Math.random() * 350) / intensityFactor);
      
      const timeout = setTimeout(() => {
        // Much higher chance of intensive glitch for a more disturbing effect
        const intensiveGlitchProbability = Math.min(0.6 * intensityFactor, 0.9);
        
        // Occasional "seizure" of multiple rapid glitches in sequence
        if (Math.random() < 0.15 * intensityFactor) {
          // Create a rapid sequence of 3-7 glitches
          const burstCount = 3 + Math.floor(Math.random() * 4);
          for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
              intensiveGlitch();
            }, i * 60); // Very quick succession
          }
        } else if (Math.random() < intensiveGlitchProbability) {
          intensiveGlitch();
        } else {
          glitchRandomCharacter();
        }
        
        scheduleNext(); // Continue the cycle
      }, nextGlitchDelay);
      
      timeoutIds.current.push(timeout);
    };
    
    // Start the cycle
    scheduleNext();
  };
  
  return (
    <span className={className} style={displayStyle}>{displayText}</span>
  );
}

export default CreepyTextGlitch;
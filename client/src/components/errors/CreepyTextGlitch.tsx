import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Expanded character pool for even more disturbing glitches
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡§±æøåñÇçÑÆØÅ₩₸₴₽₱₦₭₲₺₼₢₣₤₧₥₮₯₫₡₠₪₨№℗®©™☠️⚡⚪⚫⛔⛧⚒⚰️⚱️⛓️Ø∞⊗⊙⌘⎊⏧⍾⎌";

// Special glitch characters that will appear during extreme glitches
const EXTREME_GLITCH_CHARS = "☠️⚰️⛧⛓️Ø∞⊗⚫⛔";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [displayStyle, setDisplayStyle] = useState<React.CSSProperties>({});
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const isReverting = useRef(false);
  
  // Cleanup function to clear all timeouts
  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
  };
  
  // Initialize and cleanup glitch effect
  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    isReverting.current = false;
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
    
    // Extreme glitch effect - distort significant portions of text with creepier effects
    const extremeGlitch = () => {
      // Clone the current text
      const newTextArray = [...textArray];
      
      // More aggressive character replacements for extreme glitches
      const glitchCount = Math.min(
        Math.floor((3 + Math.random() * 4) * intensityFactor),
        Math.floor(textArray.length * 0.8) // Allow up to 80% of text to be glitched in extreme cases
      );
      
      const positions: number[] = [];
      
      // Select random positions to glitch with preference for consecutive characters
      let lastPos = -2; // Initialize to -2 to allow first character to be potentially selected
      for (let i = 0; i < glitchCount; i++) {
        let pos;
        // 70% chance to glitch characters near each other for more disturbing effect
        if (Math.random() < 0.7 && lastPos >= 0 && lastPos < textArray.length - 1) {
          pos = lastPos + 1;
        } else {
          do {
            pos = Math.floor(Math.random() * textArray.length);
          } while (
            newTextArray[pos] === ' ' || 
            positions.includes(pos)
          );
        }
        
        positions.push(pos);
        lastPos = pos;
        
        // Higher chance of using extreme glitch characters
        const useExtremeChar = Math.random() < 0.4 * intensityFactor;
        const charSet = useExtremeChar ? EXTREME_GLITCH_CHARS : GLITCH_CHARS;
        
        // Get random replacement character
        const randomChar = charSet.charAt(
          Math.floor(Math.random() * charSet.length)
        );
        
        newTextArray[pos] = randomChar;
      }
      
      // Apply terrifying visual distortions
      const newStyle: React.CSSProperties = {
        transition: `all ${Math.min(0.1, 0.05 * intensityFactor)}s cubic-bezier(0.175, 0.885, 0.32, 1.275)`
      };
      
      // Layer multiple distortion effects together for maximum impact
      // Blur effect
      if (Math.random() < 0.6 * intensityFactor) {
        newStyle.filter = `blur(${0.3 + Math.random() * 1.2 * intensityFactor}px)`;
      }
      
      // Text skewing/distortion
      if (Math.random() < 0.7 * intensityFactor) {
        newStyle.transform = `skew(${(Math.random() - 0.5) * 8 * intensityFactor}deg)`;
      }
      
      // Apply multiple text shadows for a haunting effect
      if (Math.random() < 0.8 * intensityFactor) {
        const shadowCount = 1 + Math.floor(Math.random() * 3 * intensityFactor);
        let shadows = [];
        
        for (let i = 0; i < shadowCount; i++) {
          const xOffset = (Math.random() - 0.5) * 10 * intensityFactor;
          const yOffset = (Math.random() - 0.5) * 10 * intensityFactor;
          const blurRadius = 2 + Math.random() * 8 * intensityFactor;
          
          // Generate unsettling colors
          let color;
          if (Math.random() < 0.7) {
            // More emphasis on reds for horror effect
            color = `rgba(${180 + Math.floor(Math.random() * 75)}, ${Math.floor(Math.random() * 30)}, ${Math.floor(Math.random() * 30)}, ${0.7 + Math.random() * 0.3})`;
          } else {
            // Sometimes use deep shadow blacks
            color = `rgba(0, 0, 0, ${0.8 + Math.random() * 0.2})`;
          }
          
          shadows.push(`${xOffset}px ${yOffset}px ${blurRadius}px ${color}`);
        }
        
        newStyle.textShadow = shadows.join(', ');
      }
      
      // Color inversion and distortion
      if (Math.random() < 0.5 * intensityFactor) {
        newStyle.filter = (newStyle.filter || '') + 
          ` contrast(${150 + Math.random() * 200}%) ` + 
          `hue-rotate(${Math.floor(Math.random() * 60)}deg) ` +
          `invert(${Math.min(100, Math.random() * 40 * intensityFactor)}%)`;
      }
      
      // Apply letter spacing distortion
      if (Math.random() < 0.4 * intensityFactor) {
        // Letter spacing that varies between squeezed and expanded
        const spacing = (Math.random() - 0.5) * 0.5 * intensityFactor;
        newStyle.letterSpacing = `${spacing}em`;
      }
      
      // Occasionally apply a vertical shift
      if (Math.random() < 0.3 * intensityFactor) {
        const shift = (Math.random() - 0.5) * 0.5 * intensityFactor;
        newStyle.transform = (newStyle.transform || '') + ` translateY(${shift}em)`;
      }
      
      // Set the glitched text and style
      setDisplayText(newTextArray.join(''));
      setDisplayStyle(newStyle);
      
      // More rapid transitions between states for higher intensity
      const revertDelay = Math.max(20, 60 + Math.random() * 120 / intensityFactor);
      
      isReverting.current = true;
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setDisplayStyle({});
        isReverting.current = false;
      }, revertDelay);
      
      timeoutIds.current.push(revertTimeout);
    };
    
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
      const newStyle: React.CSSProperties = {
        transition: `all ${Math.min(0.15, 0.1 * intensityFactor)}s ease-out`
      };
      
      // Much more aggressive visual effects
      if (Math.random() < 0.4 * intensityFactor) {
        newStyle.filter = `blur(${0.3 + Math.random() * 0.8 * intensityFactor}px)`;
      }
      
      if (Math.random() < 0.4 * intensityFactor) {
        newStyle.transform = `skew(${(Math.random() - 0.5) * 4 * intensityFactor}deg)`;
      }
      
      // Add text shadow for a creepy glow effect
      if (Math.random() < 0.5 * intensityFactor) {
        const useRedShadow = Math.random() < 0.8; // Higher chance of red for horror feel
        const color = useRedShadow 
          ? `rgba(${180 + Math.floor(Math.random() * 75)}, ${Math.floor(Math.random() * 40)}, ${Math.floor(Math.random() * 40)}, 0.85)`
          : 'rgba(0,0,0,0.9)';
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
      // Extreme intensity factors can get very chaotic
      const nextGlitchDelay = Math.max(5, (30 + Math.random() * 350) / intensityFactor);
      
      const timeout = setTimeout(() => {
        // Skip this cycle if we're currently reverting to avoid too much chaos
        if (isReverting.current) {
          scheduleNext();
          return;
        }
        
        // Probabilities adjusted for more extreme effects with higher intensity factors
        const extremeGlitchProbability = Math.min(0.2 * intensityFactor, 0.4); // Cap at 40%
        const intensiveGlitchProbability = Math.min(0.6 * intensityFactor, 0.8); // Cap at 80%
        
        // Chance for extreme glitch - reserved for high intensity factors
        if (intensityFactor >= 2.5 && Math.random() < extremeGlitchProbability) {
          extremeGlitch();
        }
        // Occasional "seizure" of multiple rapid glitches in sequence
        else if (Math.random() < 0.15 * intensityFactor) {
          // Create a rapid sequence of glitches
          const burstCount = 3 + Math.floor(Math.random() * 4 * Math.min(intensityFactor, 2));
          for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
              if (Math.random() < 0.3 && intensityFactor >= 2) {
                extremeGlitch();
              } else {
                intensiveGlitch();
              }
            }, i * (70 - Math.min(40, 10 * intensityFactor))); // Faster succession with higher intensity
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
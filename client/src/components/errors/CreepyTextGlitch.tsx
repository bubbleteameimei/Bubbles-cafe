import React, { useEffect, useState, useRef } from 'react';

interface CreepyTextGlitchProps {
  text: string;
  className?: string;
  intensityFactor?: number;
}

// Extended disturbing character pool for even creepier glitches
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ΨΔΩθӜӬӪӒӘƷƩƟƔҘҖԀԄᐁᐌᑕᕉᕋᕆᕲᕤᕵᑌᑎᕠᙦᙨ̸̡̺̤̦̖̭͉̪̤̱̬̼̥̪̳͚̻̫̬̱̙̮̤ͭ̿͒̀̏̏ͩ͆͊͐ͭ̾͛̚̚ͅͅЖЂҨҪѮѰѱѯҖҘҢҮҰ҂҈҉⸸";

// Creepy vertical line characters for splitting text
const VERTICAL_CUT_CHARS = "│┃┆┇┊┋╎╏║|⦙⁞┋┊╽╿╏┇┋";

// Reversed and inverted characters for more disturbing effect
const REVERSED_TEXT_POOL = "zʎxʍʌnʇsɹbdouɯʅʞɾᴉɥƃɟǝpɔqɐZʎXʍʌՈ┴SɹQԀONWꓶꓘſIHפℲƎpƆq∀";

export function CreepyTextGlitch({ text, className = "", intensityFactor = 1 }: CreepyTextGlitchProps) {
  const [displayText, setDisplayText] = useState(text);
  const [displayStyle, setDisplayStyle] = useState<React.CSSProperties>({});
  const originalText = useRef(text);
  const timeoutIds = useRef<NodeJS.Timeout[]>([]);
  const animationFrameIds = useRef<number[]>([]);
  
  // Cleanup function to clear all timeouts and animation frames
  const clearAllTimeouts = () => {
    timeoutIds.current.forEach(id => clearTimeout(id));
    timeoutIds.current = [];
    
    animationFrameIds.current.forEach(id => cancelAnimationFrame(id));
    animationFrameIds.current = [];
  };
  
  // Initialize and cleanup glitch effect
  useEffect(() => {
    originalText.current = text;
    setDisplayText(text);
    scheduleGlitches();
    
    return () => {
      clearAllTimeouts();
    };
  }, [text]);
  
  // Schedule glitches with increased intensity
  const scheduleGlitches = () => {
    clearAllTimeouts();
    
    // Convert text to array for easier manipulation
    const textArray = originalText.current.split('');
    
    // Single character glitch effect - much more disturbing now
    const glitchSingleCharacter = () => {
      // Pick a random position in the text that isn't a space
      let pos;
      do {
        pos = Math.floor(Math.random() * textArray.length);
      } while (textArray[pos] === ' ');
      
      // Save original character
      const originalChar = textArray[pos];
      
      // Apply more aggressive glitch type based on increased intensity
      const glitchType = Math.random() * (intensityFactor * 2); // Doubled effect multiplier
      
      let randomChar;
      if (glitchType > 3) {
        // For higher intensity, use more extreme distorted characters
        randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
      } else if (glitchType > 2) {
        // Use reversed characters for medium intensity
        randomChar = REVERSED_TEXT_POOL.charAt(
          Math.floor(Math.random() * REVERSED_TEXT_POOL.length)
        );
      } else if (glitchType > 1) {
        // Vertical line cuts for low intensity
        randomChar = VERTICAL_CUT_CHARS.charAt(
          Math.floor(Math.random() * VERTICAL_CUT_CHARS.length)
        );
      } else {
        // Random letter shift (slightly offset character)
        const charCode = originalChar.charCodeAt(0);
        randomChar = String.fromCharCode(charCode + (Math.random() > 0.5 ? 1 : -1));
      }
      
      // Update the text with the glitched character
      const newTextArray = [...textArray];
      newTextArray[pos] = randomChar;
      setDisplayText(newTextArray.join(''));
      
      // Apply style variations for even creepier effect
      const newStyle: React.CSSProperties = {};
      
      // More aggressive text shadow for horror feel based on intensity
      if (Math.random() < 0.7 * intensityFactor) { // Increased probability
        // More dramatic reds for horror feel - brighter, more noticeable
        const shadowColor = `rgba(${220 + Math.floor(Math.random() * 35)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)}, 0.9)`;
        newStyle.textShadow = `0 0 ${2 + Math.random() * 5 * intensityFactor}px ${shadowColor}`;
        
        // More frequent and dramatic transform effects
        if (Math.random() < 0.3 * intensityFactor) {
          // More extreme skew for a truly distorted feel
          const skewAmount = (Math.random() - 0.5) * 5; // Increased skew amount
          newStyle.transform = `skew(${skewAmount}deg)`;
          
          // Occasionally add more dramatic letter spacing
          if (Math.random() < 0.4) {
            newStyle.letterSpacing = `${(Math.random() - 0.5) * 3}px`;
          }
        }
      }
      
      // Add brief flicker effect for extreme glitches
      if (Math.random() < 0.2 * intensityFactor) {
        newStyle.opacity = 0.7 + Math.random() * 0.3;
      }
      
      setDisplayStyle(newStyle);
      
      // More rapid revert for an unsettling strobe-like effect
      const revertDelay = 100 + Math.random() * 150; // Faster reversion
      const revertTimeout = setTimeout(() => {
        const revertTextArray = [...newTextArray];
        revertTextArray[pos] = originalChar;
        setDisplayText(revertTextArray.join(''));
        setDisplayStyle({});
      }, revertDelay);
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Multiple character glitch - for more intense and disruptive moments
    const glitchMultipleCharacters = () => {
      // Clone the current text
      const newTextArray = [...textArray];
      
      // Number of characters to glitch - increased for more dramatic effect
      // but still maintain some legibility
      const glitchCount = Math.min(
        Math.floor(1 + Math.random() * 3 * intensityFactor), // Increased count
        Math.floor(textArray.length * 0.4) // Increased cap to 40% of text for more impact
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
        
        // Get random replacement character from the extended pool
        const randomChar = GLITCH_CHARS.charAt(
          Math.floor(Math.random() * GLITCH_CHARS.length)
        );
        
        newTextArray[pos] = randomChar;
      }
      
      // Apply more dramatic style variations
      const newStyle: React.CSSProperties = {};
      
      // Add text shadow for a creepy glow effect - more intense
      if (Math.random() < 0.8) { // Increased probability
        const color = `rgba(${220 + Math.floor(Math.random() * 35)}, 0, 0, 0.95)`;
        newStyle.textShadow = `0 0 ${2 + Math.random() * 6}px ${color}`;
        
        // Add subtle blur for a more unsettling effect
        if (Math.random() < 0.4) {
          newStyle.filter = `blur(${0.3 + Math.random() * 0.7}px)`;
        }
      }
      
      // Occasionally shift the text slightly for a jarring effect
      if (Math.random() < 0.3) {
        newStyle.transform = `translateY(${(Math.random() - 0.5) * 3}px)`;
      }
      
      // Set the glitched text and style
      setDisplayText(newTextArray.join(''));
      setDisplayStyle(newStyle);
      
      // Schedule revert after a moment - faster for more frantic glitching
      const revertTimeout = setTimeout(() => {
        setDisplayText(originalText.current);
        setDisplayStyle({});
      }, 200 + Math.random() * 150); // Faster reversion
      
      timeoutIds.current.push(revertTimeout);
    };
    
    // Create intense flicker effect (brief change in text style)
    const createFlickerEffect = () => {
      const newStyle: React.CSSProperties = {};
      
      // Apply a rapid, dramatic style change
      if (Math.random() < 0.5) {
        // Dramatic color flash - blood red
        newStyle.color = '#ff0000';
        newStyle.textShadow = `0 0 ${3 + Math.random() * 8}px rgba(255, 0, 0, 0.9)`;
      } else {
        // Alternatively use stark white for high contrast
        newStyle.color = '#ffffff';
        newStyle.textShadow = `0 0 ${3 + Math.random() * 5}px rgba(255, 255, 255, 0.95)`;
      }
      
      // Apply brief transform for disorienting effect
      if (Math.random() < 0.3) {
        const skewAmount = (Math.random() - 0.5) * 8;
        newStyle.transform = `skew(${skewAmount}deg)`;
      }
      
      setDisplayStyle(newStyle);
      
      // Reset after a very brief moment
      const flickerDuration = 30 + Math.random() * 70; // Very quick (30-100ms)
      const flickerTimeout = setTimeout(() => {
        setDisplayStyle({});
      }, flickerDuration);
      
      timeoutIds.current.push(flickerTimeout);
    };
    
    // Schedule glitches at a more rapid, frantic pace
    const scheduleNext = () => {
      // More rapid glitches for a more unsettling effect
      // The unpredictability of timing is increased
      const baseDelay = 400; // Reduced base delay for more frequent glitches
      const randomVariation = 800; // Still keep some variation
      const nextGlitchDelay = baseDelay + Math.random() * randomVariation;
      
      const timeout = setTimeout(() => {
        // Randomize effect type with weighted probabilities
        const effectRoll = Math.random();
        
        if (effectRoll < 0.5) {
          // 50% chance of single character glitches - the bread and butter
          glitchSingleCharacter();
        } else if (effectRoll < 0.8) {
          // 30% chance of multiple character glitches - more disruptive
          glitchMultipleCharacters();
        } else {
          // 20% chance of flicker effect - very jarring but brief
          createFlickerEffect();
        }
        
        // Continue the cycle
        scheduleNext();
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
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CursedNotificationEffectProps {
  isVisible: boolean;
  message?: string;
  onFinish: () => void;
  duration?: number;
}

/**
 * A component that creates a disturbing, glitchy text effect for a horror-themed notification.
 * Shows a briefly glitching effect with random symbols in a scary red font with enhanced visual effects.
 * Now uses a transparent background for less intrusive notifications.
 */
export function CursedNotificationEffect({
  isVisible,
  message = "Why are you ignoring me?",
  onFinish,
  duration = 2000
}: CursedNotificationEffectProps) {
  const [glitchText, setGlitchText] = useState(message);
  const [textOpacity, setTextOpacity] = useState(1);
  const [textSize, setTextSize] = useState("text-2xl");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const flickerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create a glitchy text effect by randomly replacing characters with enhanced techniques
  useEffect(() => {
    if (!isVisible) return;
    
    const originalText = message;
    let glitchCount = 0;
    const maxGlitches = 20; // Increased number of glitch animations for more dramatic effect
    
    // More varied glitch characters for a disturbing effect
    const createGlitchedText = () => {
      let result = '';
      // Extended character set with more unusual symbols
      const glitchChars = '!@#$%^&*_-=+?><:;[]{}|¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ÷≥≤œ∑´®†¥øπ"\'\\~`↵¥↑↓→←⟨⟩⟪⟫«»‹›⁂⁘⁙⁚⁛⁜⁝⁞⁎⁕⁑≡≣';
      
      for (let i = 0; i < originalText.length; i++) {
        // Higher chance of replacement for more chaotic effect
        if (Math.random() < 0.6) { // Increased from 0.4 to 0.6 for more glitching
          // Replace with a random glitch character
          const randomIndex = Math.floor(Math.random() * glitchChars.length);
          result += glitchChars[randomIndex];
        } else {
          // Keep the original character
          result += originalText[i];
        }
      }
      
      // More frequently add extra characters for length variation
      if (Math.random() < 0.5) { // Increased from 0.3 to 0.5
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const position = Math.floor(Math.random() * result.length);
        result = result.slice(0, position) + randomChar + result.slice(position);
      }
      
      // Occasionally add a second extra character for even more distortion
      if (Math.random() < 0.3) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const position = Math.floor(Math.random() * result.length);
        result = result.slice(0, position) + randomChar + result.slice(position);
      }
      
      return result;
    };
    
    // Add a random text flicker effect
    flickerRef.current = setInterval(() => {
      if (Math.random() < 0.3) {
        // Randomly change text size for a "zooming" effect
        if (Math.random() < 0.4) {
          const sizes = ["text-xl", "text-2xl", "text-3xl", "text-4xl"];
          setTextSize(sizes[Math.floor(Math.random() * sizes.length)]);
        }
        
        // Quick reset to normal
        setTimeout(() => {
          setTextSize("text-2xl");
        }, Math.random() * 200);
      }
    }, 500);
    
    // Start the glitch animation interval with varying speeds
    intervalRef.current = setInterval(() => {
      if (glitchCount < maxGlitches) {
        const newGlitchedText = createGlitchedText();
        setGlitchText(newGlitchedText);
        glitchCount++;
        
        // More dramatic opacity fluctuations
        setTextOpacity(Math.random() * 0.6 + 0.4);
        
        // Randomly speed up or slow down the effect as it progresses
        if (Math.random() < 0.3 && intervalRef.current) {
          clearInterval(intervalRef.current);
          
          // Set a new interval with different timing
          intervalRef.current = setInterval(() => {
            if (glitchCount < maxGlitches) {
              setGlitchText(createGlitchedText());
              glitchCount++;
              setTextOpacity(Math.random() * 0.6 + 0.4);
            } else {
              // End the effect
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                setGlitchText(originalText);
                setTextOpacity(1);
                setTextSize("text-2xl");
                
                // Signal that the effect is complete
                setTimeout(() => {
                  onFinish();
                }, 800); // Show the final text for longer before finishing
              }
            }
          }, Math.random() * 100 + 50); // Random interval between 50-150ms
        }
      } else {
        // End the effect
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          setGlitchText(originalText);
          setTextOpacity(1);
          setTextSize("text-2xl");
          
          // Signal that the effect is complete
          setTimeout(() => {
            onFinish();
          }, 800); // Show the final text for longer before finishing
        }
      }
    }, 120); // Quicker interval for more rapid glitching
    
    // Auto-clear after specified duration
    const timeout = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (flickerRef.current) {
        clearInterval(flickerRef.current);
        flickerRef.current = null;
      }
      onFinish();
    }, duration);
    
    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (flickerRef.current) {
        clearInterval(flickerRef.current);
        flickerRef.current = null;
      }
      clearTimeout(timeout);
    };
  }, [isVisible, message, duration, onFinish]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          style={{ backgroundColor: 'transparent' }}
        >
          <motion.div
            animate={{
              x: [0, -5, 7, -8, 5, 0], // More extreme shaking effect
              scale: [1, 1.05, 0.95, 1.08, 0.92, 1], // More dramatic scaling
              rotateZ: [0, 1, -2, 2.5, -1.5, 0], // Enhanced rotation
              filter: ["blur(0px)", "blur(0.5px)", "blur(0px)", "blur(1px)", "blur(0px)"] // Adding blur effect
            }}
            transition={{
              duration: 0.6, // Faster animation
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{ 
              opacity: textOpacity,
              textShadow: "0 0 15px rgba(255, 0, 0, 0.9), 0 0 25px rgba(255, 0, 0, 0.5), 0 0 40px rgba(255, 0, 0, 0.3)" // Stronger red glow
            }}
            className={cn(
              textSize, // Dynamic text size for zoom effect
              "text-red-700 font-bold tracking-wider", // Deeper red and wider letter spacing
              "transform-gpu", // Use hardware acceleration
              "font-horror", // Horror-themed font
              "select-none" // Prevent text selection
            )}
          >
            {glitchText}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// More intense version with additional distortion
export function CreepyTextGlitch({ 
  text, 
  intensityFactor = 8,  // Increased intensity for more dramatic glitching
  duration = 2000,      // Reduced to 2 seconds
  permanent = false
}: { 
  text: string; 
  intensityFactor?: number;
  duration?: number;
  permanent?: boolean;
}) {
  const [glitchText, setGlitchText] = useState(text);
  const [glitchActive, setGlitchActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Cleanup function for previous interval if component reloads
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const startTime = Date.now();
    // Higher intensity = faster glitching (lower interval)
    const glitchInterval = Math.max(50, 150 - intensityFactor * 15); 
    
    // Extended character set with more unusual symbols for extreme glitching
    const glitchChars = '!@#$%^&*()-_=+[]{}|;:,.<>/?`~\\¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ÷≥≤œ∑´®†¥øπ"\'\\~`↵¥↑↓→←⟨⟩⟪⟫«»‹›⁂⁘⁙⁚⁛⁜⁝⁞⁎⁕⁑≡≣';
    
    const randomGlitchText = () => {
      let result = '';
      // Higher intensity = more characters get replaced
      // Adjusted formula for more aggressive replacement
      const glitchProbability = Math.min(0.85, 0.3 + intensityFactor * 0.12);
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < glitchProbability) {
          // Replace with a random glitch character
          const randomIndex = Math.floor(Math.random() * glitchChars.length);
          result += glitchChars[randomIndex];
        } else {
          // Keep the original character
          result += text[i];
        }
      }
      
      // Occasionally add extra characters for more chaotic effect
      if (Math.random() < 0.4) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const position = Math.floor(Math.random() * result.length);
        result = result.slice(0, position) + randomChar + result.slice(position);
      }
      
      return result;
    };
    
    // Start the glitch effect immediately
    setGlitchText(randomGlitchText());
    setGlitchActive(true);
    
    // Continue the glitch effect with interval
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (permanent || elapsed < duration) {
        setGlitchText(randomGlitchText());
      } else {
        // End with the original text
        setGlitchText(text);
        setGlitchActive(false);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, glitchInterval);
    
    // Cleanup when unmounting
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, intensityFactor, duration, permanent]);
  
  return (
    <span 
      className={cn(
        "inline-block font-medium leading-tight relative",
        glitchActive ? "text-red-700 font-horror" : "text-current"
      )}
      style={{ 
        textShadow: glitchActive 
          ? "0 0 5px rgba(220, 38, 38, 0.9), 0 0 10px rgba(220, 38, 38, 0.6)" 
          : "none",
        transition: "text-shadow 0.2s ease, color 0.2s ease",
        // Adding slight distortion via transform when active
        transform: glitchActive ? "skew(-0.5deg, 0.5deg)" : "none",
        letterSpacing: glitchActive ? "0.5px" : "normal",
      }}
    >
      {glitchText}
      {glitchActive && (
        // Add a subtle after-image effect when glitching
        <span 
          className="absolute left-0 top-0 opacity-40 text-red-500" 
          style={{ 
            filter: "blur(1px)",
            transform: "translate(1px, -1px)",
            mixBlendMode: "difference" 
          }}
        >
          {glitchText}
        </span>
      )}
    </span>
  );
}
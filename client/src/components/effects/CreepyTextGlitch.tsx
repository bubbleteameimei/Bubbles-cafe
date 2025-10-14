import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function CreepyTextGlitch({ 
  text, 
  intensityFactor = 8,
  duration = 2000,
  permanent = false
}: { 
  text: string; 
  intensityFactor?: number;
  duration?: number;
  permanent?: boolean;
}) {
  const [glitchText, setGlitchText] = useState(text);
  const [glitchActive, setGlitchActive] = useState(true);
  const intervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const startTime = Date.now();
    const glitchInterval = Math.max(50, 150 - intensityFactor * 15); 
    
    // Keep character set simple to avoid escaping issues in TypeScript
    const glitchChars = "!@#$%^&*()-_=+[]{}|;:,.<>/?`~\\¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ÷≥≤œ∑´®†¥øπ\\\"'↵¥↑↓→←⟨⟩⟪⟫«»‹›⁂⁘⁙⁚⁛⁜⁝⁞⁎⁕⁑≡≣";
    
    const randomGlitchText = () => {
      let result = '';
      const glitchProbability = Math.min(0.85, 0.3 + intensityFactor * 0.12);
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < glitchProbability) {
          const randomIndex = Math.floor(Math.random() * glitchChars.length);
          result += glitchChars[randomIndex];
        } else {
          result += text[i];
        }
      }
      
      if (Math.random() < 0.4) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        const position = Math.floor(Math.random() * result.length);
        result = result.slice(0, position) + randomChar + result.slice(position);
      }
      
      return result;
    };
    
    setGlitchText(randomGlitchText());
    setGlitchActive(true);
    
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (permanent || elapsed < duration) {
        setGlitchText(randomGlitchText());
      } else {
        setGlitchText(text);
        setGlitchActive(false);
        
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, glitchInterval);
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
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
        transform: glitchActive ? "skew(-0.5deg, 0.5deg)" : "none",
        letterSpacing: glitchActive ? "0.5px" : "normal",
      }}
    >
      {glitchText}
      {glitchActive && (
        <span 
          className="absolute left-0 top-0 opacity-40 text-red-500" 
          style={{ 
            filter: "blur(1px)",
            transform: "translate(1px, -1px)",
            mixBlendMode: "difference" 
          }}
          aria-hidden="true"
        >
          {glitchText}
        </span>
      )}
    </span>
  );
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypewriter } from "../hooks/useTypewriter";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { StoryPhase } from "../types";

interface StoryPanelProps {
  title: string;
  content: string[];
  typingSpeed: number;
  showLowSanityEffects: boolean;
  storyPhase?: StoryPhase;
}

export default function StoryPanel({
  title,
  content,
  typingSpeed,
  showLowSanityEffects,
  storyPhase = "introduction"
}: StoryPanelProps) {
  const [isContentChanged, setIsContentChanged] = useState(false);
  const { playSound } = useSoundEffects();
  
  const { displayedTexts, isTyping, skipTyping } = useTypewriter({
    texts: content,
    speed: typingSpeed,
    onComplete: () => playSound('typewriter') // Play completion sound
  });
  
  // Reset the changed flag when new content is received
  useEffect(() => {
    setIsContentChanged(true);
    
    // Clear the flag after animation completes
    const timeout = setTimeout(() => {
      setIsContentChanged(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [content]);
  
  // Play typewriter sound effect on each update
  useEffect(() => {
    // This counts the total number of characters displayed
    const totalCharsDisplayed = displayedTexts.reduce((sum, text) => sum + text.length, 0);
    // This counts the total number of characters in the original content
    const totalContentChars = content.reduce((sum, text) => sum + text.length, 0);
    
    // Only play sound if we're still typing (not when skipped)
    if (isTyping && totalCharsDisplayed > 0 && totalCharsDisplayed < totalContentChars) {
      playSound('typewriter');
    }
  }, [displayedTexts, isTyping, content, playSound]);
  
  // Get phase-specific styling
  const getPhaseStyle = () => {
    switch(storyPhase) {
      case "introduction":
        return "border-secondary";
      case "descent":
        return "border-secondary border-opacity-70";
      case "fragmentation":
        return "border-accent border-opacity-60";
      case "confrontation":
        return "border-accent animate-pulse";
      case "ending":
        return "border-accent border-opacity-80";
      default:
        return "border-secondary";
    }
  };
  
  // Process text for special formatting
  const processText = (text: string) => {
    // If text is surrounded by asterisks, it's italicized
    if (text.startsWith('*') && text.endsWith('*')) {
      return <em>{text.substring(1, text.length - 1)}</em>;
    }
    
    // Handle dialogue with quotes
    if (text.startsWith('"') && text.endsWith('"')) {
      return <span className="italic font-dialogue">{text}</span>;
    }
    
    // Apply low sanity effects to certain words if sanity is low
    if (showLowSanityEffects) {
      const keywords = ['fear', 'terror', 'horror', 'dread', 'blood', 'death', 'madness', 'insanity', 'corruption'];
      let result = text;
      keywords.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) {
          // Create a regex that matches the keyword case-insensitively
          const regex = new RegExp(`(${keyword})`, 'gi');
          // Split the text on the keyword and join with spans
          const parts = result.split(regex);
          result = parts.map((part, i) => 
            regex.test(part) ? 
              <span key={i} className="text-secondary animate-pulse">{part}</span> : 
              part
          ).join('');
        }
      });
      return result;
    }
    
    return text;
  };
  
  return (
    <motion.div
      key={title} // Remount when title changes for animation
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-primary bg-opacity-80 p-4 md:p-6 border-2 ${getPhaseStyle()} backdrop-blur-sm min-h-[300px] md:min-h-[400px] mb-6 ${
        showLowSanityEffects ? 'low-sanity' : ''
      }`}
    >
      {/* Story Phase Indicator */}
      <div className="absolute top-0 right-0 px-2 py-1 bg-primary font-ui text-2xs uppercase tracking-widest">
        <span className={`
          ${storyPhase === 'introduction' ? 'text-secondary' : ''}
          ${storyPhase === 'descent' ? 'text-secondary animate-pulse' : ''}
          ${storyPhase === 'fragmentation' ? 'text-accent' : ''}
          ${storyPhase === 'confrontation' ? 'text-accent animate-pulse' : ''}
          ${storyPhase === 'ending' ? 'text-secondary' : ''}
        `}>
          {storyPhase}
        </span>
      </div>
      
      {/* Story Title */}
      <h2 
        className="font-ui text-accent text-base md:text-lg mb-6 text-center"
      >
        {title}
      </h2>
      
      {/* Story Content */}
      <div className="font-story text-textColor leading-relaxed text-lg md:text-xl typewriter">
        <AnimatePresence mode="wait">
          {displayedTexts.map((text, index) => {
            // Determine if this paragraph is dialogue or special text
            const isDialogue = content[index]?.includes('*') || 
                              (content[index]?.startsWith('"') && content[index]?.endsWith('"'));
            
            return (
              <motion.p 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`mb-4 ${
                  isDialogue ? 'italic font-dialogue text-textColor opacity-90' : ''
                }`}
              >
                {processText(text)}
              </motion.p>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Typewriter Controls */}
      <div className="flex justify-end mt-4">
        {isTyping && (
          <button 
            onClick={skipTyping}
            className="font-ui text-xs text-accent hover:text-textColor transition-colors"
          >
            SKIP &gt;&gt;
          </button>
        )}
      </div>
    </motion.div>
  );
}

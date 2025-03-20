import React, { useState, useEffect, useRef } from 'react';
import { DialogBoxProps, DialogLine } from '../types';

/**
 * DialogBox Component - Displays character dialog with typewriter effect
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  dialog,
  currentIndex,
  onSelect,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [typewriterSpeed, setTypewriterSpeed] = useState<number>(30); // ms per character
  const currentLine = dialog.lines[currentIndex];
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset typing state when dialog or index changes
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    startTypewriterEffect();
    
    // Clean up typing timer when unmounting or changing dialog/index
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [dialog.id, currentIndex]);
  
  // Scroll to bottom when text updates
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [displayedText]);
  
  // Typewriter effect
  const startTypewriterEffect = () => {
    let index = 0;
    const fullText = currentLine.text;
    
    // Clear any existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // Function to add one character at a time
    const typeNextCharacter = () => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 1));
        index++;
        
        // Adjust speed for punctuation (pause slightly for periods, commas)
        let delay = typewriterSpeed;
        const currentChar = fullText[index - 1];
        if (['.', '!', '?'].includes(currentChar)) {
          delay = typewriterSpeed * 5;
        } else if ([',', ';', ':'].includes(currentChar)) {
          delay = typewriterSpeed * 3;
        }
        
        typingTimerRef.current = setTimeout(typeNextCharacter, delay);
      } else {
        setIsTyping(false);
      }
    };
    
    // Start typing
    typingTimerRef.current = setTimeout(typeNextCharacter, 300); // Initial delay before typing starts
  };
  
  // Skip typewriter effect and show full text
  const skipTypewriterEffect = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    setDisplayedText(currentLine.text);
    setIsTyping(false);
  };
  
  // Handle clicking on text
  const handleTextClick = () => {
    if (isTyping) {
      skipTypewriterEffect();
    } else if (!currentLine.responses || currentLine.responses.length === 0) {
      // If there are no responses, clicking again will advance to the next line
      if (currentLine.nextIndex !== undefined) {
        onSelect(-1); // -1 indicates auto-advance
      } else {
        onClose();
      }
    }
  };
  
  // Get the right character name to display
  const getCharacterName = () => {
    return currentLine.speaker || dialog.character;
  };
  
  // Get emotion CSS class
  const getEmotionClass = () => {
    if (!currentLine.emotion) return '';
    return `dialog-emotion-${currentLine.emotion.toLowerCase()}`;
  };
  
  return (
    <div className="dialog-box-container">
      <div className="dialog-box">
        {/* Character portrait */}
        {dialog.avatar && (
          <div className={`dialog-avatar ${getEmotionClass()}`}>
            <img
              src={dialog.avatar}
              alt={getCharacterName()}
              className="avatar-image"
            />
          </div>
        )}
        
        {/* Dialog content */}
        <div className="dialog-content">
          {/* Character name */}
          <div className="dialog-name">
            {getCharacterName()}
            {currentLine.emotion && (
              <span className="dialog-emotion">
                {` (${currentLine.emotion})`}
              </span>
            )}
          </div>
          
          {/* Text with typewriter effect */}
          <div
            ref={textContainerRef}
            className="dialog-text"
            onClick={handleTextClick}
          >
            {displayedText}
            {isTyping && <span className="typing-cursor">_</span>}
          </div>
          
          {/* Response options */}
          {!isTyping && currentLine.responses && currentLine.responses.length > 0 && (
            <div className="dialog-responses">
              {currentLine.responses.map((response, index) => (
                <button
                  key={index}
                  className="dialog-response-option"
                  onClick={() => onSelect(index)}
                >
                  {response.text}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>
      
      {/* Continue indicator */}
      {!isTyping && (!currentLine.responses || currentLine.responses.length === 0) && (
        <div className="dialog-continue">
          Click to continue
          <div className="dialog-continue-arrow">↓</div>
        </div>
      )}
      
      <style>
        {`
          .dialog-box-container {
            position: fixed;
            bottom: 20px;
            left: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 500;
            pointer-events: none;
          }
          
          .dialog-box {
            width: calc(100% - 40px);
            max-width: 800px;
            background-color: rgba(20, 20, 30, 0.85);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(100, 100, 150, 0.4);
            border-radius: 8px;
            padding: 15px;
            display: flex;
            margin-bottom: 5px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            pointer-events: auto;
            animation: slideUp 0.3s ease-out;
          }
          
          .dialog-avatar {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            overflow: hidden;
            margin-right: 15px;
            flex-shrink: 0;
            border: 2px solid rgba(100, 100, 150, 0.4);
            background-color: rgba(30, 30, 50, 0.5);
            transition: all 0.3s ease;
          }
          
          .avatar-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .dialog-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .dialog-name {
            font-size: 18px;
            font-weight: bold;
            color: #ccd6ff;
            margin-bottom: 8px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          
          .dialog-emotion {
            color: #aab3cc;
            font-style: italic;
            font-weight: normal;
          }
          
          .dialog-text {
            font-size: 16px;
            line-height: 1.5;
            color: #ffffff;
            margin-bottom: 12px;
            min-height: 50px;
            max-height: 150px;
            overflow-y: auto;
            cursor: pointer;
            padding-right: 5px;
            /* Custom scrollbar */
            scrollbar-width: thin;
            scrollbar-color: rgba(100, 100, 150, 0.4) rgba(30, 30, 50, 0.2);
          }
          
          .dialog-text::-webkit-scrollbar {
            width: 6px;
          }
          
          .dialog-text::-webkit-scrollbar-track {
            background: rgba(30, 30, 50, 0.2);
            border-radius: 3px;
          }
          
          .dialog-text::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 150, 0.4);
            border-radius: 3px;
          }
          
          .typing-cursor {
            display: inline-block;
            margin-left: 2px;
            animation: blink 0.7s infinite;
          }
          
          .dialog-responses {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 5px;
          }
          
          .dialog-response-option {
            background-color: rgba(60, 60, 90, 0.6);
            border: 1px solid rgba(100, 100, 150, 0.4);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
            font-size: 14px;
          }
          
          .dialog-response-option:hover {
            background-color: rgba(80, 80, 120, 0.8);
            border-color: rgba(120, 120, 180, 0.6);
          }
          
          .dialog-response-option:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(120, 120, 180, 0.6);
          }
          
          .dialog-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            font-size: 16px;
            padding: 0 5px;
            align-self: flex-start;
            transition: color 0.2s ease;
          }
          
          .dialog-close:hover {
            color: white;
          }
          
          .dialog-continue {
            background-color: rgba(30, 30, 40, 0.7);
            color: #ccd6ff;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: none;
            animation: pulse 1.5s infinite;
          }
          
          .dialog-continue-arrow {
            font-size: 16px;
            margin-top: 2px;
          }
          
          /* Emotion classes for the avatar */
          .dialog-emotion-happy .avatar-image {
            filter: brightness(1.1) saturate(1.1);
          }
          
          .dialog-emotion-sad .avatar-image {
            filter: brightness(0.9) saturate(0.8);
          }
          
          .dialog-emotion-angry .avatar-image {
            filter: brightness(1.1) saturate(1.2) hue-rotate(-10deg);
          }
          
          .dialog-emotion-fearful .avatar-image {
            filter: brightness(0.85) saturate(0.7) hue-rotate(20deg);
          }
          
          .dialog-emotion-surprised .avatar-image {
            filter: brightness(1.15) contrast(1.1);
          }
          
          /* Animations */
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.8; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(3px); }
          }
          
          @keyframes slideUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          
          /* Mobile responsive */
          @media (max-width: 500px) {
            .dialog-box {
              width: calc(100% - 20px);
              padding: 10px;
            }
            
            .dialog-avatar {
              width: 60px;
              height: 60px;
              margin-right: 10px;
            }
            
            .dialog-name {
              font-size: 16px;
            }
            
            .dialog-text {
              font-size: 14px;
              max-height: 120px;
            }
            
            .dialog-response-option {
              padding: 6px 10px;
              font-size: 13px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DialogBox;
import React, { useState, useEffect, useRef } from 'react';
import { DialogBoxProps, DialogChoice } from '../types';

/**
 * DialogBox - Displays dialog text with typewriter effect and choices
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  text = '',
  choices = [],
  onClose,
  onChoiceSelect,
  typewriterSpeed = 30,
  showCloseButton = true,
  characterName,
  characterImage,
  position = 'bottom'
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Start typewriter effect when text changes
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }
    
    // Typewriter effect
    const typeWriter = (currentIndex: number) => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text.charAt(currentIndex));
        typewriterRef.current = setTimeout(() => {
          typeWriter(currentIndex + 1);
        }, typewriterSpeed);
      } else {
        setIsTyping(false);
      }
    };
    
    // Start typing
    typeWriter(0);
    
    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [text, typewriterSpeed]);
  
  // Add keydown listener for space to complete typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (isTyping) {
          // Complete typing immediately
          setDisplayedText(text);
          setIsTyping(false);
          if (typewriterRef.current) {
            clearTimeout(typewriterRef.current);
          }
        } else if (choices.length === 0 && showCloseButton) {
          // Close dialog if no choices and not typing
          handleClose();
        }
      } else if (e.key === 'Escape') {
        // Close dialog
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTyping, choices.length, text, showCloseButton]);
  
  // Handle dialog close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  // Handle choice selection
  const handleChoiceSelect = (choice: DialogChoice) => {
    if (onChoiceSelect) {
      onChoiceSelect(choice);
    }
  };
  
  // Get position-specific class
  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'dialog-position-top';
      case 'middle':
        return 'dialog-position-middle';
      case 'bottom':
      default:
        return 'dialog-position-bottom';
    }
  };
  
  // Check if text has fully typed out
  const isFullyTyped = displayedText.length === text.length;
  
  return (
    <div className={`dialog-overlay ${isVisible ? 'dialog-visible' : 'dialog-hidden'}`}>
      <div 
        ref={dialogRef}
        className={`dialog-box ${getPositionClass()} ${characterImage ? 'with-character' : ''}`}
      >
        {/* Character portrait */}
        {characterImage && (
          <div className="character-portrait">
            <img src={characterImage} alt={characterName || 'Character'} />
            {characterName && <div className="character-name">{characterName}</div>}
          </div>
        )}
        
        <div className="dialog-content">
          {/* Dialog text with typewriter effect */}
          <div className="dialog-text">
            {displayedText}
            {isTyping && <span className="typing-cursor">|</span>}
          </div>
          
          {/* Dialog choices */}
          {isFullyTyped && choices.length > 0 && (
            <div className="dialog-choices">
              {choices.map((choice, index) => (
                <button 
                  key={index}
                  className="dialog-choice"
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={choice.disabled}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
          
          {/* Continue/close indicator */}
          {isFullyTyped && choices.length === 0 && showCloseButton && (
            <div className="dialog-continue">
              <button className="continue-button" onClick={handleClose}>
                Continue
              </button>
            </div>
          )}
          
          {/* Skip typing indicator */}
          {isTyping && (
            <div className="dialog-skip-indicator">
              Press Space to skip
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          transition: opacity 0.3s ease;
        }
        
        .dialog-hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .dialog-visible {
          opacity: 1;
        }
        
        .dialog-box {
          background-color: rgba(20, 20, 30, 0.95);
          border: 2px solid rgba(100, 100, 150, 0.6);
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          display: flex;
          position: absolute;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .dialog-box.with-character {
          padding-left: 120px;
        }
        
        .dialog-position-top {
          top: 40px;
        }
        
        .dialog-position-middle {
          top: 50%;
          transform: translateY(-50%);
        }
        
        .dialog-position-bottom {
          bottom: 40px;
        }
        
        .character-portrait {
          position: absolute;
          left: -20px;
          bottom: -20px;
          width: 130px;
          height: 180px;
          overflow: hidden;
          border-radius: 8px;
          border: 2px solid rgba(100, 100, 150, 0.6);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        
        .character-portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .character-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(20, 20, 30, 0.9);
          padding: 5px;
          text-align: center;
          font-weight: bold;
          color: #c0c0e0;
          font-size: 14px;
        }
        
        .dialog-content {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .dialog-text {
          font-size: 16px;
          line-height: 1.6;
          min-height: 80px;
          white-space: pre-wrap;
        }
        
        .typing-cursor {
          display: inline-block;
          animation: blink 0.7s infinite;
          margin-left: 2px;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .dialog-choices {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        
        .dialog-choice {
          background-color: rgba(40, 40, 60, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          padding: 8px 15px;
          text-align: left;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .dialog-choice:hover {
          background-color: rgba(60, 60, 90, 0.8);
          transform: translateX(5px);
        }
        
        .dialog-choice:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: rgba(30, 30, 40, 0.8);
        }
        
        .dialog-choice:disabled:hover {
          transform: none;
        }
        
        .dialog-continue {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        
        .continue-button {
          background-color: rgba(40, 50, 70, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          padding: 6px 12px;
          color: #e0e0e0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .continue-button:hover {
          background-color: rgba(60, 70, 100, 0.8);
        }
        
        .continue-button:after {
          content: "▶";
          font-size: 10px;
        }
        
        .dialog-skip-indicator {
          position: absolute;
          bottom: 5px;
          right: 10px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .dialog-box {
            width: 95%;
            max-height: 60vh;
            overflow-y: auto;
          }
          
          .dialog-content {
            padding: 15px;
          }
          
          .dialog-box.with-character {
            padding-left: 0;
            padding-top: 70px;
          }
          
          .character-portrait {
            left: 50%;
            transform: translateX(-50%);
            top: -50px;
            bottom: auto;
            width: 100px;
            height: 100px;
            border-radius: 50%;
          }
          
          .character-name {
            position: absolute;
            top: 105px;
            bottom: auto;
            background: none;
            font-size: 14px;
          }
          
          .dialog-text {
            font-size: 14px;
          }
          
          .dialog-position-top {
            top: 70px;
          }
        }
      `}</style>
    </div>
  );
};

export default DialogBox;
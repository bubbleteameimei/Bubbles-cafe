import React, { useState, useEffect, useRef } from 'react';
import { DialogBoxProps, DialogChoice } from '../types';

/**
 * DialogBox component - Displays in-game dialog with a typewriter effect
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  dialog,
  onComplete,
  onChoiceSelected
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [showChoices, setShowChoices] = useState<boolean>(false);
  const typingSpeed = 30; // ms per character
  const lineRef = useRef<HTMLDivElement>(null);
  
  // Get the current dialog line
  const currentLine = dialog.content[currentLineIndex];
  const isLastLine = currentLineIndex === dialog.content.length - 1;
  
  // Typewriter effect for dialog text
  useEffect(() => {
    // Reset when line changes
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);
    
    const fullText = currentLine.text;
    let currentIndex = 0;
    
    // Skip typing if user clicked to speed up
    if (!isTyping) {
      setDisplayedText(fullText);
      return;
    }
    
    // Set up the typing interval
    const typingInterval = setInterval(() => {
      currentIndex++;
      setDisplayedText(fullText.substring(0, currentIndex));
      
      // Check if typing is complete
      if (currentIndex >= fullText.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Show choices if this is the last line
        if (isLastLine && dialog.choices) {
          setShowChoices(true);
        }
      }
    }, typingSpeed);
    
    return () => clearInterval(typingInterval);
  }, [currentLineIndex, currentLine, isTyping, isLastLine, dialog.choices]);
  
  // Advance to the next line or complete the dialog
  const handleNext = () => {
    // If still typing, show the whole text immediately
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(currentLine.text);
      
      // Show choices if this is the last line
      if (isLastLine && dialog.choices) {
        setShowChoices(true);
      }
      return;
    }
    
    // If there are more lines, advance to the next one
    if (currentLineIndex < dialog.content.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setIsTyping(true);
    } else if (!dialog.choices) {
      // If no choices and no more lines, complete dialog
      onComplete();
    }
    // Otherwise, keep showing the choices
  };
  
  // Handle selecting a dialog choice
  const handleChoiceSelect = (choice: DialogChoice) => {
    onChoiceSelected(choice);
  };
  
  // Scroll to the bottom of the dialog when text changes
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.scrollTop = lineRef.current.scrollHeight;
    }
  }, [displayedText]);
  
  return (
    <div className="dialog-box-container">
      <div className="dialog-box">
        <div className="dialog-header">
          <div 
            className="speaker-name"
            style={{ color: currentLine.speaker.color || '#ffffff' }}
          >
            {currentLine.speaker.name}
          </div>
        </div>
        
        <div className="dialog-content" ref={lineRef}>
          <div className="dialog-text">{displayedText}</div>
          
          {/* Choices */}
          {showChoices && dialog.choices && (
            <div className="dialog-choices">
              {dialog.choices.map((choice, index) => (
                <button
                  key={`choice-${index}`}
                  className="dialog-choice"
                  onClick={() => handleChoiceSelect(choice)}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Continue indicator */}
        {!showChoices && (
          <div className="dialog-continue" onClick={handleNext}>
            {isTyping ? (
              <span className="typing-indicator">...</span>
            ) : (
              <div className="continue-icon">▼</div>
            )}
          </div>
        )}
      </div>
      
      <style>
        {`
          .dialog-box-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0 20px 20px;
            z-index: 900;
            pointer-events: none;
          }
          
          .dialog-box {
            background-color: rgba(0, 0, 0, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            width: 100%;
            max-width: 800px;
            max-height: 30vh;
            padding: 15px;
            color: #e9e9e9;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            pointer-events: auto;
            backdrop-filter: blur(4px);
          }
          
          .dialog-header {
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .speaker-name {
            font-weight: bold;
            font-size: 18px;
          }
          
          .dialog-content {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 10px;
            padding-right: 5px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          }
          
          .dialog-content::-webkit-scrollbar {
            width: 5px;
          }
          
          .dialog-content::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .dialog-content::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
          }
          
          .dialog-text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          
          .dialog-choices {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
          }
          
          .dialog-choice {
            background-color: rgba(50, 50, 80, 0.6);
            border: 1px solid rgba(100, 100, 150, 0.4);
            border-radius: 4px;
            padding: 8px 12px;
            color: #ffffff;
            text-align: left;
            cursor: pointer;
            transition: background-color 0.2s;
            font-size: 14px;
          }
          
          .dialog-choice:hover {
            background-color: rgba(80, 80, 120, 0.8);
          }
          
          .dialog-continue {
            align-self: flex-end;
            cursor: pointer;
            padding: 5px;
            text-align: center;
          }
          
          .typing-indicator {
            font-size: 20px;
            animation: blink 1s infinite;
          }
          
          .continue-icon {
            animation: bounce 1s infinite;
            font-size: 12px;
          }
          
          @keyframes blink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(3px); }
          }
          
          @media (max-width: 640px) {
            .dialog-box {
              max-height: 40vh;
            }
            
            .dialog-box-container {
              padding: 0 10px 10px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DialogBox;
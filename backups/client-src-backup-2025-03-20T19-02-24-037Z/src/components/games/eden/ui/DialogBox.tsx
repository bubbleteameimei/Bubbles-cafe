import React, { useState, useEffect, useRef } from 'react';
import { DialogBoxProps, DialogChoice, CurrentDialog } from '../types';

/**
 * DialogBox - Displays character dialog with typewriter effect and choices
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  currentDialog,
  isOpen,
  onClose,
  onChoiceSelect,
  autoAdvance = false,
  typingSpeed = 30
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [textComplete, setTextComplete] = useState<boolean>(false);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const dialogTextRef = useRef<HTMLDivElement>(null);
  
  // Start typing effect when dialog changes
  useEffect(() => {
    if (currentDialog && isOpen) {
      startTypewriter();
    }
    
    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [currentDialog, isOpen]);
  
  // Auto-scroll to bottom of text when it updates
  useEffect(() => {
    if (dialogTextRef.current) {
      dialogTextRef.current.scrollTop = dialogTextRef.current.scrollHeight;
    }
  }, [displayedText]);
  
  // Start typewriter effect
  const startTypewriter = () => {
    if (!currentDialog) return;
    
    setIsTyping(true);
    setTextComplete(false);
    setDisplayedText('');
    
    let i = 0;
    const text = currentDialog.text;
    
    const type = () => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
        typewriterRef.current = setTimeout(type, typingSpeed);
      } else {
        setIsTyping(false);
        setTextComplete(true);
      }
    };
    
    typewriterRef.current = setTimeout(type, typingSpeed);
  };
  
  // Complete text immediately on click if still typing
  const completeText = () => {
    if (isTyping && currentDialog) {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
      setDisplayedText(currentDialog.text);
      setIsTyping(false);
      setTextComplete(true);
    } else if (textComplete && !currentDialog?.choices) {
      // If there are no choices and text is complete, close the dialog box
      onClose();
    }
  };
  
  // Handle choice selection
  const handleChoiceSelect = (choice: DialogChoice) => {
    onChoiceSelect(choice);
  };
  
  // Get speaker display name
  const getSpeakerName = () => {
    if (!currentDialog) return '';
    
    if (typeof currentDialog.speaker === 'string') {
      return currentDialog.speaker;
    } else {
      return currentDialog.speaker.name;
    }
  };
  
  // Get speaker text color
  const getSpeakerColor = () => {
    if (!currentDialog) return '#ffffff';
    
    if (typeof currentDialog.speaker === 'object' && currentDialog.speaker.color) {
      return currentDialog.speaker.color;
    }
    
    return '#ffffff';
  };
  
  if (!isOpen || !currentDialog) return null;
  
  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h3 className="dialog-speaker" style={{ color: getSpeakerColor() }}>
            {getSpeakerName()}
          </h3>
          <button 
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        
        <div 
          className="dialog-text"
          ref={dialogTextRef}
          onClick={completeText}
        >
          {displayedText}
          {isTyping && <span className="typing-cursor">_</span>}
        </div>
        
        {textComplete && currentDialog.choices && currentDialog.choices.length > 0 && (
          <div className="dialog-choices">
            {currentDialog.choices.map((choice, index) => (
              <button
                key={`choice-${index}`}
                className={`dialog-choice ${choice.disabled ? 'disabled' : ''}`}
                onClick={() => !choice.disabled && handleChoiceSelect(choice)}
                disabled={choice.disabled}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
        
        {textComplete && (!currentDialog.choices || currentDialog.choices.length === 0) && (
          <div className="dialog-continue">
            <button 
              className="continue-button"
              onClick={onClose}
            >
              {currentDialog.continueText || 'Continue'}
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0 20px 20px;
          z-index: 200;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        
        .dialog-container {
          width: 100%;
          max-width: 800px;
          background-color: rgba(20, 20, 30, 0.9);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(100, 100, 150, 0.4);
          backdrop-filter: blur(4px);
          animation: dialog-slide-up 0.3s ease forwards;
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          overflow: hidden;
          pointer-events: auto;
        }
        
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          background-color: rgba(30, 30, 45, 0.7);
        }
        
        .dialog-speaker {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        
        .dialog-close {
          background: none;
          border: none;
          color: #a0a0b0;
          font-size: 16px;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .dialog-close:hover {
          background-color: rgba(80, 80, 100, 0.4);
          color: #e0e0e0;
        }
        
        .dialog-text {
          padding: 20px;
          font-size: 16px;
          line-height: 1.6;
          min-height: 100px;
          max-height: 200px;
          overflow-y: auto;
          cursor: pointer;
          white-space: pre-wrap;
        }
        
        .typing-cursor {
          display: inline-block;
          animation: cursor-blink 0.7s infinite;
          margin-left: 1px;
        }
        
        .dialog-choices {
          padding: 15px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(100, 100, 150, 0.4);
          background-color: rgba(30, 30, 45, 0.7);
        }
        
        .dialog-choice {
          background-color: rgba(60, 60, 80, 0.6);
          color: #d0d0e0;
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          padding: 10px 15px;
          text-align: left;
          font-family: inherit;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .dialog-choice:hover:not(.disabled) {
          background-color: rgba(80, 80, 110, 0.7);
          transform: translateY(-2px);
        }
        
        .dialog-choice:active:not(.disabled) {
          transform: translateY(0);
        }
        
        .dialog-choice.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          text-decoration: line-through;
        }
        
        .dialog-continue {
          padding: 15px 20px;
          display: flex;
          justify-content: center;
          border-top: 1px solid rgba(100, 100, 150, 0.4);
          background-color: rgba(30, 30, 45, 0.7);
        }
        
        .continue-button {
          background-color: rgba(70, 70, 100, 0.6);
          color: #d0d0e0;
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          padding: 8px 20px;
          font-family: inherit;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .continue-button:hover {
          background-color: rgba(90, 90, 120, 0.7);
        }
        
        @keyframes dialog-slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes cursor-blink {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .dialog-container {
            max-width: 100%;
          }
          
          .dialog-text {
            font-size: 15px;
            padding: 15px;
            min-height: 80px;
            max-height: 150px;
          }
          
          .dialog-speaker {
            font-size: 16px;
          }
          
          .dialog-choice {
            font-size: 14px;
            padding: 8px 12px;
          }
          
          .continue-button {
            font-size: 14px;
            padding: 6px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default DialogBox;
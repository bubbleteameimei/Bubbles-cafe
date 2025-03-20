import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogSegment } from '../types';

export interface DialogBoxProps {
  dialog: Dialog;
  dialogIndex: number;
  onResponseClick: (responseIndex: number) => void;
  onClose: () => void;
}

export const DialogBox: React.FC<DialogBoxProps> = ({
  dialog,
  dialogIndex,
  onResponseClick,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState(40); // ms per character
  const currentSegment = dialog.content[dialogIndex];
  const textRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const characterIndex = useRef<number>(0);
  
  // Start typewriter effect when dialog segment changes
  useEffect(() => {
    if (!currentSegment) return;
    
    // Reset state for new segment
    textRef.current = currentSegment.text;
    characterIndex.current = 0;
    setDisplayedText('');
    setIsTyping(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up typewriter effect
    timerRef.current = setInterval(() => {
      if (characterIndex.current < textRef.current.length) {
        setDisplayedText(prev => prev + textRef.current[characterIndex.current]);
        characterIndex.current++;
      } else {
        // Done typing
        setIsTyping(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, typingSpeed);
    
    // Clean up on unmount or when dialog changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSegment, typingSpeed]);
  
  // Handle click to speed up or complete typing
  const handleTextClick = () => {
    if (isTyping) {
      // Skip typing and show full text
      setDisplayedText(textRef.current);
      setIsTyping(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (!currentSegment.responses) {
      // If no responses, advance dialog
      onClose();
    }
  };
  
  // Render character avatar
  const renderAvatar = () => {
    if (currentSegment.speaker && currentSegment.speaker.avatar) {
      return (
        <div className="dialog-avatar">
          <img 
            src={currentSegment.speaker.avatar} 
            alt={currentSegment.speaker.name || 'Character'} 
          />
        </div>
      );
    }
    return null;
  };
  
  // Handle keyboard navigation for responses
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isTyping && currentSegment.responses) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key >= '1' && e.key <= '9') {
        const responseIndex = parseInt(e.key) - 1;
        if (responseIndex < currentSegment.responses.length) {
          onResponseClick(responseIndex);
        }
      }
    }
  };
  
  return (
    <div 
      className="dialog-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="dialog-box">
        {/* Header with speaker name */}
        {currentSegment.speaker && (
          <div 
            className="dialog-header"
            style={{ 
              color: currentSegment.speaker.color || '#ffb973'
            }}
          >
            {currentSegment.speaker.name}
          </div>
        )}
        
        <div className="dialog-content">
          {/* Avatar */}
          {renderAvatar()}
          
          {/* Dialog text with typewriter effect */}
          <div 
            className="dialog-text"
            onClick={handleTextClick}
          >
            <p>{displayedText}</p>
            {isTyping && <span className="typing-cursor">▎</span>}
          </div>
        </div>
        
        {/* Response options */}
        {!isTyping && currentSegment.responses && (
          <div className="dialog-responses">
            {currentSegment.responses.map((response, index) => (
              <button
                key={index}
                className="dialog-response"
                onClick={() => onResponseClick(index)}
              >
                <span className="response-number">{index + 1}</span>
                <span className="response-text">{response.text}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Close button */}
        {!isTyping && !currentSegment.responses && (
          <div className="dialog-continue">
            <button className="continue-button" onClick={onClose}>
              Continue
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .dialog-container {
          position: absolute;
          bottom: 80px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          padding: 0 20px;
          z-index: 50;
          outline: none;
        }
        
        .dialog-box {
          background-color: rgba(20, 20, 25, 0.95);
          border: 2px solid #8a5c41;
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          animation: slideUp 0.3s ease-out;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .dialog-header {
          padding: 10px 15px;
          background-color: rgba(30, 30, 35, 0.8);
          border-bottom: 1px solid #8a5c41;
          font-size: 16px;
          font-weight: bold;
        }
        
        .dialog-content {
          display: flex;
          padding: 15px;
          min-height: 100px;
        }
        
        .dialog-avatar {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          margin-right: 15px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #8a5c41;
        }
        
        .dialog-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .dialog-text {
          flex: 1;
          font-size: 16px;
          line-height: 1.5;
          color: #f1d7c5;
          cursor: pointer;
        }
        
        .dialog-text p {
          margin: 0;
        }
        
        .typing-cursor {
          display: inline-block;
          animation: blink 0.7s infinite;
          color: #ffb973;
          margin-left: 2px;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .dialog-responses {
          display: flex;
          flex-direction: column;
          padding: 10px 15px;
          gap: 8px;
          border-top: 1px solid rgba(138, 92, 65, 0.3);
        }
        
        .dialog-response {
          display: flex;
          align-items: center;
          background-color: rgba(60, 40, 30, 0.4);
          border: 1px solid #6a4331;
          border-radius: 5px;
          color: #f1d7c5;
          padding: 8px 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .dialog-response:hover {
          background-color: rgba(80, 50, 30, 0.5);
          border-color: #8a5c41;
        }
        
        .response-number {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 20px;
          height: 20px;
          background-color: rgba(138, 92, 65, 0.5);
          border-radius: 50%;
          margin-right: 10px;
          font-size: 12px;
        }
        
        .response-text {
          flex: 1;
        }
        
        .dialog-continue {
          display: flex;
          justify-content: center;
          padding: 10px 15px;
          border-top: 1px solid rgba(138, 92, 65, 0.3);
        }
        
        .continue-button {
          background-color: rgba(60, 40, 30, 0.6);
          border: 1px solid #8a5c41;
          border-radius: 5px;
          color: #f1d7c5;
          padding: 8px 15px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .continue-button:hover {
          background-color: rgba(80, 50, 30, 0.7);
          border-color: #a47755;
        }
      `}</style>
    </div>
  );
};
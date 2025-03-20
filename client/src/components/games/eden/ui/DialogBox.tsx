import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogResponse } from '../types';

interface DialogBoxProps {
  dialog: Dialog;
  onDialogEnd: () => void;
  onResponseSelect: (responseId: string) => void;
  isOpen: boolean;
}

/**
 * Displays character dialog with typed text effect and response options
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  dialog,
  onDialogEnd,
  onResponseSelect,
  isOpen
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponses, setShowResponses] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typeSpeed = 30; // milliseconds per character
  
  const currentSegment = dialog.content[currentSegmentIndex];
  
  // Handle dialog animation
  useEffect(() => {
    if (!isOpen) return;
    
    if (currentSegment) {
      // Reset states when moving to a new segment
      setDisplayedText('');
      setIsTyping(true);
      setShowResponses(false);
      
      // Animate the text typing effect
      let i = 0;
      const text = currentSegment.text;
      
      typingIntervalRef.current = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        
        if (i >= text.length) {
          // Typing complete
          clearInterval(typingIntervalRef.current as NodeJS.Timeout);
          setIsTyping(false);
          
          // Show response options after typing completes
          if (currentSegment.responses && currentSegment.responses.length > 0) {
            setTimeout(() => {
              setShowResponses(true);
            }, 500);
          }
        }
      }, typeSpeed);
      
      // Clear interval on unmount
      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      };
    }
  }, [currentSegmentIndex, isOpen, currentSegment]);
  
  // Handle next segment or dialog end
  const handleContinue = () => {
    if (isTyping) {
      // Skip typing animation and show full text immediately
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      setDisplayedText(currentSegment.text);
      setIsTyping(false);
      
      if (currentSegment.responses && currentSegment.responses.length > 0) {
        setShowResponses(true);
      }
      
      return;
    }
    
    // Move to next segment if available
    if (currentSegmentIndex < dialog.content.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else {
      // End of dialog
      onDialogEnd();
    }
  };
  
  // Handle response selection
  const handleResponseSelect = (responseId: string) => {
    onResponseSelect(responseId);
  };
  
  // Don't render if dialog is closed
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="dialog-box-container" style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      maxWidth: '800px',
      backgroundColor: 'rgba(10, 15, 25, 0.85)',
      borderRadius: '10px',
      padding: '20px',
      color: '#fff',
      boxShadow: '0 5px 30px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(80, 100, 140, 0.3)',
      zIndex: 100,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Character portrait and name */}
      <div className="dialog-header" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        {dialog.character && dialog.character.portrait && (
          <div className="character-portrait" style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(40, 60, 100, 0.5)',
            borderRadius: '50%',
            marginRight: '15px',
            backgroundImage: dialog.character.portrait ? `url(${dialog.character.portrait})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid rgba(80, 120, 180, 0.7)',
            boxShadow: '0 0 15px rgba(60, 100, 180, 0.3)',
            flexShrink: 0
          }} />
        )}
        
        <div className="character-name" style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#d0e0ff',
          textShadow: '0 0 10px rgba(100, 150, 255, 0.5)'
        }}>
          {currentSegment.speaker || dialog.character?.name || 'Unknown'}
        </div>
      </div>
      
      {/* Dialog text */}
      <div className="dialog-text" style={{
        fontSize: '16px',
        lineHeight: 1.6,
        marginBottom: '20px',
        minHeight: '80px'
      }}>
        {displayedText}
        
        {/* Typing indicator */}
        {isTyping && (
          <span className="typing-indicator" style={{
            display: 'inline-block',
            width: '8px',
            height: '16px',
            backgroundColor: '#fff',
            marginLeft: '2px',
            animation: 'blink 0.7s infinite'
          }} />
        )}
      </div>
      
      {/* Response options */}
      {showResponses && currentSegment.responses && currentSegment.responses.length > 0 ? (
        <div className="dialog-responses" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {currentSegment.responses.map((response: DialogResponse) => (
            <button
              key={response.id}
              onClick={() => handleResponseSelect(response.id)}
              style={{
                backgroundColor: 'rgba(40, 60, 100, 0.5)',
                border: '1px solid rgba(80, 120, 180, 0.5)',
                borderRadius: '5px',
                padding: '10px 15px',
                textAlign: 'left',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: 'rgba(60, 80, 130, 0.7)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 10px rgba(0, 0, 50, 0.3)'
                }
              }}
            >
              {response.text}
            </button>
          ))}
        </div>
      ) : (
        // Continue button when no responses are available
        !isTyping && (
          <div className="dialog-continue" style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleContinue}
              style={{
                backgroundColor: 'rgba(60, 90, 150, 0.6)',
                border: '1px solid rgba(100, 150, 200, 0.7)',
                borderRadius: '5px',
                padding: '8px 15px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              Continue
              <span style={{ fontSize: '18px' }}>→</span>
            </button>
          </div>
        )
      )}
      
      {/* Typing in progress - show skip button */}
      {isTyping && (
        <div className="dialog-skip" style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleContinue}
            style={{
              backgroundColor: 'rgba(40, 50, 80, 0.5)',
              border: '1px solid rgba(80, 100, 150, 0.5)',
              borderRadius: '5px',
              padding: '6px 12px',
              color: '#aaa',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
        </div>
      )}
      
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default DialogBox;
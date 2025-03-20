import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogCharacter, DialogResponse, DialogSegment } from '../types';

interface DialogBoxProps {
  dialog: Dialog;
  currentSegmentIndex: number;
  onResponseSelect: (response: DialogResponse) => void;
  onDialogClose?: () => void;
}

/**
 * Displays character dialog with typewriter text effect and response options
 */
const DialogBox: React.FC<DialogBoxProps> = ({
  dialog,
  currentSegmentIndex,
  onResponseSelect,
  onDialogClose,
}) => {
  const [text, setText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [displayResponses, setDisplayResponses] = useState<boolean>(false);
  const [typingSpeed, setTypingSpeed] = useState<number>(30); // ms per character
  const dialogContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get the current dialog segment
  const currentSegment = dialog.content[currentSegmentIndex];
  
  // Reset text when dialog segment changes
  useEffect(() => {
    setText('');
    setIsTyping(true);
    setDisplayResponses(false);
  }, [currentSegmentIndex, dialog.id]);
  
  // Typewriter effect
  useEffect(() => {
    if (!currentSegment || !isTyping) return;
    
    let currentText = '';
    let index = 0;
    const content = currentSegment.text;
    
    // Function to type character by character
    const typeText = () => {
      if (index < content.length) {
        currentText += content.charAt(index);
        setText(currentText);
        index++;
        
        // Variable typing speed based on punctuation
        let currentSpeed = typingSpeed;
        const currentChar = content.charAt(index - 1);
        if (['.', '!', '?', ',', ';', ':'].includes(currentChar)) {
          // Pause longer at punctuation
          currentSpeed = currentChar === '.' || currentChar === '!' || currentChar === '?' 
            ? typingSpeed * 8  // Longer pause at end of sentences
            : typingSpeed * 3; // Medium pause at commas, etc.
        }
        
        typingTimeout = setTimeout(typeText, currentSpeed);
      } else {
        // Typing finished
        setIsTyping(false);
        setDisplayResponses(true);
      }
    };
    
    // Start typing
    let typingTimeout = setTimeout(typeText, typingSpeed);
    
    // Clean up on unmount or when dialog changes
    return () => {
      clearTimeout(typingTimeout);
    };
  }, [currentSegment, currentSegmentIndex, isTyping, typingSpeed, dialog.id]);
  
  // Complete the text immediately when clicking during typing
  const handleClick = () => {
    if (isTyping) {
      setText(currentSegment.text);
      setIsTyping(false);
      setDisplayResponses(true);
    }
  };
  
  // Handle dialog response selection
  const handleResponseSelect = (response: DialogResponse) => {
    onResponseSelect(response);
  };
  
  // Determine if we need to show close button (end of dialog)
  const isLastSegment = dialog.content.length - 1 === currentSegmentIndex;
  const noResponses = !currentSegment?.responses || currentSegment.responses.length === 0;
  const showCloseButton = isLastSegment && noResponses;
  
  // Helper function to get character avatar or default
  const getCharacterAvatar = () => {
    // If dialog.character is an object with avatarImage
    if (typeof dialog.character === 'object' && dialog.character.avatarImage) {
      return dialog.character.avatarImage;
    }
    
    // Default placeholder avatar
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22%23DDD%22%20d%3D%22M16%200C7.163%200%200%207.163%200%2016s7.163%2016%2016%2016%2016-7.163%2016-16S24.837%200%2016%200zm0%2030c-7.732%200-14-6.268-14-14S8.268%202%2016%202s14%206.268%2014%2014-6.268%2014-14%2014zm1-23a3%203%200%2010-6%200%203%203%200%2006%200zm7%2015c0-4.971-4.029-9-9-9s-9%204.029-9%209h18z%22%2F%3E%3C%2Fsvg%3E';
  };
  
  // Get character name
  const getCharacterName = () => {
    // If dialog.character is an object with name property
    if (typeof dialog.character === 'object' && dialog.character.name) {
      return dialog.character.name;
    }
    
    // If character is just a string
    if (typeof dialog.character === 'string') {
      return dialog.character;
    }
    
    // Default if none specified
    return currentSegment.speaker || 'Unknown';
  };
  
  // Get character name color for styling
  const getNameColor = () => {
    // If dialog.character is an object with nameColor
    if (typeof dialog.character === 'object' && dialog.character.nameColor) {
      return dialog.character.nameColor;
    }
    
    // Default color
    return '#e0d0ff';
  };
  
  return (
    <div
      ref={dialogContainerRef}
      className="dialog-box-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        backgroundColor: 'rgba(20, 15, 30, 0.92)',
        backdropFilter: 'blur(4px)',
        borderRadius: '10px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        padding: '15px',
        color: '#e0e0e8',
        fontFamily: 'serif',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        border: '1px solid rgba(120, 100, 180, 0.5)',
        maxHeight: '40vh',
        overflow: 'hidden'
      }}
    >
      {/* Dialog Header */}
      <div
        className="dialog-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          borderBottom: '1px solid rgba(120, 100, 180, 0.3)',
          paddingBottom: '10px'
        }}
      >
        {/* Character Avatar */}
        <div
          className="dialog-avatar"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(60, 50, 90, 0.5)',
            marginRight: '15px',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid rgba(120, 100, 180, 0.6)',
            backgroundImage: `url(${getCharacterAvatar()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Character Name */}
        <h3
          style={{
            margin: 0,
            color: getNameColor(),
            fontSize: '1.3rem',
            fontWeight: 'bold',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
          }}
        >
          {getCharacterName()}
        </h3>
        
        {/* Close Button */}
        {onDialogClose && (
          <button
            onClick={onDialogClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'rgba(200, 180, 255, 0.8)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(120, 100, 180, 0.3)';
              e.currentTarget.style.color = 'rgba(220, 210, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(200, 180, 255, 0.8)';
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Dialog Content */}
      <div
        ref={contentRef}
        className="dialog-content"
        onClick={handleClick}
        style={{
          fontSize: '1.1rem',
          lineHeight: '1.5',
          marginBottom: '15px',
          padding: '0 5px',
          color: '#e8e8f0',
          cursor: isTyping ? 'pointer' : 'default',
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
        }}
      >
        {text}
        {isTyping && (
          <span
            className="typing-indicator"
            style={{
              display: 'inline-block',
              width: '0.7em',
              height: '1.1em',
              backgroundColor: 'rgba(220, 210, 255, 0.8)',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'blink 0.8s infinite'
            }}
          />
        )}
      </div>
      
      {/* Response Options */}
      {displayResponses && currentSegment.responses && currentSegment.responses.length > 0 && (
        <div
          className="dialog-responses"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '1px solid rgba(120, 100, 180, 0.3)',
            paddingTop: '12px',
            maxHeight: '40%',
            overflowY: 'auto'
          }}
        >
          {currentSegment.responses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleResponseSelect({ ...response, id: `response-${index}` })}
              style={{
                backgroundColor: 'rgba(60, 50, 90, 0.5)',
                border: '1px solid rgba(120, 100, 180, 0.5)',
                borderRadius: '8px',
                padding: '10px 15px',
                textAlign: 'left',
                color: '#d0c0ff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(80, 60, 120, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(140, 120, 200, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(60, 50, 90, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(120, 100, 180, 0.5)';
              }}
            >
              <span style={{ marginRight: '10px' }}>{index + 1}.</span>
              <span style={{ flex: 1 }}>{response.text}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Show close/continue button if at end of dialog with no responses */}
      {showCloseButton && displayResponses && onDialogClose && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '10px',
            borderTop: '1px solid rgba(120, 100, 180, 0.3)',
            paddingTop: '12px'
          }}
        >
          <button
            onClick={onDialogClose}
            style={{
              backgroundColor: 'rgba(80, 60, 120, 0.6)',
              color: '#d0c0ff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(100, 80, 140, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(80, 60, 120, 0.6)';
            }}
          >
            End Conversation
          </button>
        </div>
      )}
      
      {/* CSS animations */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          .dialog-content::-webkit-scrollbar,
          .dialog-responses::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .dialog-content::-webkit-scrollbar-track,
          .dialog-responses::-webkit-scrollbar-track {
            background: rgba(60, 40, 80, 0.1);
            border-radius: 4px;
          }
          
          .dialog-content::-webkit-scrollbar-thumb,
          .dialog-responses::-webkit-scrollbar-thumb {
            background: rgba(120, 100, 180, 0.4);
            border-radius: 4px;
          }
          
          .dialog-content::-webkit-scrollbar-thumb:hover,
          .dialog-responses::-webkit-scrollbar-thumb:hover {
            background: rgba(140, 120, 200, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default DialogBox;
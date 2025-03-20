import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogData, DialogResponse } from '../types';

interface DialogPanelProps {
  dialog: DialogData;
  onResponseSelect: (response: DialogResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DialogPanel: React.FC<DialogPanelProps> = ({
  dialog,
  onResponseSelect,
  isOpen,
  onClose
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [showResponses, setShowResponses] = useState(false);

  // Reset state when dialog changes
  useEffect(() => {
    if (isOpen) {
      setCurrentTextIndex(0);
      setIsTyping(true);
      setDisplayedText('');
      setShowResponses(false);
    }
  }, [isOpen, dialog]);

  // Text typing animation effect
  useEffect(() => {
    if (!isOpen || !isTyping) return;

    const currentDialogText = dialog.text[currentTextIndex];
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < currentDialogText.length) {
        setDisplayedText(currentDialogText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Show responses when we reach the last dialog text
        if (currentTextIndex === dialog.text.length - 1) {
          setShowResponses(true);
        }
      }
    }, 30); // Adjust speed of typing

    return () => clearInterval(typingInterval);
  }, [isOpen, dialog, currentTextIndex, isTyping]);

  const handleContinue = () => {
    if (isTyping) {
      // Skip typing animation
      setIsTyping(false);
      setDisplayedText(dialog.text[currentTextIndex]);
      
      if (currentTextIndex === dialog.text.length - 1) {
        setShowResponses(true);
      }
    } else if (currentTextIndex < dialog.text.length - 1) {
      // Move to next dialog text
      setCurrentTextIndex(prev => prev + 1);
      setIsTyping(true);
      setDisplayedText('');
    }
  };

  const handleResponseClick = (response: DialogResponse) => {
    onResponseSelect(response);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900/80 backdrop-blur-sm w-full max-w-3xl rounded-t-lg overflow-hidden shadow-xl mb-12 border border-gray-700"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            {/* Character Info */}
            <div className="p-3 border-b border-gray-700 flex items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-600">
                <img 
                  src={dialog.character.portrait} 
                  alt={dialog.character.name}
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-amber-500">{dialog.character.name}</h3>
              </div>
              <button 
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Dialog Text */}
            <div 
              className="p-4 min-h-32 text-gray-200"
              onClick={handleContinue}
            >
              {displayedText}
              {isTyping && <span className="animate-pulse">▌</span>}
            </div>
            
            {/* Response Options */}
            {showResponses && (
              <div className="p-4 border-t border-gray-700">
                <div className="space-y-2">
                  {dialog.responses.map((response, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleResponseClick(response)}
                      className="w-full text-left p-2 rounded hover:bg-gray-800 text-gray-300 hover:text-white flex items-center"
                    >
                      <span className="mr-2 text-amber-500">❯</span>
                      {response.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Continue Indicator */}
            {!showResponses && !isTyping && (
              <div className="absolute bottom-3 right-3 animate-bounce text-amber-500">
                ▼
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogPanel;
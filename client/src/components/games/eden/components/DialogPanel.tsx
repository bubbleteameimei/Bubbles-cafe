import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { DialogData, DialogResponse } from '../types';

interface DialogPanelProps {
  dialog: DialogData;
  onResponseSelect: (response: DialogResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DialogPanel: React.FC<DialogPanelProps> = ({
  dialog,
  onResponseSelect,
  isOpen,
  onClose
}) => {
  const [showingText, setShowingText] = useState('');
  const [textDisplayed, setTextDisplayed] = useState(false);
  const [textSpeed] = useState(30); // ms per character
  
  useEffect(() => {
    if (!isOpen || !dialog || !dialog.text) return;
    
    // Reset for new dialog
    setShowingText('');
    setTextDisplayed(false);
    
    // Gradually display text for typewriter effect
    let currentText = '';
    const fullText = dialog.text;
    let charIndex = 0;
    
    const intervalId = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText.charAt(charIndex);
        setShowingText(currentText);
        charIndex++;
      } else {
        clearInterval(intervalId);
        setTextDisplayed(true);
      }
    }, textSpeed);
    
    return () => clearInterval(intervalId);
  }, [dialog, isOpen, textSpeed]);
  
  // Skip to full text on click
  const handleTextClick = () => {
    if (!textDisplayed && dialog) {
      setShowingText(dialog.text);
      setTextDisplayed(true);
    }
  };
  
  if (!isOpen || !dialog) return null;
  
  return (
    <motion.div 
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 30 }}
    >
      <div className="mx-auto max-w-4xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-t-lg overflow-hidden shadow-xl">
        <div className="flex p-4 items-start">
          {/* Character Avatar */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-amber-700">
              {dialog.character?.avatarUrl ? (
                <img 
                  src={dialog.character.avatarUrl} 
                  alt={dialog.character.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-500 font-serif text-xl">
                  {dialog.character?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>
          
          {/* Dialog Content */}
          <div className="flex-1">
            {/* Character Name */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-serif text-amber-300">
                {dialog.character?.name || 'Unknown'}
              </h3>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Dialog Text */}
            <div 
              className="prose prose-sm prose-invert prose-amber mb-4 min-h-[60px]"
              onClick={handleTextClick}
            >
              <p>{showingText}<span className={`cursor ${textDisplayed ? 'hidden' : 'inline-block'}`}>|</span></p>
            </div>
            
            {/* Response Options */}
            <AnimatePresence>
              {textDisplayed && dialog.responses && (
                <motion.div
                  className="space-y-2 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {dialog.responses.map((response, index) => (
                    <motion.button
                      key={index}
                      className="w-full text-left p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-md flex items-center group"
                      onClick={() => onResponseSelect(response)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChevronRight className="text-amber-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                      <span>{response.text}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .cursor {
          animation: blink 1s step-start infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
};

export default DialogPanel;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, User, MessageSquare } from 'lucide-react';
import { Dialog, DialogResponse } from '../types';
import '../styles/dialog.css';

interface DialogPanelProps {
  dialog: Dialog;
  onResponseSelect: (response: DialogResponse) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function DialogPanel({ dialog, onResponseSelect, isOpen, onClose }: DialogPanelProps) {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [textComplete, setTextComplete] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<DialogResponse | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Typewriter effect for the dialog text
  useEffect(() => {
    if (!isOpen || !dialog) return;
    
    let text = dialog.text || '';
    let currentIndex = 0;
    setCurrentText('');
    setIsTyping(true);
    setTextComplete(false);
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setCurrentText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        setTextComplete(true);
        clearInterval(interval);
      }
    }, 30); // Typing speed
    
    return () => clearInterval(interval);
  }, [dialog, isOpen]);
  
  // Scroll to bottom of text as it's typed
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [currentText]);
  
  // Complete the text immediately if user clicks during typing
  const handleTextClick = () => {
    if (isTyping) {
      setCurrentText(dialog.text || '');
      setIsTyping(false);
      setTextComplete(true);
    }
  };
  
  // Handle response selection
  const handleResponseSelect = (response: DialogResponse) => {
    setSelectedResponse(response);
    // Short delay before proceeding with selected response
    setTimeout(() => {
      onResponseSelect(response);
      setSelectedResponse(null);
    }, 500);
  };
  
  if (!isOpen || !dialog) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="dialog-panel fixed bottom-0 left-0 w-full h-1/3 md:h-1/4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 shadow-2xl z-20"
    >
      <div className="absolute top-0 right-0 p-2">
        <button
          onClick={onClose}
          className="p-1 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex h-full p-4">
        {/* Speaker Portrait */}
        {dialog.speaker && (
          <div className="hidden md:block flex-shrink-0 mr-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700">
              {dialog.speakerImage ? (
                <img 
                  src={dialog.speakerImage} 
                  alt={dialog.speaker} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-300">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="text-center mt-1">
              <span className="text-xs text-gray-300">{dialog.speaker}</span>
            </div>
          </div>
        )}
        
        {/* Dialog Content */}
        <div className="flex-1 flex flex-col">
          {/* Speaker Name (Mobile) */}
          {dialog.speaker && (
            <div className="md:hidden mb-2 flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 mr-2">
                {dialog.speakerImage ? (
                  <img 
                    src={dialog.speakerImage} 
                    alt={dialog.speaker} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-300">
                    <User size={16} />
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-300">{dialog.speaker}</span>
            </div>
          )}
          
          {/* Dialog Text */}
          <div 
            ref={textRef}
            onClick={handleTextClick}
            className="dialog-text flex-1 overflow-y-auto text-white mb-4 p-2 rounded bg-gray-800/50"
          >
            <p className="whitespace-pre-line">{currentText}</p>
            {isTyping && <span className="typing-cursor">_</span>}
          </div>
          
          {/* Dialog Responses */}
          {textComplete && dialog.responses && (
            <div className="mt-auto">
              <AnimatePresence>
                <div className="flex flex-col space-y-2">
                  {dialog.responses.map((response, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleResponseSelect(response)}
                      className={`text-left p-2 px-3 rounded-lg flex items-center transition-colors ${
                        selectedResponse === response 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                      }`}
                      disabled={selectedResponse !== null}
                    >
                      <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                      <span>{response.text}</span>
                      <ChevronRight size={16} className="ml-auto flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Dialog Animation CSS */}
      <style jsx>{`
        .typing-cursor {
          display: inline-block;
          animation: blink 0.7s infinite;
        }
        
        @keyframes blink {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
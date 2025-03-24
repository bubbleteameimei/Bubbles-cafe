import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogData } from './types';
import { GameEngine } from './GameEngine';

interface GameDialogProps {
  dialog: DialogData;
  onClose: () => void;
  gameEngine: GameEngine | null;
}

export function GameDialog({ dialog, onClose, gameEngine }: GameDialogProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [currentDisplayText, setCurrentDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showResponses, setShowResponses] = useState(false);
  
  const typewriterSpeed = 30; // ms per character
  
  useEffect(() => {
    setCurrentTextIndex(0);
    setTypewriterIndex(0);
    setCurrentDisplayText('');
    setIsTyping(true);
    setShowResponses(false);
  }, [dialog]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    const currentText = dialog.text[currentTextIndex] || '';
    
    if (typewriterIndex < currentText.length) {
      const timer = setTimeout(() => {
        setCurrentDisplayText(prev => prev + currentText[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, typewriterSpeed);
      
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      
      if (currentTextIndex === dialog.text.length - 1) {
        // Show response options when all text is shown
        setShowResponses(true);
      }
    }
  }, [typewriterIndex, isTyping, currentTextIndex, dialog.text]);
  
  const handleSkipText = () => {
    if (isTyping) {
      // Skip typewriter and show full text
      setCurrentDisplayText(dialog.text[currentTextIndex] || '');
      setTypewriterIndex((dialog.text[currentTextIndex] || '').length);
      setIsTyping(false);
      
      if (currentTextIndex === dialog.text.length - 1) {
        setShowResponses(true);
      }
    } else if (currentTextIndex < dialog.text.length - 1) {
      // Move to next text block
      setCurrentTextIndex(prev => prev + 1);
      setTypewriterIndex(0);
      setCurrentDisplayText('');
      setIsTyping(true);
    } else {
      setShowResponses(true);
    }
  };
  
  const handleResponseClick = (response: any) => {
    if (!gameEngine) return;
    
    // Process response action if any
    if (response.action) {
      switch (response.action) {
        case 'giveItem':
          if (response.itemId) {
            gameEngine.addItemToInventory(response.itemId);
          }
          break;
        
        case 'startPuzzle':
          if (response.puzzleId) {
            // This will be handled by scene transitions
          }
          break;
        
        case 'damagePlayer':
          // This will be handled by scene transitions
          break;
        
        case 'healPlayer':
          // This will be handled by scene transitions
          break;
        
        default:
          break;
      }
    }
    
    // Handle next dialog
    if (response.nextDialog) {
      // This would transition to another dialog
      // Not implemented in this prototype
    }
    
    // Close dialog
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <Card className="bg-black border-amber-900/50 p-0 text-white overflow-hidden">
          {/* Character portrait and name */}
          <div className="flex items-center gap-4 p-4 border-b border-amber-900/30 bg-amber-950/20">
            <div 
              className="w-12 h-12 rounded-full bg-center bg-cover border-2 border-amber-700"
              style={{ backgroundImage: `url(${dialog.character.portrait})` }}
            ></div>
            <h3 className="text-xl font-bold text-amber-50">{dialog.character.name}</h3>
          </div>
          
          {/* Dialog text */}
          <div className="p-4 min-h-[150px]">
            <p className="leading-relaxed text-lg font-serif">
              {currentDisplayText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>
          
          {/* Dialog responses or continue button */}
          <div className="border-t border-amber-900/30 p-4">
            {showResponses ? (
              <div className="grid gap-2">
                <AnimatePresence>
                  {dialog.responses.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full text-left justify-start border-amber-900/50 hover:bg-amber-900/20"
                        onClick={() => handleResponseClick(response)}
                      >
                        {response.text}
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Button 
                variant="outline"
                className="w-full border-amber-900/50 hover:bg-amber-900/20"
                onClick={handleSkipText}
              >
                {isTyping ? 'Skip' : 'Continue'}
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, AlertCircle } from 'lucide-react';
import { PuzzleData } from './types';
import { RunePuzzle } from './puzzles/RunePuzzle';
import { PatternPuzzle } from './puzzles/PatternPuzzle';
import { RiddlePuzzle } from './puzzles/RiddlePuzzle';
import { CombinationPuzzle } from './puzzles/CombinationPuzzle';
import { SacrificePuzzle } from './puzzles/SacrificePuzzle';

interface GamePuzzleProps {
  puzzle: PuzzleData;
  onSolve: (puzzleId: string) => void;
  onClose: () => void;
}

export function GamePuzzle({ puzzle, onSolve, onClose }: GamePuzzleProps) {
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    setAttempts(puzzle.attempts || 0);
  }, [puzzle]);
  
  const handleSolveAttempt = (success: boolean) => {
    if (success) {
      onSolve(puzzle.id);
    } else {
      setAttempts(prev => prev + 1);
      setErrorMessage('Incorrect solution. Try again.');
      
      // Clear error message after 2 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    }
  };
  
  const renderPuzzle = () => {
    switch (puzzle.type) {
      case 'runes':
        return (
          <RunePuzzle 
            data={puzzle.data}
            onSolveAttempt={handleSolveAttempt}
          />
        );
      
      case 'pattern':
        return (
          <PatternPuzzle 
            data={puzzle.data}
            onSolveAttempt={handleSolveAttempt}
          />
        );
      
      case 'riddle':
        return (
          <RiddlePuzzle 
            data={puzzle.data}
            onSolveAttempt={handleSolveAttempt}
          />
        );
      
      case 'combination':
        return (
          <CombinationPuzzle 
            data={puzzle.data}
            onSolveAttempt={handleSolveAttempt}
          />
        );
      
      case 'sacrifice':
        return (
          <SacrificePuzzle 
            data={puzzle.data}
            onSolveAttempt={handleSolveAttempt}
          />
        );
      
      default:
        return (
          <div className="py-8 text-center text-gray-500">
            <p>Unknown puzzle type.</p>
          </div>
        );
    }
  };
  
  const getPuzzleIcon = () => {
    switch (puzzle.type) {
      case 'runes':
        return '🔮';
      case 'pattern':
        return '🧩';
      case 'riddle':
        return '❓';
      case 'combination':
        return '🔐';
      case 'sacrifice':
        return '🔥';
      default:
        return '📜';
    }
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
        <Card className="bg-black border-amber-900/50 p-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">
              <span>{getPuzzleIcon()}</span>
              <span>{puzzle.title}</span>
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-gray-300 mb-6">{puzzle.description}</p>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/30 border border-red-900/50 rounded-md flex items-center gap-2 text-red-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
          
          <div className="puzzle-content mb-6">
            {renderPuzzle()}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Attempts: {attempts}{puzzle.maxAttempts ? `/${puzzle.maxAttempts}` : ''}
            </div>
            
            {puzzle.hint && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-500 hover:text-amber-400 flex items-center gap-1"
                onClick={() => setShowHint(!showHint)}
              >
                <HelpCircle className="h-4 w-4" />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </Button>
            )}
          </div>
          
          {showHint && puzzle.hint && (
            <motion.div
              className="mt-4 p-3 bg-amber-950/20 border border-amber-900/50 rounded-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-amber-200 text-sm">{puzzle.hint}</p>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
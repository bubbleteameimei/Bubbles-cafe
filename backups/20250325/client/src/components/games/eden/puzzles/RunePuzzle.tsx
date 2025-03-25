import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface RunePuzzleProps {
  data: {
    runes: {
      symbol: string;
      meaning: string;
    }[];
    correctSequence: string[];
    question: string;
  };
  onSolveAttempt: (success: boolean) => void;
}

export function RunePuzzle({ data, onSolveAttempt }: RunePuzzleProps) {
  const [selectedRunes, setSelectedRunes] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleRuneClick = (symbol: string) => {
    if (isAnimating) return;
    
    if (selectedRunes.includes(symbol)) {
      // Remove rune if already selected
      setSelectedRunes(selectedRunes.filter(rune => rune !== symbol));
    } else {
      // Add rune to sequence
      setSelectedRunes([...selectedRunes, symbol]);
    }
  };
  
  const handleSubmit = () => {
    // Check if the sequence is correct
    const isCorrect = selectedRunes.length === data.correctSequence.length && 
      selectedRunes.every((rune, index) => rune === data.correctSequence[index]);
    
    // Visual feedback
    setIsAnimating(true);
    
    setTimeout(() => {
      onSolveAttempt(isCorrect);
      setIsAnimating(false);
      
      if (!isCorrect) {
        // Reset selection on failure
        setSelectedRunes([]);
      }
    }, 1000);
  };
  
  const handleReset = () => {
    setSelectedRunes([]);
  };
  
  return (
    <div className="rune-puzzle">
      <div className="mb-4">
        <p className="text-amber-50 mb-2">{data.question}</p>
        
        {/* Rune display area */}
        <div className="flex justify-center mb-4 gap-2 flex-wrap">
          {data.runes.map((rune, index) => (
            <motion.div
              key={index}
              className={`p-4 border rounded-md cursor-pointer transition-all select-none
                ${selectedRunes.includes(rune.symbol) 
                  ? 'border-amber-500 bg-amber-950' 
                  : 'border-gray-700 hover:border-amber-700 bg-gray-950'}`}
              onClick={() => handleRuneClick(rune.symbol)}
              animate={
                isAnimating && selectedRunes.includes(rune.symbol)
                  ? { scale: [1, 1.1, 1], 
                      borderColor: ['rgb(245, 158, 11)', 'rgb(220, 38, 38)', 'rgb(245, 158, 11)'] 
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              <div className="text-2xl font-rune text-center">{rune.symbol}</div>
              <div className="text-xs text-gray-400 mt-1 text-center">{rune.meaning}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Selected sequence display */}
        <div className="bg-gray-900 p-3 rounded-md mb-4">
          <div className="text-sm text-gray-400 mb-2">Selected Sequence:</div>
          <div className="flex justify-center gap-2">
            {selectedRunes.length > 0 ? (
              selectedRunes.map((symbol, index) => (
                <motion.div
                  key={index}
                  className="h-10 w-10 flex items-center justify-center border border-amber-700 bg-amber-950/50 rounded-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-lg font-rune">{symbol}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500 italic">No runes selected</div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-red-900/50 hover:bg-red-900/20 text-red-400"
            onClick={handleReset}
            disabled={selectedRunes.length === 0 || isAnimating}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-amber-900/50 hover:bg-amber-900/20 text-amber-400"
            onClick={handleSubmit}
            disabled={selectedRunes.length === 0 || isAnimating}
          >
            Submit
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        @font-face {
          font-family: 'RunicFont';
          src: url('/fonts/runic.woff2') format('woff2');
        }
        
        .font-rune {
          font-family: 'RunicFont', serif;
        }
      `}</style>
    </div>
  );
}
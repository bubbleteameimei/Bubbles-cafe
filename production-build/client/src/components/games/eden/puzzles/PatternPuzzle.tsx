import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface PatternPuzzleProps {
  data: {
    gridSize: number;
    correctPattern: number[];
    description: string;
    theme: string;
  };
  onSolveAttempt: (success: boolean) => void;
}

export function PatternPuzzle({ data, onSolveAttempt }: PatternPuzzleProps) {
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleCellClick = (index: number) => {
    if (isAnimating) return;
    
    if (selectedCells.includes(index)) {
      // Remove cell if already selected
      setSelectedCells(selectedCells.filter(cell => cell !== index));
    } else {
      // Add cell to pattern
      setSelectedCells([...selectedCells, index]);
    }
  };
  
  const handleSubmit = () => {
    // Check if the pattern is correct
    const isCorrect = selectedCells.length === data.correctPattern.length && 
      selectedCells.every((cell, index) => cell === data.correctPattern[index]);
    
    // Visual feedback
    setIsAnimating(true);
    
    setTimeout(() => {
      onSolveAttempt(isCorrect);
      setIsAnimating(false);
      
      if (!isCorrect) {
        // Reset selection on failure
        setSelectedCells([]);
      }
    }, 1000);
  };
  
  const handleReset = () => {
    setSelectedCells([]);
  };
  
  // Generate the grid based on the specified size
  const gridCells = Array.from({ length: data.gridSize * data.gridSize }, (_, i) => i);
  
  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (data.theme) {
      case 'blood':
        return {
          active: 'border-red-700 bg-red-950',
          hover: 'hover:border-red-600',
          grid: 'grid-cols-3 gap-2',
          animation: { borderColor: ['rgb(185, 28, 28)', 'rgb(220, 38, 38)', 'rgb(185, 28, 28)'] }
        };
      
      case 'arcane':
        return {
          active: 'border-purple-700 bg-purple-950',
          hover: 'hover:border-purple-600',
          grid: 'grid-cols-4 gap-1',
          animation: { borderColor: ['rgb(126, 34, 206)', 'rgb(91, 33, 182)', 'rgb(126, 34, 206)'] }
        };
      
      case 'nature':
        return {
          active: 'border-green-700 bg-green-950',
          hover: 'hover:border-green-600',
          grid: 'grid-cols-5 gap-1',
          animation: { borderColor: ['rgb(21, 128, 61)', 'rgb(22, 163, 74)', 'rgb(21, 128, 61)'] }
        };
      
      case 'spirit':
        return {
          active: 'border-cyan-700 bg-cyan-950',
          hover: 'hover:border-cyan-600',
          grid: 'grid-cols-3 gap-3',
          animation: { borderColor: ['rgb(14, 116, 144)', 'rgb(8, 145, 178)', 'rgb(14, 116, 144)'] }
        };
      
      default:
        return {
          active: 'border-amber-700 bg-amber-950',
          hover: 'hover:border-amber-600',
          grid: `grid-cols-${Math.sqrt(data.gridSize)} gap-2`,
          animation: { borderColor: ['rgb(217, 119, 6)', 'rgb(245, 158, 11)', 'rgb(217, 119, 6)'] }
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  
  return (
    <div className="pattern-puzzle">
      <div className="mb-4">
        <p className="text-amber-50 mb-4">{data.description}</p>
        
        {/* Pattern grid */}
        <div className={`grid ${themeStyles.grid} mb-6`}>
          {gridCells.map(index => (
            <motion.div
              key={index}
              className={`aspect-square border-2 rounded-md cursor-pointer transition-all
                ${selectedCells.includes(index) 
                  ? themeStyles.active
                  : `border-gray-700 ${themeStyles.hover} bg-gray-950`}`}
              onClick={() => handleCellClick(index)}
              animate={
                isAnimating && selectedCells.includes(index)
                  ? { scale: [1, 1.1, 1], borderColor: themeStyles.animation.borderColor }
                  : {}
              }
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
        
        {/* Selected sequence display */}
        <div className="bg-gray-900 p-3 rounded-md mb-4">
          <div className="text-sm text-gray-400 mb-2">Current Pattern:</div>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedCells.length > 0 ? (
              selectedCells.map((cell, index) => (
                <motion.div
                  key={index}
                  className="h-8 w-8 flex items-center justify-center border border-gray-700 bg-gray-800 rounded-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-xs text-gray-300">{cell + 1}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500 italic">No pattern selected</div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 border-red-900/50 hover:bg-red-900/20 text-red-400"
            onClick={handleReset}
            disabled={selectedCells.length === 0 || isAnimating}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-amber-900/50 hover:bg-amber-900/20 text-amber-400"
            onClick={handleSubmit}
            disabled={selectedCells.length === 0 || isAnimating}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
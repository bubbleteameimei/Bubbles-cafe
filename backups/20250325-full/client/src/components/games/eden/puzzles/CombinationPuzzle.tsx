import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CombinationPuzzleProps {
  data: {
    lockType: 'numerical' | 'directional' | 'color';
    combination: (number | string)[];
    description: string;
    maxAttempts?: number;
  };
  onSolveAttempt: (success: boolean) => void;
}

export function CombinationPuzzle({ data, onSolveAttempt }: CombinationPuzzleProps) {
  const [selectedCombination, setSelectedCombination] = useState<(number | string)[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Define options based on lock type
  const getOptions = () => {
    switch (data.lockType) {
      case 'numerical':
        return Array.from({ length: 10 }, (_, i) => i);
      
      case 'directional':
        return ['up', 'down', 'left', 'right'];
      
      case 'color':
        return ['red', 'blue', 'green', 'yellow', 'purple'];
      
      default:
        return [];
    }
  };
  
  const options = getOptions();
  
  const handleOptionClick = (option: number | string) => {
    if (isAnimating) return;
    
    // Add to combination if not at max length
    if (selectedCombination.length < data.combination.length) {
      setSelectedCombination([...selectedCombination, option]);
    }
  };
  
  const handleRemoveDigit = (index: number) => {
    if (isAnimating) return;
    
    setSelectedCombination(
      selectedCombination.filter((_, i) => i !== index)
    );
  };
  
  const handleClear = () => {
    if (isAnimating) return;
    
    setSelectedCombination([]);
  };
  
  const handleSubmit = () => {
    // Only allow submission if the combination is complete
    if (selectedCombination.length !== data.combination.length) return;
    
    // Check if the combination is correct
    const isCorrect = selectedCombination.every(
      (value, index) => value === data.combination[index]
    );
    
    // Visual feedback
    setIsAnimating(true);
    
    setTimeout(() => {
      onSolveAttempt(isCorrect);
      setIsAnimating(false);
      
      if (!isCorrect) {
        // Clear combination on failure
        setSelectedCombination([]);
      }
    }, 1000);
  };
  
  // Render the display for the current lock type
  const renderLockDisplay = () => {
    return (
      <div className="mb-6 p-4 border border-gray-700 rounded-md bg-gray-900">
        <div className="flex justify-center items-center gap-2">
          {Array.from({ length: data.combination.length }, (_, i) => (
            <motion.div
              key={i}
              className={`h-12 w-12 flex items-center justify-center rounded-md border-2 ${
                selectedCombination[i] !== undefined 
                  ? 'border-amber-600 bg-amber-950'
                  : 'border-gray-700 bg-gray-800'
              }`}
              animate={
                isAnimating
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              onClick={() => {
                if (selectedCombination[i] !== undefined) {
                  handleRemoveDigit(i);
                }
              }}
              transition={{ duration: 0.3 }}
            >
              {selectedCombination[i] !== undefined ? (
                <DisplayOption 
                  option={selectedCombination[i]} 
                  lockType={data.lockType} 
                />
              ) : (
                <span className="text-gray-500">●</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render options pad based on lock type
  const renderOptionsPad = () => {
    return (
      <div className={`grid ${data.lockType === 'numerical' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-4`}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            className={`h-12 border-gray-700 bg-gray-900 hover:bg-gray-800 ${
              data.lockType === 'color' ? 'relative overflow-hidden' : ''
            }`}
            onClick={() => handleOptionClick(option)}
            disabled={isAnimating}
          >
            <DisplayOption option={option} lockType={data.lockType} />
          </Button>
        ))}
        
        {data.lockType === 'numerical' && (
          // Special case for numerical lock - add a "0" button in proper location
          <Button
            variant="outline"
            className="h-12 border-gray-700 bg-gray-900 hover:bg-gray-800"
            onClick={() => handleOptionClick(0)}
            disabled={isAnimating}
          >
            0
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div className="combination-puzzle">
      <p className="text-amber-50 mb-4">{data.description}</p>
      
      {/* Lock display */}
      {renderLockDisplay()}
      
      {/* Options pad */}
      {renderOptionsPad()}
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 border-red-900/50 hover:bg-red-900/20 text-red-400"
          onClick={handleClear}
          disabled={selectedCombination.length === 0 || isAnimating}
        >
          Clear
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 border-amber-900/50 hover:bg-amber-900/20 text-amber-400"
          onClick={handleSubmit}
          disabled={selectedCombination.length !== data.combination.length || isAnimating}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

// Helper component to display different option types
function DisplayOption({ 
  option, 
  lockType 
}: { 
  option: number | string; 
  lockType: 'numerical' | 'directional' | 'color';
}) {
  if (lockType === 'numerical') {
    return <span>{option}</span>;
  }
  
  if (lockType === 'directional') {
    switch (option) {
      case 'up':
        return <span>↑</span>;
      case 'down':
        return <span>↓</span>;
      case 'left':
        return <span>←</span>;
      case 'right':
        return <span>→</span>;
      default:
        return <span>?</span>;
    }
  }
  
  if (lockType === 'color') {
    const getColorClass = () => {
      switch (option) {
        case 'red':
          return 'bg-red-600';
        case 'blue':
          return 'bg-blue-600';
        case 'green':
          return 'bg-green-600';
        case 'yellow':
          return 'bg-yellow-500';
        case 'purple':
          return 'bg-purple-600';
        default:
          return 'bg-gray-600';
      }
    };
    
    return (
      <>
        <div className={`absolute inset-0 opacity-80 ${getColorClass()}`}></div>
        <span className="relative text-white">{option}</span>
      </>
    );
  }
  
  return <span>{option}</span>;
}
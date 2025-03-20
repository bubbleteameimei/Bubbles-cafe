import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PuzzleData, 
  RunePuzzleData, 
  PatternPuzzleData, 
  RiddlePuzzleData, 
  CombinationPuzzleData,
  SacrificePuzzleData
} from '../types';

interface PuzzlePanelProps {
  puzzle: PuzzleData;
  onSolve: (puzzleId: string, solution: any) => void;
  onClose: () => void;
  isOpen: boolean;
  attempts: number;
}

export const PuzzlePanel: React.FC<PuzzlePanelProps> = ({
  puzzle,
  onSolve,
  onClose,
  isOpen,
  attempts
}) => {
  const [solution, setSolution] = useState<any>('');
  const [showHint, setShowHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Render different puzzle interfaces based on type
  const renderPuzzleInterface = () => {
    switch (puzzle.type) {
      case 'riddle':
        return renderRiddlePuzzle(puzzle.data as RiddlePuzzleData);
      case 'pattern':
        return renderPatternPuzzle(puzzle.data as PatternPuzzleData);
      case 'runes':
        return renderRunePuzzle(puzzle.data as RunePuzzleData);
      case 'combination':
        return renderCombinationPuzzle(puzzle.data as CombinationPuzzleData);
      case 'sacrifice':
        return renderSacrificePuzzle(puzzle.data as SacrificePuzzleData);
      default:
        return <div>Unknown puzzle type</div>;
    }
  };

  // Check the solution and handle success/failure
  const checkSolution = () => {
    // Each puzzle type needs its own validation logic
    let isCorrect = false;

    switch (puzzle.type) {
      case 'riddle':
        const riddleData = puzzle.data as RiddlePuzzleData;
        const normalizedAnswer = riddleData.caseSensitive 
          ? solution 
          : solution.toLowerCase();
        
        const correctAnswer = riddleData.caseSensitive 
          ? riddleData.answer 
          : riddleData.answer.toLowerCase();
        
        const alternateAnswers = riddleData.alternateAnswers?.map(ans => 
          riddleData.caseSensitive ? ans : ans.toLowerCase()
        ) || [];
        
        isCorrect = normalizedAnswer === correctAnswer || alternateAnswers.includes(normalizedAnswer);
        break;

      case 'combination':
        const combinationData = puzzle.data as CombinationPuzzleData;
        isCorrect = Array.isArray(solution) && 
          JSON.stringify(solution) === JSON.stringify(combinationData.combination);
        break;

      case 'pattern':
        const patternData = puzzle.data as PatternPuzzleData;
        isCorrect = Array.isArray(solution) && 
          JSON.stringify(solution) === JSON.stringify(patternData.correctPattern);
        break;

      case 'runes':
        const runeData = puzzle.data as RunePuzzleData;
        isCorrect = Array.isArray(solution) && 
          JSON.stringify(solution) === JSON.stringify(runeData.correctSequence);
        break;

      case 'sacrifice':
        const sacrificeData = puzzle.data as SacrificePuzzleData;
        // For sacrifice puzzles, the solution might be an array of selected items
        // We need to sum their values and check against the target
        if (Array.isArray(solution)) {
          const totalValue = solution.reduce((sum, itemId) => {
            const item = sacrificeData.items.find(i => i.id === itemId);
            return sum + (item?.value || 0);
          }, 0);
          isCorrect = totalValue === sacrificeData.targetValue;
        }
        break;
    }

    if (isCorrect) {
      onSolve(puzzle.id, solution);
    } else {
      setErrorMessage('That solution is incorrect. Try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Riddle puzzle interface
  const renderRiddlePuzzle = (data: RiddlePuzzleData) => (
    <div className="space-y-4">
      <div className="bg-gray-700/50 p-4 rounded-lg">
        <p className="text-center italic">{data.riddle}</p>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Your Answer:</label>
        <input
          type="text"
          value={solution as string}
          onChange={(e) => setSolution(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
          placeholder="Enter your answer"
        />
      </div>
    </div>
  );

  // Pattern puzzle interface
  const renderPatternPuzzle = (data: PatternPuzzleData) => {
    const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
    
    const handleTileClick = (index: number) => {
      if (selectedTiles.includes(index)) {
        setSelectedTiles(selectedTiles.filter(i => i !== index));
      } else {
        setSelectedTiles([...selectedTiles, index]);
      }
      
      setSolution(selectedTiles);
    };
    
    const getThemeColors = () => {
      switch (data.theme) {
        case 'blood': return { bg: 'bg-red-900/30', active: 'bg-red-600' };
        case 'spirit': return { bg: 'bg-blue-900/30', active: 'bg-blue-600' };
        case 'arcane': return { bg: 'bg-purple-900/30', active: 'bg-purple-600' };
        default: return { bg: 'bg-gray-800', active: 'bg-gray-600' };
      }
    };
    
    const colors = getThemeColors();
    
    return (
      <div className="space-y-4">
        <p className="text-center">{data.description}</p>
        
        <div className={`grid grid-cols-${Math.sqrt(data.gridSize)} gap-2 mt-4`}>
          {Array.from({ length: data.gridSize }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleTileClick(i)}
              className={`w-12 h-12 rounded-md ${
                selectedTiles.includes(i) ? colors.active : colors.bg
              } transition-colors duration-200`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Rune puzzle interface
  const renderRunePuzzle = (data: RunePuzzleData) => {
    const [selectedRunes, setSelectedRunes] = useState<string[]>([]);
    
    const handleRuneClick = (rune: string) => {
      if (selectedRunes.includes(rune)) {
        setSelectedRunes(selectedRunes.filter(r => r !== rune));
      } else {
        setSelectedRunes([...selectedRunes, rune]);
      }
      
      setSolution(selectedRunes);
    };
    
    return (
      <div className="space-y-4">
        <p className="text-center">{data.question}</p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {data.runes.map((rune, i) => (
            <button
              key={i}
              onClick={() => handleRuneClick(rune.symbol)}
              className={`w-14 h-14 flex items-center justify-center rounded-md ${
                selectedRunes.includes(rune.symbol) 
                  ? 'bg-amber-700 border-2 border-amber-400' 
                  : 'bg-gray-700/50'
              } text-2xl`}
            >
              {rune.symbol}
            </button>
          ))}
        </div>
        
        <div className="mt-4 min-h-8">
          <div className="flex justify-center space-x-1">
            {selectedRunes.map((rune, i) => (
              <span key={i} className="text-lg bg-gray-700 px-2 py-1 rounded">{rune}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Combination puzzle interface
  const renderCombinationPuzzle = (data: CombinationPuzzleData) => {
    const [code, setCode] = useState<(number | string)[]>([]);
    
    const handleInput = (value: number | string) => {
      if (code.length < data.combination.length) {
        const newCode = [...code, value];
        setCode(newCode);
        setSolution(newCode);
      }
    };
    
    const clearInput = () => {
      setCode([]);
      setSolution([]);
    };
    
    return (
      <div className="space-y-4">
        <p className="text-center">{data.description}</p>
        
        <div className="mt-4">
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: data.combination.length }).map((_, i) => (
              <div 
                key={i} 
                className="w-10 h-10 border-2 border-gray-500 rounded-md flex items-center justify-center text-lg"
              >
                {code[i] !== undefined ? code[i] : '?'}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {data.lockType === 'numerical' ? (
              // Numerical pad
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'X'].map((num, i) => (
                  <button
                    key={i}
                    onClick={() => num === 'X' ? clearInput() : num !== null && handleInput(num)}
                    className={`w-12 h-12 rounded-md ${
                      num === null 
                        ? 'invisible' 
                        : num === 'X' 
                          ? 'bg-red-700 hover:bg-red-600' 
                          : 'bg-gray-700 hover:bg-gray-600'
                    } flex items-center justify-center`}
                  >
                    {num === 'X' ? '✕' : num}
                  </button>
                ))}
              </>
            ) : (
              // Color or symbol pad for other lock types
              <p>Combination interface for {data.lockType} lock</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Sacrifice puzzle interface
  const renderSacrificePuzzle = (data: SacrificePuzzleData) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    
    const handleItemToggle = (itemId: string) => {
      if (selectedItems.includes(itemId)) {
        setSelectedItems(selectedItems.filter(id => id !== itemId));
      } else if (selectedItems.length < data.maxSelections) {
        setSelectedItems([...selectedItems, itemId]);
      }
      
      setSolution(selectedItems);
    };
    
    // Calculate current total value of selected items
    const currentValue = selectedItems.reduce((total, itemId) => {
      const item = data.items.find(i => i.id === itemId);
      return total + (item?.value || 0);
    }, 0);
    
    return (
      <div className="space-y-4">
        <p className="text-center">{data.description}</p>
        
        <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg">
          <span>Target: {data.targetValue}</span>
          <span>Current: {currentValue}</span>
          <span>Remaining: {data.targetValue - currentValue}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemToggle(item.id)}
              className={`p-3 rounded-lg ${
                selectedItems.includes(item.id) 
                  ? 'bg-amber-700/70 border border-amber-500' 
                  : 'bg-gray-700/50 border border-gray-600'
              } text-left`}
              disabled={!selectedItems.includes(item.id) && selectedItems.length >= data.maxSelections}
            >
              <div className="flex justify-between">
                <span className="font-medium">{item.name}</span>
                <span className="text-amber-400">{item.value}</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">{item.type}</div>
              <div className="text-xs text-gray-400 mt-1">{item.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-800 w-full max-w-xl rounded-lg overflow-hidden shadow-2xl border border-gray-700"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Puzzle Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-serif text-amber-500">{puzzle.title}</h2>
              <div className="text-sm text-gray-400">
                Attempts: {attempts}
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Puzzle Description */}
            <div className="p-4 border-b border-gray-700">
              <p>{puzzle.description}</p>
            </div>
            
            {/* Puzzle Interface */}
            <div className="p-6">
              {renderPuzzleInterface()}
              
              {errorMessage && (
                <div className="mt-4 text-red-400 text-center">
                  {errorMessage}
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                
                <button
                  onClick={checkSolution}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-md text-sm"
                >
                  Submit Solution
                </button>
              </div>
              
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-gray-700/50 border border-gray-600 rounded-md"
                >
                  <p className="text-sm italic">{puzzle.hint}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PuzzlePanel;
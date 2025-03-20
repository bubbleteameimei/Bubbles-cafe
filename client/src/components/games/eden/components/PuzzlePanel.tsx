import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import { Puzzle, PuzzleType, RiddlePuzzleData, PatternPuzzleData, CombinationPuzzleData, RunesPuzzleData, SacrificePuzzleData } from '../types';

interface PuzzlePanelProps {
  puzzle: Puzzle;
  onSolve: (puzzleId: string, solution: any) => void;
  onClose: () => void;
  isOpen: boolean;
  attempts: number;
}

export default function PuzzlePanel({ puzzle, onSolve, onClose, isOpen, attempts }: PuzzlePanelProps) {
  const [solution, setSolution] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [patternSelection, setPatternSelection] = useState<number[]>([]);
  const [digitInput, setDigitInput] = useState<string[]>([]);
  const [runeSelection, setRuneSelection] = useState<string[]>([]);
  
  // Reset solution state when puzzle changes
  useEffect(() => {
    setSolution(null);
    setError(null);
    setHint(false);
    setSelectedItems([]);
    setPatternSelection([]);
    setDigitInput(Array(puzzle.data.type === 'combination' ? (puzzle.data as CombinationPuzzleData).digits?.length || 4 : 0).fill(''));
    setRuneSelection([]);
  }, [puzzle]);
  
  if (!isOpen) return null;
  
  // Render appropriate puzzle interface based on type
  const renderPuzzleInterface = () => {
    switch (puzzle.data.type) {
      case 'riddle':
        return renderRiddlePuzzle(puzzle.data as RiddlePuzzleData);
      case 'pattern':
        return renderPatternPuzzle(puzzle.data as PatternPuzzleData);
      case 'combination':
        return renderCombinationPuzzle(puzzle.data as CombinationPuzzleData);
      case 'runes':
        return renderRunesPuzzle(puzzle.data as RunesPuzzleData);
      case 'sacrifice':
        return renderSacrificePuzzle(puzzle.data as SacrificePuzzleData);
      default:
        return (
          <div className="text-white text-center p-4">
            <AlertCircle className="mx-auto mb-2 text-yellow-400" size={24} />
            <p>Unknown puzzle type.</p>
          </div>
        );
    }
  };
  
  // Render a riddle puzzle
  const renderRiddlePuzzle = (data: RiddlePuzzleData) => {
    return (
      <div className="p-4">
        <h3 className="text-xl text-white mb-4">{data.question}</h3>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-gray-300 italic">{puzzle.description}</p>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Enter your answer..."
            value={solution || ''}
            onChange={(e) => {
              setSolution(e.target.value);
              setError(null);
            }}
          />
        </div>
        
        {hint && data.hint && (
          <div className="bg-gray-800/80 p-3 rounded-md mb-4 text-gray-300 text-sm">
            <p><span className="text-yellow-400 font-semibold">Hint:</span> {data.hint}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Render a pattern-matching puzzle
  const renderPatternPuzzle = (data: PatternPuzzleData) => {
    return (
      <div className="p-4">
        <p className="text-gray-300 mb-4">{data.description}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          {data.patterns.map((pattern, index) => (
            <button
              key={index}
              className={`aspect-square bg-gray-800 rounded-md flex items-center justify-center transition-all ${
                patternSelection.includes(index) ? 'ring-2 ring-purple-500 bg-gray-700' : ''
              }`}
              onClick={() => {
                const newSelection = patternSelection.includes(index)
                  ? patternSelection.filter(i => i !== index)
                  : [...patternSelection, index];
                setPatternSelection(newSelection);
                setSolution(newSelection);
                setError(null);
              }}
            >
              {pattern.image ? (
                <img src={pattern.image} alt={`Pattern ${index + 1}`} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-lg text-white">{pattern.symbol || `#${index + 1}`}</div>
              )}
            </button>
          ))}
        </div>
        
        {hint && data.hint && (
          <div className="bg-gray-800/80 p-3 rounded-md mb-4 text-gray-300 text-sm">
            <p><span className="text-yellow-400 font-semibold">Hint:</span> {data.hint}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Render a combination lock puzzle
  const renderCombinationPuzzle = (data: CombinationPuzzleData) => {
    return (
      <div className="p-4">
        <p className="text-gray-300 mb-4">{data.description}</p>
        
        <div className="flex justify-center space-x-2 mb-6">
          {data.digits && data.digits.map((digitOptions, digitIndex) => (
            <div key={digitIndex} className="relative">
              <select
                className="appearance-none bg-gray-800 text-white text-2xl text-center w-12 h-16 rounded border border-gray-700 focus:border-purple-500 focus:outline-none"
                value={digitInput[digitIndex] || ''}
                onChange={(e) => {
                  const newDigits = [...digitInput];
                  newDigits[digitIndex] = e.target.value;
                  setDigitInput(newDigits);
                  setSolution(newDigits.join(''));
                  setError(null);
                }}
              >
                <option value="">-</option>
                {digitOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute -bottom-1 left-0 w-full flex justify-center">
                <button
                  className="bg-gray-900 text-gray-400 hover:text-white rounded-full p-1 text-xs"
                  onClick={() => {
                    const currentIndex = digitOptions.indexOf(digitInput[digitIndex]);
                    const nextValue = digitOptions[(currentIndex + 1) % digitOptions.length] || digitOptions[0];
                    const newDigits = [...digitInput];
                    newDigits[digitIndex] = nextValue;
                    setDigitInput(newDigits);
                    setSolution(newDigits.join(''));
                    setError(null);
                  }}
                >
                  ▲
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {hint && data.hint && (
          <div className="bg-gray-800/80 p-3 rounded-md mb-4 text-gray-300 text-sm">
            <p><span className="text-yellow-400 font-semibold">Hint:</span> {data.hint}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Render a runes puzzle
  const renderRunesPuzzle = (data: RunesPuzzleData) => {
    return (
      <div className="p-4">
        <p className="text-gray-300 mb-4">{data.description}</p>
        
        <div className="grid grid-cols-4 gap-3 mb-6">
          {data.runes.map((rune, index) => (
            <button
              key={index}
              className={`aspect-square bg-gray-800 rounded-md p-2 flex items-center justify-center transition-all ${
                runeSelection.includes(rune.id) ? 'ring-2 ring-purple-500 bg-gray-700' : ''
              }`}
              onClick={() => {
                const newSelection = runeSelection.includes(rune.id)
                  ? runeSelection.filter(id => id !== rune.id)
                  : [...runeSelection, rune.id];
                setRuneSelection(newSelection);
                setSolution(newSelection);
                setError(null);
              }}
            >
              {rune.image ? (
                <img src={rune.image} alt={rune.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-xl text-white">{rune.symbol || rune.name}</div>
              )}
            </button>
          ))}
        </div>
        
        <div className="bg-gray-800 p-3 rounded-md mb-4">
          <p className="text-gray-300 text-sm">Selected sequence: {runeSelection.length > 0 
            ? runeSelection.map(id => data.runes.find(r => r.id === id)?.name || id).join(' → ') 
            : 'None'}
          </p>
        </div>
        
        {hint && data.hint && (
          <div className="bg-gray-800/80 p-3 rounded-md mb-4 text-gray-300 text-sm">
            <p><span className="text-yellow-400 font-semibold">Hint:</span> {data.hint}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Render a sacrifice puzzle
  const renderSacrificePuzzle = (data: SacrificePuzzleData) => {
    return (
      <div className="p-4">
        <p className="text-gray-300 mb-4">{data.description}</p>
        
        <div className="mb-2 flex justify-between items-center">
          <span className="text-white text-sm">Target Value: {data.targetValue}</span>
          <span className="text-white text-sm">Max Selections: {data.maxSelections}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {data.items.map((item) => (
            <button
              key={item.id}
              className={`p-2 bg-gray-800 rounded-md flex flex-col items-center transition-all ${
                selectedItems.includes(item.id) 
                  ? 'ring-2 ring-purple-500 bg-gray-700' 
                  : 'hover:bg-gray-700/70'
              }`}
              onClick={() => {
                if (selectedItems.includes(item.id)) {
                  // Remove item if already selected
                  const newSelection = selectedItems.filter(i => i !== item.id);
                  setSelectedItems(newSelection);
                  setSolution(newSelection);
                } else if (selectedItems.length < data.maxSelections) {
                  // Add item if under max selections
                  const newSelection = [...selectedItems, item.id];
                  setSelectedItems(newSelection);
                  setSolution(newSelection);
                } else {
                  // Show error if max selections reached
                  setError(`You can only select up to ${data.maxSelections} items.`);
                  setTimeout(() => setError(null), 2000);
                  return;
                }
                setError(null);
              }}
            >
              <div className="w-12 h-12 bg-gray-900 rounded overflow-hidden mb-1">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    {item.value}
                  </div>
                )}
              </div>
              <span className="text-xs text-white">{item.name}</span>
              <span className="text-xs text-purple-300 mt-1">Value: {item.value}</span>
            </button>
          ))}
        </div>
        
        <div className="bg-gray-800 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">
              Selected: {selectedItems.length}/{data.maxSelections}
            </span>
            <span className="text-white text-sm font-semibold">
              Total Value: {selectedItems.length > 0 
                ? data.items.filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + item.value, 0) 
                : 0} / {data.targetValue}
            </span>
          </div>
        </div>
        
        {hint && data.hint && (
          <div className="bg-gray-800/80 p-3 rounded-md mb-4 text-gray-300 text-sm">
            <p><span className="text-yellow-400 font-semibold">Hint:</span> {data.hint}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 text-red-300 p-2 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  };
  
  // Main component render
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center"
          onClick={() => onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden max-w-md w-11/12 mx-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the panel
          >
            {/* Puzzle Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-xl text-white font-semibold">{puzzle.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close puzzle"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Puzzle Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {renderPuzzleInterface()}
            </div>
            
            {/* Puzzle Footer */}
            <div className="bg-gray-800 p-4 flex justify-between items-center border-t border-gray-700">
              <div>
                <button
                  onClick={() => setHint(true)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center transition-colors"
                  disabled={hint}
                >
                  <Search size={16} className="mr-1" />
                  {hint ? 'Hint shown' : 'Get hint'}
                </button>
                <span className="text-gray-500 text-xs ml-3">
                  Attempts: {attempts}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (!solution) {
                    setError('You need to provide a solution first.');
                    return;
                  }
                  onSolve(puzzle.id, solution);
                }}
                className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                disabled={!solution}
              >
                <Check size={16} className="mr-2" />
                Submit
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
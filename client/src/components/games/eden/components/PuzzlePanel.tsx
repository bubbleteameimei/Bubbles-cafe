import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, AlertTriangle } from 'lucide-react';
import { PuzzleData } from '../types';

interface PuzzlePanelProps {
  puzzle: PuzzleData;
  onSolve: (puzzleId: string, solution: any) => void;
  onClose: () => void;
  isOpen: boolean;
  attempts: number;
}

const PuzzlePanel: React.FC<PuzzlePanelProps> = ({
  puzzle,
  onSolve,
  onClose,
  isOpen,
  attempts
}) => {
  const [solution, setSolution] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  
  if (!isOpen || !puzzle) return null;
  
  const handleSubmit = () => {
    onSolve(puzzle.id, solution);
  };
  
  // Different puzzle types have different solution UIs
  const renderPuzzleContent = () => {
    switch (puzzle.type) {
      case 'riddle':
        return (
          <div>
            <p className="text-lg mb-6">{puzzle.data.question}</p>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Your Answer:</label>
              <input
                type="text"
                value={solution || ''}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Enter your answer..."
              />
            </div>
          </div>
        );
        
      case 'pattern':
        // Pattern selection puzzle (e.g., selecting symbols in correct order)
        return (
          <div>
            <p className="mb-6">{puzzle.data.description}</p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {puzzle.data.patterns.map((pattern, index) => (
                <button
                  key={index}
                  className={`w-full aspect-square bg-gray-800 rounded-md flex items-center justify-center border-2 ${
                    (solution || []).includes(index) ? 'border-amber-500' : 'border-transparent'
                  }`}
                  onClick={() => {
                    const currentSolution = [...(solution || [])];
                    const patternIndex = currentSolution.indexOf(index);
                    
                    if (patternIndex >= 0) {
                      // Remove if already selected
                      currentSolution.splice(patternIndex, 1);
                    } else {
                      // Add to selection
                      currentSolution.push(index);
                    }
                    
                    setSolution(currentSolution);
                  }}
                >
                  {pattern.symbol ? (
                    <span className="text-2xl">{pattern.symbol}</span>
                  ) : (
                    <div 
                      className="w-3/4 h-3/4 rounded"
                      style={{ 
                        backgroundColor: pattern.color || 'gray',
                        backgroundImage: pattern.image ? `url(${pattern.image})` : 'none',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    ></div>
                  )}
                </button>
              ))}
            </div>
            
            {solution && solution.length > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-sm text-gray-400">Selected order:</span>
                <div className="flex space-x-1">
                  {solution.map((index: number, i: number) => (
                    <span key={i} className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full text-xs">
                      {index + 1}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'combination':
        // Combination lock puzzle
        return (
          <div>
            <p className="mb-6">{puzzle.data.description}</p>
            
            <div className="flex justify-center space-x-4 mb-6">
              {Array.from({ length: puzzle.data.digits }).map((_, index) => (
                <div key={index} className="text-center">
                  <button
                    className="w-12 h-8 bg-gray-800 hover:bg-gray-700 rounded-t-md"
                    onClick={() => {
                      const newSolution = [...(solution || Array(puzzle.data.digits).fill(0))];
                      newSolution[index] = (newSolution[index] + 1) % 10;
                      setSolution(newSolution);
                    }}
                  >
                    <span>▲</span>
                  </button>
                  
                  <div className="w-12 h-12 bg-gray-900 border border-gray-700 flex items-center justify-center text-2xl font-mono">
                    {solution ? solution[index] : 0}
                  </div>
                  
                  <button
                    className="w-12 h-8 bg-gray-800 hover:bg-gray-700 rounded-b-md"
                    onClick={() => {
                      const newSolution = [...(solution || Array(puzzle.data.digits).fill(0))];
                      newSolution[index] = (newSolution[index] + 9) % 10; // +9 is equivalent to -1 with modulo 10
                      setSolution(newSolution);
                    }}
                  >
                    <span>▼</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'runes':
        // Rune selection puzzle
        return (
          <div>
            <p className="mb-6">{puzzle.data.description}</p>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {puzzle.data.runes.map((rune, index) => (
                <button
                  key={index}
                  className={`w-full aspect-square bg-gray-800 rounded-md flex items-center justify-center border-2 text-3xl font-runes ${
                    (solution || []).includes(rune.id) ? 'border-amber-500' : 'border-transparent'
                  }`}
                  onClick={() => {
                    const currentSolution = [...(solution || [])];
                    const runeIndex = currentSolution.indexOf(rune.id);
                    
                    if (runeIndex >= 0) {
                      // Remove if already selected
                      currentSolution.splice(runeIndex, 1);
                    } else {
                      // Add to selection
                      currentSolution.push(rune.id);
                    }
                    
                    setSolution(currentSolution);
                  }}
                >
                  {rune.symbol}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'sacrifice':
        // Sacrifice puzzle (selecting items to sacrifice)
        return (
          <div>
            <p className="mb-6">{puzzle.data.description}</p>
            
            <div className="text-center mb-2">
              <span className="text-amber-300 text-lg">Target Value: {puzzle.data.targetValue}</span>
              <div className="text-xs text-gray-400">Select up to {puzzle.data.maxSelections} items</div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {puzzle.data.items.map((item) => (
                <button
                  key={item.id}
                  className={`w-full p-3 bg-gray-800 rounded-md flex flex-col items-center text-center border ${
                    (solution || []).includes(item.id) ? 'border-amber-500' : 'border-transparent'
                  }`}
                  onClick={() => {
                    const currentSolution = [...(solution || [])];
                    const itemIndex = currentSolution.indexOf(item.id);
                    
                    if (itemIndex >= 0) {
                      // Remove if already selected
                      currentSolution.splice(itemIndex, 1);
                    } else if (currentSolution.length < puzzle.data.maxSelections) {
                      // Add if under max selections
                      currentSolution.push(item.id);
                    }
                    
                    setSolution(currentSolution);
                  }}
                  disabled={(solution || []).length >= puzzle.data.maxSelections && !(solution || []).includes(item.id)}
                >
                  <div className="text-xl mb-2">{item.icon || '🔮'}</div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-amber-300 text-xs mt-1">Value: {item.value}</div>
                </button>
              ))}
            </div>
            
            {solution && solution.length > 0 && (
              <div className="text-center p-2 bg-gray-800 rounded-md mb-4">
                <div className="text-sm">
                  Total Value: <span className="text-amber-300 font-medium">
                    {puzzle.data.items
                      .filter(item => solution.includes(item.id))
                      .reduce((sum, item) => sum + item.value, 0)}
                  </span> / {puzzle.data.targetValue}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="text-gray-400 text-center py-10">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-amber-400" />
            <p>Unknown puzzle type. This puzzle cannot be displayed.</p>
          </div>
        );
    }
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative bg-gray-900 text-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-xl font-serif text-amber-200">{puzzle.title}</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowHint(!showHint)}
              className="text-gray-400 hover:text-amber-300"
              aria-label="Show hint"
            >
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close puzzle"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {renderPuzzleContent()}
          
          <AnimatePresence>
            {showHint && puzzle.hint && (
              <motion.div 
                className="bg-amber-900/30 border border-amber-800/50 rounded-md p-3 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="text-xs uppercase text-amber-300 mb-1">Hint</div>
                <p className="text-sm text-amber-100">{puzzle.hint}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              {puzzle.data.maxAttempts ? (
                <span>Attempts: {attempts} / {puzzle.data.maxAttempts}</span>
              ) : (
                <span>Attempts: {attempts}</span>
              )}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!solution}
              className={`px-6 py-2 rounded-md font-medium ${
                solution 
                  ? 'bg-amber-700 hover:bg-amber-600' 
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PuzzlePanel;
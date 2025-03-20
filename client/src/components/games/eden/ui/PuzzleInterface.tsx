import React, { useState } from 'react';
import { Puzzle } from '../types';

interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  attempts: number;
  onAttempt: (solution: any) => void;
  onClose: () => void;
}

/**
 * Interactive interface for solving game puzzles
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({ 
  puzzle, 
  attempts, 
  onAttempt, 
  onClose 
}) => {
  // Simple state to track user's input for the puzzle
  const [solution, setSolution] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Handle different puzzle types
  const renderPuzzleContent = () => {
    switch (puzzle.type) {
      case 'pattern':
        // Pattern puzzle (like pressing symbols in the correct order)
        return (
          <div className="pattern-puzzle">
            <p className="puzzle-instruction">{puzzle.instruction}</p>
            <div className="pattern-options">
              {puzzle.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  className={`pattern-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
                  onClick={() => {
                    if (selectedOptions.includes(option)) {
                      setSelectedOptions(prev => prev.filter(item => item !== option));
                    } else {
                      setSelectedOptions(prev => [...prev, option]);
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'combination':
        // Combination puzzle (like entering a password)
        return (
          <div className="combination-puzzle">
            <p className="puzzle-instruction">{puzzle.instruction}</p>
            <input
              type="text"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter solution..."
              className="puzzle-input"
            />
          </div>
        );

      case 'memory':
        // Memory puzzle
        return (
          <div className="memory-puzzle">
            <p className="puzzle-instruction">{puzzle.instruction}</p>
            <div className="memory-slots">
              {/* Slots for memory cards would be implemented here */}
              <p>Match the items to solve the puzzle</p>
            </div>
          </div>
        );

      case 'riddle':
      case 'custom':
      default:
        return (
          <div className="generic-puzzle">
            <p className="puzzle-instruction">{puzzle.instruction || 'Solve the puzzle...'}</p>
            <input
              type="text"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Enter solution..."
              className="puzzle-input"
            />
          </div>
        );
    }
  };

  const handleSubmit = () => {
    if (puzzle.type === 'pattern') {
      onAttempt(selectedOptions);
    } else {
      onAttempt(solution);
    }
  };

  return (
    <div className="puzzle-interface">
      <div className="puzzle-header">
        <h3>{puzzle.name}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="puzzle-content">
        {renderPuzzleContent()}
      </div>
      
      <div className="puzzle-footer">
        <span className="attempts-counter">
          Attempts: {attempts}
        </span>
        <button 
          className="submit-button"
          onClick={handleSubmit}
        >
          Submit Solution
        </button>
      </div>
    </div>
  );
};

export default PuzzleInterface;
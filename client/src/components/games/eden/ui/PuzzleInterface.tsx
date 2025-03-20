import React, { useState, useEffect } from 'react';
import { PuzzleInterfaceProps, Puzzle } from '../types';

/**
 * PuzzleInterface - Displays puzzles of different types with interactions
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  isOpen,
  onSolve,
  onClose,
  onHint,
  attempts = 0,
  maxAttempts
}) => {
  const [input, setInput] = useState<string>('');
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    maxAttempts ? maxAttempts - attempts : null
  );
  
  // Reset state when puzzle changes
  useEffect(() => {
    setInput('');
    setSelectedSequence([]);
    setFeedback(null);
    setShowHint(false);
    setIsCorrect(false);
    setRemainingAttempts(maxAttempts ? maxAttempts - attempts : null);
  }, [puzzle, maxAttempts, attempts]);
  
  // Check code puzzle solution
  const checkCodeSolution = () => {
    if (!puzzle) return;
    
    // Allow for multiple possible solutions
    let solution = puzzle.solution;
    
    // Check if solution is correct (case insensitive)
    if (typeof solution === 'string' && typeof input === 'string') {
      if (input.trim().toLowerCase() === solution.toLowerCase()) {
        handleCorrectSolution();
      } else {
        handleIncorrectSolution();
      }
    } else if (Array.isArray(solution) && typeof input === 'string') {
      // Check against all possible solutions
      const normalizedInput = input.trim().toLowerCase();
      if (solution.some(s => typeof s === 'string' && s.toLowerCase() === normalizedInput)) {
        handleCorrectSolution();
      } else {
        handleIncorrectSolution();
      }
    }
  };
  
  // Check sequence puzzle solution
  const checkSequenceSolution = () => {
    if (!puzzle) return;
    
    let solution = puzzle.solution;
    
    // Convert solutions to string for comparison if array
    if (Array.isArray(solution) && Array.isArray(selectedSequence)) {
      // Check if arrays are equal (same elements in same order)
      const solutionStr = solution.join(',').toLowerCase();
      const sequenceStr = selectedSequence.join(',').toLowerCase();
      
      if (solutionStr === sequenceStr) {
        handleCorrectSolution();
      } else {
        handleIncorrectSolution();
      }
    } else if (typeof solution === 'string' && selectedSequence.length > 0) {
      // Compare joined sequence to string solution
      const sequenceStr = selectedSequence.join('').toLowerCase();
      if (sequenceStr === solution.toLowerCase().replace(/\s/g, '')) {
        handleCorrectSolution();
      } else {
        handleIncorrectSolution();
      }
    }
  };
  
  // Check item placement puzzle solution
  const checkItemPlacementSolution = (itemId: string, positionId: string) => {
    if (!puzzle) return;
    
    if (puzzle.solution === `${itemId}:${positionId}`) {
      handleCorrectSolution();
    } else {
      handleIncorrectSolution();
    }
  };
  
  // Handle correct solution
  const handleCorrectSolution = () => {
    setFeedback(puzzle?.successMessage || 'Correct!');
    setIsCorrect(true);
    
    // Wait for animation/feedback to display before calling onSolve
    setTimeout(() => {
      if (onSolve) {
        onSolve();
      }
    }, 1500);
  };
  
  // Handle incorrect solution
  const handleIncorrectSolution = () => {
    setFeedback(puzzle?.failureMessage || 'Incorrect solution. Try again.');
    
    // Update remaining attempts
    if (remainingAttempts !== null) {
      const newRemaining = remainingAttempts - 1;
      setRemainingAttempts(newRemaining);
      
      if (newRemaining <= 0) {
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 2000);
      }
    }
    
    // Clear feedback after a delay
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };
  
  // Handle sequence item click
  const handleSequenceItemClick = (item: string) => {
    if (isCorrect) return;
    
    const newSequence = [...selectedSequence];
    
    // If item is already in sequence, remove it
    const index = newSequence.indexOf(item);
    if (index !== -1) {
      newSequence.splice(index, 1);
    } else {
      // Otherwise add it
      newSequence.push(item);
    }
    
    setSelectedSequence(newSequence);
  };
  
  // Handle hint click
  const handleHintClick = () => {
    setShowHint(true);
    if (onHint) {
      onHint();
    }
  };
  
  // Render different puzzle types
  const renderPuzzleContent = () => {
    if (!puzzle) return null;
    
    switch (puzzle.type) {
      case 'code':
        return (
          <div className="puzzle-code">
            <input
              type={puzzle.inputType || 'text'}
              className="puzzle-input"
              placeholder={puzzle.placeholder || 'Enter solution...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isCorrect}
            />
            <button 
              className="puzzle-submit-btn" 
              onClick={checkCodeSolution}
              disabled={isCorrect || !input.trim()}
            >
              Submit
            </button>
          </div>
        );
        
      case 'sequence':
        return (
          <div className="puzzle-sequence">
            <div className="sequence-items">
              {puzzle.items && puzzle.items.map((item, index) => (
                <button
                  key={`sequence-item-${index}`}
                  className={`sequence-item ${selectedSequence.includes(item) ? 'selected' : ''}`}
                  onClick={() => handleSequenceItemClick(item)}
                  disabled={isCorrect}
                >
                  {item}
                </button>
              ))}
            </div>
            
            <div className="sequence-selection">
              <div className="selected-sequence">
                {selectedSequence.map((item, index) => (
                  <span key={`selected-${index}`} className="selected-item">{item}</span>
                ))}
                {selectedSequence.length === 0 && (
                  <span className="placeholder">Select items in the correct order</span>
                )}
              </div>
              
              <div className="sequence-actions">
                <button 
                  className="sequence-clear" 
                  onClick={() => setSelectedSequence([])}
                  disabled={isCorrect || selectedSequence.length === 0}
                >
                  Clear
                </button>
                
                <button 
                  className="puzzle-submit-btn" 
                  onClick={checkSequenceSolution}
                  disabled={isCorrect || selectedSequence.length === 0}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'choice':
        return (
          <div className="puzzle-choice">
            {puzzle.choices && puzzle.choices.map((choice, index) => (
              <button
                key={`choice-${index}`}
                className={`choice-btn ${input === choice ? 'selected' : ''}`}
                onClick={() => {
                  setInput(choice);
                  setTimeout(() => checkCodeSolution(), 300);
                }}
                disabled={isCorrect}
              >
                {choice}
              </button>
            ))}
          </div>
        );
        
      case 'item-placement':
        return (
          <div className="puzzle-item-placement">
            <div className="placement-items">
              {puzzle.items && puzzle.items.map((item, index) => (
                <div 
                  key={`item-${index}`}
                  className="placement-item"
                  draggable
                >
                  {item.name}
                </div>
              ))}
            </div>
            
            <div className="placement-positions">
              {puzzle.positions && puzzle.positions.map((position, index) => (
                <div 
                  key={`position-${index}`}
                  className="placement-position"
                >
                  {position.name}
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="puzzle-generic">
            <p className="puzzle-description">{puzzle.description}</p>
            <input
              type="text"
              className="puzzle-input"
              placeholder="Enter solution..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isCorrect}
            />
            <button 
              className="puzzle-submit-btn" 
              onClick={checkCodeSolution}
              disabled={isCorrect || !input.trim()}
            >
              Submit
            </button>
          </div>
        );
    }
  };
  
  if (!isOpen || !puzzle) return null;
  
  return (
    <div className="puzzle-overlay">
      <div className={`puzzle-container ${isCorrect ? 'solved' : ''}`}>
        <div className="puzzle-header">
          <h2 className="puzzle-title">{puzzle.title}</h2>
          
          <button 
            className="puzzle-close" 
            onClick={onClose}
            aria-label="Close puzzle"
          >
            ✕
          </button>
        </div>
        
        <div className="puzzle-content">
          <div className="puzzle-description">
            <p>{puzzle.description}</p>
          </div>
          
          {renderPuzzleContent()}
          
          {feedback && (
            <div className={`puzzle-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              {feedback}
            </div>
          )}
          
          {remainingAttempts !== null && (
            <div className="puzzle-attempts">
              Attempts remaining: {remainingAttempts}
            </div>
          )}
        </div>
        
        <div className="puzzle-footer">
          {puzzle.hint && (
            <button 
              className="hint-button"
              onClick={handleHintClick}
              disabled={showHint || isCorrect}
            >
              {showHint ? 'Hint Shown' : 'Show Hint'}
            </button>
          )}
          
          {showHint && puzzle.hint && (
            <div className="puzzle-hint">
              <span className="hint-title">Hint:</span> {puzzle.hint}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .puzzle-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 400;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        .puzzle-container {
          width: 100%;
          max-width: 600px;
          background-color: rgba(25, 25, 35, 0.95);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(100, 100, 150, 0.4);
          display: flex;
          flex-direction: column;
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }
        
        .puzzle-container.solved {
          border-color: rgba(100, 180, 100, 0.6);
          box-shadow: 0 0 20px rgba(100, 180, 100, 0.4);
        }
        
        .puzzle-header {
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          background-color: rgba(35, 35, 45, 0.7);
        }
        
        .puzzle-title {
          margin: 0;
          font-size: 20px;
          color: #d0d0e0;
        }
        
        .puzzle-close {
          background: none;
          border: none;
          color: #a0a0b0;
          font-size: 18px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .puzzle-close:hover {
          background-color: rgba(80, 80, 100, 0.4);
          color: #e0e0e0;
        }
        
        .puzzle-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .puzzle-description {
          line-height: 1.5;
          color: #b0b0c0;
        }
        
        .puzzle-code, .puzzle-generic {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .puzzle-input {
          padding: 12px 15px;
          background-color: rgba(40, 40, 55, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 16px;
        }
        
        .puzzle-input:focus {
          outline: none;
          border-color: rgba(126, 87, 194, 0.6);
          box-shadow: 0 0 0 2px rgba(126, 87, 194, 0.3);
        }
        
        .puzzle-submit-btn {
          padding: 10px 15px;
          background-color: rgba(70, 70, 100, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .puzzle-submit-btn:hover:not(:disabled) {
          background-color: rgba(90, 90, 120, 0.7);
        }
        
        .puzzle-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .puzzle-sequence {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .sequence-items {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        
        .sequence-item {
          padding: 10px 15px;
          background-color: rgba(50, 50, 70, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .sequence-item:hover:not(:disabled) {
          background-color: rgba(70, 70, 90, 0.7);
          transform: translateY(-2px);
        }
        
        .sequence-item.selected {
          background-color: rgba(90, 70, 120, 0.7);
          border-color: rgba(150, 100, 200, 0.6);
          box-shadow: 0 0 5px rgba(150, 100, 200, 0.3);
        }
        
        .sequence-selection {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .selected-sequence {
          min-height: 50px;
          padding: 10px;
          background-color: rgba(40, 40, 55, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        
        .selected-item {
          padding: 5px 10px;
          background-color: rgba(80, 70, 110, 0.7);
          border-radius: 4px;
          font-size: 14px;
        }
        
        .placeholder {
          color: #909090;
          font-style: italic;
        }
        
        .sequence-actions {
          display: flex;
          gap: 10px;
        }
        
        .sequence-clear {
          padding: 8px 15px;
          background-color: rgba(100, 50, 50, 0.6);
          border: 1px solid rgba(150, 100, 100, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .sequence-clear:hover:not(:disabled) {
          background-color: rgba(120, 60, 60, 0.7);
        }
        
        .puzzle-choice {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .choice-btn {
          padding: 12px 15px;
          background-color: rgba(50, 50, 70, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        
        .choice-btn:hover:not(:disabled) {
          background-color: rgba(70, 70, 90, 0.7);
        }
        
        .choice-btn.selected {
          background-color: rgba(70, 90, 70, 0.7);
          border-color: rgba(100, 180, 100, 0.6);
        }
        
        .puzzle-feedback {
          padding: 12px 15px;
          border-radius: 6px;
          font-size: 16px;
          text-align: center;
          animation: fadeIn 0.3s ease;
        }
        
        .puzzle-feedback.correct {
          background-color: rgba(50, 120, 50, 0.3);
          border: 1px solid rgba(80, 150, 80, 0.4);
          color: #a0e0a0;
        }
        
        .puzzle-feedback.incorrect {
          background-color: rgba(120, 50, 50, 0.3);
          border: 1px solid rgba(150, 80, 80, 0.4);
          color: #e0a0a0;
        }
        
        .puzzle-attempts {
          font-size: 14px;
          color: #b0b0c0;
          text-align: right;
        }
        
        .puzzle-footer {
          padding: 15px 20px;
          border-top: 1px solid rgba(100, 100, 150, 0.4);
          background-color: rgba(35, 35, 45, 0.7);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .hint-button {
          align-self: flex-start;
          padding: 8px 15px;
          background-color: rgba(60, 60, 80, 0.6);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .hint-button:hover:not(:disabled) {
          background-color: rgba(80, 80, 100, 0.7);
        }
        
        .hint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .puzzle-hint {
          padding: 10px 15px;
          background-color: rgba(60, 60, 90, 0.3);
          border: 1px solid rgba(100, 100, 170, 0.4);
          border-radius: 6px;
          font-size: 14px;
          color: #c0c0d0;
          animation: fadeIn 0.3s ease;
        }
        
        .hint-title {
          font-weight: bold;
          color: #d0d0e0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .puzzle-container {
            max-width: 100%;
          }
          
          .puzzle-title {
            font-size: 18px;
          }
          
          .puzzle-content {
            padding: 15px;
            gap: 15px;
          }
          
          .sequence-items {
            gap: 8px;
          }
          
          .sequence-item {
            padding: 8px 12px;
            font-size: 14px;
          }
          
          .puzzle-input {
            padding: 10px 12px;
            font-size: 15px;
          }
          
          .puzzle-submit-btn {
            padding: 8px 12px;
            font-size: 15px;
          }
          
          .choice-btn {
            padding: 10px 12px;
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default PuzzleInterface;
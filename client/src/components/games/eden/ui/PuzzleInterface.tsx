import React, { useState, useEffect } from 'react';
import { Puzzle } from '../types';

export interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSubmit: (solution: string[]) => void;
  onClose: () => void;
}

export const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  onSubmit,
  onClose
}) => {
  const [userSolution, setUserSolution] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [showHints, setShowHints] = useState<boolean>(false);
  
  // Initialize solution based on puzzle type
  useEffect(() => {
    if (puzzle.type === 'combination') {
      setUserSolution(Array(puzzle.solution.length).fill(''));
    } else if (puzzle.type === 'pattern') {
      const initialPattern = puzzle.initialState || Array(puzzle.solution.length).fill('');
      setUserSolution(initialPattern);
    } else if (puzzle.type === 'sequence') {
      setUserSolution([]);
    } else if (puzzle.type === 'riddle') {
      setUserSolution(['']);
    }
  }, [puzzle]);
  
  // Handle solution change
  const handleSolutionChange = (value: string, index: number) => {
    const newSolution = [...userSolution];
    newSolution[index] = value;
    setUserSolution(newSolution);
    setErrorMessage('');
  };
  
  // Add a step to the sequence
  const handleAddSequenceStep = (value: string) => {
    setUserSolution([...userSolution, value]);
    setErrorMessage('');
  };
  
  // Remove a step from the sequence
  const handleRemoveSequenceStep = (index: number) => {
    const newSolution = [...userSolution];
    newSolution.splice(index, 1);
    setUserSolution(newSolution);
  };
  
  // Move a step in the sequence
  const handleMoveSequenceStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === userSolution.length - 1)
    ) {
      return;
    }
    
    const newSolution = [...userSolution];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSolution[index];
    newSolution[index] = newSolution[newIndex];
    newSolution[newIndex] = temp;
    
    setUserSolution(newSolution);
  };
  
  // Handle solution submission
  const handleSubmit = () => {
    // Validate submission
    if (userSolution.some(s => !s.trim())) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    setAttempts(prev => prev + 1);
    onSubmit(userSolution);
  };
  
  // Get a hint
  const getHint = () => {
    const hintIndex = Math.min(attempts, puzzle.hints.length - 1);
    setHint(puzzle.hints[hintIndex]);
    setShowHints(true);
  };
  
  // Render different puzzle interfaces based on type
  const renderPuzzleInterface = () => {
    switch (puzzle.type) {
      case 'combination':
        return (
          <div className="combination-puzzle">
            <div className="puzzle-inputs">
              {userSolution.map((value, index) => (
                <div key={index} className="input-group">
                  <label>{puzzle.inputs && puzzle.inputs[index] ? puzzle.inputs[index].label : `Input ${index + 1}`}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleSolutionChange(e.target.value, index)}
                    placeholder={puzzle.inputs && puzzle.inputs[index] ? puzzle.inputs[index].placeholder : ''}
                  />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'pattern':
        if (!puzzle.pattern) return <div>Pattern data missing</div>;
        
        return (
          <div className="pattern-puzzle">
            <div className="pattern-grid">
              {puzzle.pattern.map((row, rowIndex) => (
                <div key={rowIndex} className="pattern-row">
                  {row.map((cell, cellIndex) => {
                    const cellId = `${rowIndex}-${cellIndex}`;
                    const isSelected = userSolution.includes(cellId);
                    
                    return (
                      <div
                        key={cellId}
                        className={`pattern-cell ${isSelected ? 'selected' : ''} ${cell === 'x' ? 'disabled' : ''}`}
                        onClick={() => {
                          if (cell === 'x') return;
                          
                          if (isSelected) {
                            setUserSolution(userSolution.filter(id => id !== cellId));
                          } else {
                            setUserSolution([...userSolution, cellId]);
                          }
                        }}
                      >
                        {cell === 'x' ? 'X' : cell || ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'sequence':
        return (
          <div className="sequence-puzzle">
            <div className="sequence-steps">
              {userSolution.map((step, index) => (
                <div key={index} className="sequence-step">
                  <span className="step-number">{index + 1}</span>
                  <select 
                    value={step} 
                    onChange={(e) => handleSolutionChange(e.target.value, index)}
                  >
                    <option value="">Select an option</option>
                    {puzzle.options && puzzle.options.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                  <div className="step-controls">
                    <button 
                      className="control-button"
                      onClick={() => handleMoveSequenceStep(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button 
                      className="control-button"
                      onClick={() => handleMoveSequenceStep(index, 'down')}
                      disabled={index === userSolution.length - 1}
                    >
                      ↓
                    </button>
                    <button 
                      className="control-button remove"
                      onClick={() => handleRemoveSequenceStep(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <button 
                className="add-step-button"
                onClick={() => handleAddSequenceStep('')}
              >
                Add Step
              </button>
            </div>
          </div>
        );
        
      case 'riddle':
        return (
          <div className="riddle-puzzle">
            <div className="riddle-input">
              <textarea
                value={userSolution[0]}
                onChange={(e) => setUserSolution([e.target.value])}
                placeholder="Enter your answer..."
                rows={4}
              />
            </div>
          </div>
        );
        
      default:
        return <div>Unknown puzzle type</div>;
    }
  };
  
  return (
    <div className="puzzle-overlay">
      <div className="puzzle-interface">
        <div className="puzzle-header">
          <h2>{puzzle.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="puzzle-content">
          <div className="puzzle-description">
            <p>{puzzle.description}</p>
          </div>
          
          {renderPuzzleInterface()}
          
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          
          <div className="puzzle-controls">
            <button 
              className="hint-button"
              onClick={getHint}
              disabled={attempts >= puzzle.hints.length}
            >
              Get Hint
            </button>
            <button 
              className="submit-button"
              onClick={handleSubmit}
            >
              Submit Solution
            </button>
          </div>
          
          {showHints && hint && (
            <div className="hint-display">
              <h3>Hint:</h3>
              <p>{hint}</p>
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
          z-index: 1000;
        }
        
        .puzzle-interface {
          background-color: rgba(30, 30, 35, 0.95);
          border: 2px solid #8a5c41;
          border-radius: 8px;
          width: 90%;
          max-width: 700px;
          max-height: 90%;
          display: flex;
          flex-direction: column;
          color: #eee;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        
        .puzzle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: rgba(50, 30, 20, 0.7);
          border-bottom: 1px solid #8a5c41;
          border-radius: 6px 6px 0 0;
        }
        
        .puzzle-header h2 {
          margin: 0;
          font-size: 22px;
          font-family: 'Cinzel', serif;
          color: #f1d7c5;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: #aaa;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
        }
        
        .close-button:hover {
          color: #fff;
        }
        
        .puzzle-content {
          padding: 20px;
          overflow-y: auto;
          max-height: calc(90vh - 60px);
        }
        
        .puzzle-description {
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .puzzle-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          grid-gap: 15px;
          margin-bottom: 20px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          margin-bottom: 5px;
          font-size: 14px;
          color: #ccc;
        }
        
        .input-group input {
          padding: 8px 12px;
          background-color: rgba(40, 25, 15, 0.7);
          border: 1px solid #6a4331;
          border-radius: 4px;
          color: #eee;
          font-size: 16px;
        }
        
        .pattern-grid {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 20px;
        }
        
        .pattern-row {
          display: flex;
          gap: 5px;
        }
        
        .pattern-cell {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 40, 30, 0.5);
          border: 1px solid #6a4331;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }
        
        .pattern-cell:hover:not(.disabled) {
          background-color: rgba(80, 50, 30, 0.7);
        }
        
        .pattern-cell.selected {
          background-color: rgba(100, 60, 30, 0.8);
          border-color: #cf9a6b;
        }
        
        .pattern-cell.disabled {
          background-color: rgba(30, 30, 30, 0.7);
          cursor: not-allowed;
          color: #666;
        }
        
        .sequence-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .sequence-step {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .step-number {
          width: 24px;
          height: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #6a4331;
          border-radius: 50%;
          font-size: 14px;
          font-weight: bold;
        }
        
        .sequence-step select {
          flex: 1;
          padding: 8px 12px;
          background-color: rgba(40, 25, 15, 0.7);
          border: 1px solid #6a4331;
          border-radius: 4px;
          color: #eee;
          font-size: 14px;
        }
        
        .step-controls {
          display: flex;
          gap: 5px;
        }
        
        .control-button {
          width: 24px;
          height: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 40, 30, 0.5);
          border: 1px solid #6a4331;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: #eee;
          padding: 0;
        }
        
        .control-button:hover:not(:disabled) {
          background-color: rgba(80, 50, 30, 0.7);
        }
        
        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .control-button.remove {
          background-color: rgba(80, 30, 30, 0.7);
        }
        
        .control-button.remove:hover {
          background-color: rgba(100, 40, 40, 0.8);
        }
        
        .add-step-button {
          padding: 8px 12px;
          background-color: rgba(40, 40, 50, 0.7);
          border: 1px solid #555;
          border-radius: 4px;
          color: #eee;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .add-step-button:hover {
          background-color: rgba(50, 50, 60, 0.8);
        }
        
        .riddle-input textarea {
          width: 100%;
          padding: 10px;
          background-color: rgba(40, 25, 15, 0.7);
          border: 1px solid #6a4331;
          border-radius: 4px;
          color: #eee;
          font-size: 16px;
          resize: vertical;
        }
        
        .error-message {
          color: #ff6b6b;
          margin: 10px 0;
          padding: 10px;
          background-color: rgba(80, 20, 20, 0.3);
          border-radius: 4px;
          border-left: 3px solid #ff6b6b;
        }
        
        .puzzle-controls {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .hint-button, .submit-button {
          padding: 10px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        
        .hint-button {
          background-color: #3a2b1e;
          color: #ddd;
        }
        
        .hint-button:hover:not(:disabled) {
          background-color: #4a372a;
        }
        
        .hint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .submit-button {
          background-color: #8a5c41;
          color: #fff;
        }
        
        .submit-button:hover {
          background-color: #a47755;
        }
        
        .hint-display {
          margin-top: 20px;
          padding: 15px;
          background-color: rgba(50, 40, 20, 0.4);
          border-radius: 4px;
          border-left: 3px solid #d4a762;
        }
        
        .hint-display h3 {
          margin: 0 0 10px;
          color: #d4a762;
          font-size: 18px;
        }
        
        .hint-display p {
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
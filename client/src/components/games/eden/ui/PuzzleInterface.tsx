import { useState, useEffect, useRef } from 'react';
import { PuzzleInterfaceProps, PuzzleType, Puzzle } from '../types';

/**
 * PuzzleInterface - Displays and handles various types of puzzles
 * Supports different puzzle types:
 * - sequence: Player must input a sequence in correct order
 * - code: Player must input a text/number code
 * - choice: Player must select the correct option from choices
 * - item-placement: Player must place items in correct positions
 */
const PuzzleInterface = ({
  puzzle,
  onSolve,
  onClose,
  onHint,
  isOpen = true,
  attempts = 0,
  maxAttempts = 3
}: PuzzleInterfaceProps) => {
  // State for different puzzle inputs
  const [sequenceInput, setSequenceInput] = useState<string[]>([]);
  const [codeInput, setCodeInput] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [itemPlacements, setItemPlacements] = useState<{ [key: string]: number }>({});
  
  // UI states
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showFailure, setShowFailure] = useState<boolean>(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(maxAttempts - attempts);
  const [animateShake, setAnimateShake] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(isOpen);
  const [showHint, setShowHint] = useState<boolean>(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Effect to focus input when puzzle opens
  useEffect(() => {
    if (isOpen && inputRef.current && puzzle.type === 'code') {
      inputRef.current.focus();
    }
  }, [isOpen, puzzle.type]);
  
  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showSuccess && !showFailure) {
        handleClose();
      }
      
      if (e.key === 'Enter' && puzzle.type === 'code' && codeInput) {
        checkSolution();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [codeInput, showSuccess, showFailure]);
  
  // Reset states when puzzle changes
  useEffect(() => {
    setSequenceInput([]);
    setCodeInput('');
    setSelectedChoice(null);
    setItemPlacements({});
    setShowSuccess(false);
    setShowFailure(false);
    setAttemptsLeft(maxAttempts - attempts);
    setShowHint(false);
  }, [puzzle, attempts, maxAttempts]);
  
  // Handle closing the puzzle interface
  const handleClose = () => {
    setModalOpen(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };
  
  // Check if the solution is correct
  const checkSolution = () => {
    let isCorrect = false;
    
    switch (puzzle.type) {
      case 'sequence':
        isCorrect = isSequenceSolutionCorrect();
        break;
      case 'code':
        isCorrect = isCodeSolutionCorrect();
        break;
      case 'choice':
        isCorrect = isChoiceSolutionCorrect();
        break;
      case 'item-placement':
        isCorrect = isItemPlacementCorrect();
        break;
      default:
        isCorrect = false;
    }
    
    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        if (onSolve) onSolve();
      }, 2000);
    } else {
      handleIncorrectAttempt();
    }
  };
  
  // Handle incorrect puzzle solution
  const handleIncorrectAttempt = () => {
    setAnimateShake(true);
    setTimeout(() => setAnimateShake(false), 500);
    
    setShowFailure(true);
    setTimeout(() => setShowFailure(false), 2000);
    
    setAttemptsLeft(prevAttempts => Math.max(0, prevAttempts - 1));
    
    // Display hint after multiple failed attempts
    if (attemptsLeft <= 1 && !showHint) {
      setShowHint(true);
    }
  };
  
  // Check solution for sequence puzzles
  const isSequenceSolutionCorrect = () => {
    if (!puzzle.solution) return false;
    
    if (Array.isArray(puzzle.solution)) {
      if (sequenceInput.length !== puzzle.solution.length) return false;
      
      return sequenceInput.every((item, index) => 
        item === (puzzle.solution as string[])[index]
      );
    }
    
    return false;
  };
  
  // Check solution for code puzzles
  const isCodeSolutionCorrect = () => {
    if (!puzzle.solution) return false;
    
    if (typeof puzzle.solution === 'string') {
      return codeInput.toLowerCase().trim() === puzzle.solution.toLowerCase().trim();
    } else if (Array.isArray(puzzle.solution)) {
      // Support for multiple valid solutions
      return puzzle.solution.some(sol => 
        codeInput.toLowerCase().trim() === sol.toLowerCase().trim()
      );
    }
    
    return false;
  };
  
  // Check solution for choice puzzles
  const isChoiceSolutionCorrect = () => {
    if (selectedChoice === null || !puzzle.solution) return false;
    
    if (typeof puzzle.solution === 'number') {
      return selectedChoice === puzzle.solution;
    }
    
    return false;
  };
  
  // Check solution for item placement puzzles
  const isItemPlacementCorrect = () => {
    // Ensure solution exists and is a record/object
    if (!puzzle.solution || typeof puzzle.solution !== 'object' || Array.isArray(puzzle.solution)) return false;
    
    // Check if all required placements are correct
    for (const [itemId, expectedPosition] of Object.entries(puzzle.solution as Record<string, number>)) {
      if (itemPlacements[itemId] !== Number(expectedPosition)) {
        return false;
      }
    }
    
    return true;
  };
  
  // Handle sequence item click
  const handleSequenceItemClick = (item: string) => {
    if (sequenceInput.includes(item)) {
      // Remove item if already selected
      setSequenceInput(sequenceInput.filter(i => i !== item));
    } else {
      // Add item to sequence
      setSequenceInput([...sequenceInput, item]);
    }
  };
  
  // Handle code input change
  const handleCodeInputChange = (e: { target: { value: string } }) => {
    setCodeInput(e.target.value);
  };
  
  // Handle choice selection
  const handleChoiceSelect = (index: number) => {
    setSelectedChoice(index);
  };
  
  // Handle item placement
  const handleItemPlacement = (itemId: string, position: number) => {
    setItemPlacements({
      ...itemPlacements,
      [itemId]: position
    });
  };
  
  // Reset current puzzle input
  const resetPuzzleInput = () => {
    switch (puzzle.type) {
      case 'sequence':
        setSequenceInput([]);
        break;
      case 'code':
        setCodeInput('');
        break;
      case 'choice':
        setSelectedChoice(null);
        break;
      case 'item-placement':
        setItemPlacements({});
        break;
    }
  };
  
  // Show hint
  const handleShowHint = () => {
    setShowHint(true);
    if (onHint) onHint();
  };
  
  // Render content based on puzzle type
  const renderPuzzleContent = () => {
    switch (puzzle.type) {
      case 'sequence':
        return renderSequencePuzzle();
      case 'code':
        return renderCodePuzzle();
      case 'choice':
        return renderChoicePuzzle();
      case 'item-placement':
        return renderItemPlacementPuzzle();
      default:
        return (
          <div className="puzzle-error">
            Unknown puzzle type: {puzzle.type}
          </div>
        );
    }
  };
  
  // Render sequence puzzle
  const renderSequencePuzzle = () => {
    return (
      <div className="sequence-puzzle">
        <div className="sequence-items">
          {puzzle.items?.map((item, index) => (
            <div 
              key={index}
              className={`sequence-item ${sequenceInput.includes(item) ? 'selected' : ''}`}
              onClick={() => handleSequenceItemClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
        
        <div className="sequence-input">
          <h4>Your sequence:</h4>
          <div className="sequence-display">
            {sequenceInput.length > 0 ? (
              sequenceInput.map((item, index) => (
                <div key={index} className="sequence-display-item">
                  {item}
                </div>
              ))
            ) : (
              <div className="empty-sequence">Click items to create a sequence</div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render code puzzle
  const renderCodePuzzle = () => {
    return (
      <div className="code-puzzle">
        <input
          ref={inputRef}
          type={puzzle.inputType || 'text'}
          className="code-input"
          value={codeInput}
          onChange={handleCodeInputChange}
          placeholder={puzzle.placeholder || 'Enter code...'}
          autoComplete="off"
        />
      </div>
    );
  };
  
  // Render choice puzzle
  const renderChoicePuzzle = () => {
    return (
      <div className="choice-puzzle">
        <div className="choice-items">
          {puzzle.choices?.map((choice, index) => (
            <div 
              key={index}
              className={`choice-item ${selectedChoice === index ? 'selected' : ''}`}
              onClick={() => handleChoiceSelect(index)}
            >
              {choice}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render item placement puzzle
  const renderItemPlacementPuzzle = () => {
    return (
      <div className="placement-puzzle">
        <div className="placement-items">
          {puzzle.items?.map((item, index) => (
            <div 
              key={index}
              className="placement-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('itemId', item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
        
        <div className="placement-positions">
          {puzzle.positions?.map((position, index) => (
            <div 
              key={index}
              className="placement-position"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('itemId');
                handleItemPlacement(itemId, index);
              }}
            >
              {Object.entries(itemPlacements).find(([_, pos]) => pos === index)?.[0] || position.name}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Main component render
  return (
    <div className={`puzzle-overlay ${modalOpen ? 'puzzle-visible' : 'puzzle-hidden'}`}>
      <div className={`puzzle-modal ${animateShake ? 'shake-animation' : ''}`}>
        <div className="puzzle-header">
          <h3>{puzzle.name || 'Puzzle'}</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="puzzle-content">
          <div className="puzzle-description">
            {puzzle.description}
          </div>
          
          {showSuccess ? (
            <div className="puzzle-success-message">
              {puzzle.successMessage || 'Puzzle solved!'}
            </div>
          ) : showFailure ? (
            <div className="puzzle-failure-message">
              {puzzle.failureMessage || 'Incorrect solution. Try again.'}
            </div>
          ) : (
            <div className="puzzle-interaction">
              {renderPuzzleContent()}
            </div>
          )}
          
          {showHint && (
            <div className="puzzle-hint">
              <h4>Hint:</h4>
              <p>{puzzle.hint}</p>
            </div>
          )}
          
          <div className="puzzle-footer">
            <div className="attempts-info">
              Attempts left: {attemptsLeft}
            </div>
            
            <div className="puzzle-actions">
              {!showSuccess && !showFailure && (
                <>
                  <button 
                    className="action-button" 
                    onClick={resetPuzzleInput}
                  >
                    Reset
                  </button>
                  
                  <button 
                    className="action-button hint-button" 
                    onClick={handleShowHint}
                    disabled={showHint}
                  >
                    Hint
                  </button>
                  
                  <button 
                    className="action-button submit-button" 
                    onClick={checkSolution}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .puzzle-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          transition: opacity 0.3s ease;
        }
        
        .puzzle-hidden {
          opacity: 0;
          pointer-events: none;
        }
        
        .puzzle-visible {
          opacity: 1;
        }
        
        .puzzle-modal {
          background-color: rgba(20, 20, 30, 0.95);
          border: 2px solid rgba(100, 100, 150, 0.6);
          border-radius: 8px;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          color: #e0e0e0;
          font-family: 'Times New Roman', serif;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }
        
        .shake-animation {
          animation: shake 0.5s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .puzzle-header {
          background-color: rgba(40, 40, 60, 0.8);
          padding: 15px 20px;
          border-bottom: 1px solid rgba(100, 100, 150, 0.4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .puzzle-header h3 {
          margin: 0;
          font-size: 18px;
          color: #d0d0f0;
        }
        
        .close-button {
          background: none;
          border: none;
          color: #a0a0c0;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
          padding: 0 5px;
        }
        
        .close-button:hover {
          color: #ffffff;
        }
        
        .puzzle-content {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .puzzle-description {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        
        .puzzle-interaction {
          padding: 15px;
          background-color: rgba(30, 30, 40, 0.7);
          border-radius: 6px;
          min-height: 150px;
        }
        
        .puzzle-success-message {
          background-color: rgba(40, 80, 40, 0.8);
          color: #a0e0a0;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          font-size: 18px;
          animation: fadeIn 0.5s;
        }
        
        .puzzle-failure-message {
          background-color: rgba(80, 40, 40, 0.8);
          color: #e0a0a0;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          font-size: 18px;
          animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .puzzle-hint {
          background-color: rgba(60, 50, 30, 0.7);
          padding: 15px;
          border-radius: 6px;
        }
        
        .puzzle-hint h4 {
          margin: 0 0 10px 0;
          color: #e0c090;
        }
        
        .puzzle-hint p {
          margin: 0;
          font-style: italic;
        }
        
        .puzzle-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        
        .attempts-info {
          font-size: 14px;
          color: #b0b0c0;
        }
        
        .puzzle-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-button {
          padding: 8px 16px;
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 4px;
          background-color: rgba(50, 50, 80, 0.7);
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background-color: rgba(70, 70, 110, 0.8);
        }
        
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .hint-button {
          background-color: rgba(60, 50, 30, 0.7);
        }
        
        .hint-button:hover {
          background-color: rgba(80, 70, 40, 0.8);
        }
        
        .submit-button {
          background-color: rgba(40, 60, 80, 0.7);
        }
        
        .submit-button:hover {
          background-color: rgba(50, 80, 110, 0.8);
        }
        
        /* Sequence puzzle styles */
        .sequence-puzzle {
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
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(40, 40, 60, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
          user-select: none;
        }
        
        .sequence-item:hover {
          transform: translateY(-2px);
          background-color: rgba(60, 60, 90, 0.8);
        }
        
        .sequence-item.selected {
          background-color: rgba(60, 80, 120, 0.8);
          border-color: #a0c0e0;
          box-shadow: 0 0 10px rgba(100, 150, 200, 0.3);
        }
        
        .sequence-input {
          background-color: rgba(40, 40, 60, 0.6);
          padding: 15px;
          border-radius: 6px;
        }
        
        .sequence-input h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #b0b0d0;
        }
        
        .sequence-display {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          min-height: 50px;
          align-items: center;
        }
        
        .sequence-display-item {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 80, 120, 0.8);
          border: 1px solid #a0c0e0;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .empty-sequence {
          color: #707090;
          font-style: italic;
        }
        
        /* Code puzzle styles */
        .code-puzzle {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
        }
        
        .code-input {
          width: 100%;
          max-width: 300px;
          padding: 12px 15px;
          background-color: rgba(30, 30, 40, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 6px;
          color: #e0e0e0;
          font-size: 18px;
          text-align: center;
          letter-spacing: 2px;
        }
        
        /* Choice puzzle styles */
        .choice-puzzle {
          padding: 10px;
        }
        
        .choice-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .choice-item {
          padding: 12px 15px;
          background-color: rgba(40, 40, 60, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .choice-item:hover {
          background-color: rgba(60, 60, 90, 0.8);
        }
        
        .choice-item.selected {
          background-color: rgba(60, 80, 120, 0.8);
          border-color: #a0c0e0;
        }
        
        /* Item placement puzzle styles */
        .placement-puzzle {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .placement-items {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }
        
        .placement-item {
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(40, 40, 60, 0.8);
          border: 1px solid rgba(100, 100, 150, 0.5);
          border-radius: 6px;
          cursor: grab;
          transition: all 0.2s;
          user-select: none;
        }
        
        .placement-item:hover {
          transform: translateY(-2px);
        }
        
        .placement-positions {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
        }
        
        .placement-position {
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(30, 30, 40, 0.8);
          border: 1px dashed rgba(100, 100, 150, 0.5);
          border-radius: 6px;
        }
        
        /* Error display */
        .puzzle-error {
          color: #e08080;
          text-align: center;
          font-style: italic;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .puzzle-modal {
            width: 95%;
          }
          
          .sequence-item {
            width: 50px;
            height: 50px;
            font-size: 16px;
          }
          
          .sequence-display-item {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
          
          .placement-item, .placement-position {
            width: 60px;
            height: 60px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default PuzzleInterface;
import React, { useState, useEffect } from 'react';
import { PuzzleInterfaceProps, Puzzle, PuzzleType } from '../types';

/**
 * PuzzleInterface Component
 * Handles displaying and interacting with different types of puzzles
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  onSolve,
  onClose,
  onHint
}) => {
  // State for puzzle interaction
  const [userInput, setUserInput] = useState<string[]>(
    Array(puzzle.type === 'combination' ? puzzle.solution.length : 1).fill('')
  );
  const [message, setMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shakingError, setShakingError] = useState(false);
  const [solved, setSolved] = useState(false);
  
  // Reset component when puzzle changes
  useEffect(() => {
    setUserInput(Array(puzzle.type === 'combination' ? puzzle.solution.length : 1).fill(''));
    setMessage(null);
    setShowHint(false);
    setAttempts(0);
    setSolved(false);
    setShakingError(false);
  }, [puzzle]);
  
  // Handle input change based on puzzle type
  const handleInputChange = (value: string, index: number = 0) => {
    const newInput = [...userInput];
    
    if (puzzle.type === 'combination') {
      newInput[index] = value;
    } else {
      newInput[0] = value;
    }
    
    setUserInput(newInput);
    setMessage(null);
  };
  
  // Check if puzzle is solved
  const checkSolution = () => {
    setAttempts(attempts + 1);
    
    let isSolved = false;
    
    if (puzzle.type === 'riddle' || puzzle.type === 'text') {
      // For riddles, check if answer contains any of the accepted solutions
      const answer = userInput[0].toLowerCase().trim();
      isSolved = puzzle.acceptedAnswers.some(solution => 
        answer.includes(solution.toLowerCase())
      );
    } else if (puzzle.type === 'combination') {
      // For combinations, check exact match
      isSolved = userInput.join('') === puzzle.solution.join('');
    } else if (puzzle.type === 'pattern') {
      // For patterns, check exact match
      isSolved = userInput[0] === puzzle.solution.join('');
    }
    
    if (isSolved) {
      setMessage('Correct!');
      setSolved(true);
      // Notify parent component
      setTimeout(() => {
        onSolve();
      }, 1500);
    } else {
      setMessage('Incorrect. Try again.');
      // Shake the interface to indicate error
      setShakingError(true);
      setTimeout(() => setShakingError(false), 500);
      
      // Show hint after several failed attempts
      if (attempts >= 2 && !showHint) {
        setShowHint(true);
      }
    }
  };
  
  // Request a hint
  const requestHint = () => {
    onHint();
    setShowHint(true);
  };
  
  // Render puzzle based on type
  const renderPuzzleContent = () => {
    switch (puzzle.type) {
      case 'combination':
        return renderCombinationPuzzle();
      case 'riddle':
        return renderRiddlePuzzle();
      case 'pattern':
        return renderPatternPuzzle();
      case 'slider':
        return renderSliderPuzzle();
      case 'text':
        return renderTextPuzzle();
      default:
        return <div>Unsupported puzzle type</div>;
    }
  };
  
  // Render combination lock puzzle
  const renderCombinationPuzzle = () => {
    return (
      <div className="combination-puzzle">
        <div className="combination-slots">
          {userInput.map((value, index) => (
            <div key={index} className="combination-slot">
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(e.target.value.slice(0, 1), index)}
                maxLength={1}
                className="combination-input"
                disabled={solved}
              />
            </div>
          ))}
        </div>
        {puzzle.image && (
          <div className="puzzle-image-container">
            <img src={puzzle.image} alt="Puzzle" className="puzzle-image" />
          </div>
        )}
      </div>
    );
  };
  
  // Render riddle puzzle
  const renderRiddlePuzzle = () => {
    return (
      <div className="riddle-puzzle">
        <p className="riddle-text">{puzzle.question}</p>
        {puzzle.image && (
          <div className="puzzle-image-container">
            <img src={puzzle.image} alt="Riddle" className="puzzle-image" />
          </div>
        )}
        <input
          type="text"
          value={userInput[0]}
          onChange={(e) => handleInputChange(e.target.value)}
          className="riddle-input"
          placeholder="Your answer..."
          disabled={solved}
        />
      </div>
    );
  };
  
  // Render pattern puzzle (like a sequence or order puzzle)
  const renderPatternPuzzle = () => {
    const patternOptions = puzzle.options || [];
    
    return (
      <div className="pattern-puzzle">
        <p className="pattern-instruction">{puzzle.question}</p>
        
        {puzzle.image && (
          <div className="puzzle-image-container">
            <img src={puzzle.image} alt="Pattern" className="puzzle-image" />
          </div>
        )}
        
        <div className="pattern-output">
          {userInput[0] && 
            userInput[0].split('').map((char, index) => (
              <div key={index} className="pattern-selected-item">
                {char}
              </div>
            ))
          }
        </div>
        
        <div className="pattern-options">
          {patternOptions.map((option, index) => (
            <button
              key={index}
              className="pattern-option"
              onClick={() => handleInputChange(userInput[0] + option)}
              disabled={solved}
            >
              {option}
            </button>
          ))}
          
          <button
            className="pattern-reset"
            onClick={() => handleInputChange('')}
            disabled={solved}
          >
            Reset
          </button>
        </div>
      </div>
    );
  };
  
  // Render slider puzzle (placeholder - would need more complex interaction)
  const renderSliderPuzzle = () => {
    return (
      <div className="slider-puzzle">
        <p className="slider-instruction">
          Arrange the tiles to form the correct image.
        </p>
        <div className="slider-placeholder">
          <p>Slider puzzle would need a more complex implementation</p>
          {/* This would be implemented with actual draggable pieces */}
        </div>
        
        {puzzle.image && (
          <div className="puzzle-image-container">
            <img src={puzzle.image} alt="Slider reference" className="puzzle-image" />
          </div>
        )}
      </div>
    );
  };
  
  // Render text puzzle (similar to riddle but with different presentation)
  const renderTextPuzzle = () => {
    return (
      <div className="text-puzzle">
        <div className="text-puzzle-content">
          {puzzle.longText && (
            <div className="text-puzzle-scroll">
              <p>{puzzle.longText}</p>
            </div>
          )}
          
          <p className="text-puzzle-question">{puzzle.question}</p>
          
          <input
            type="text"
            value={userInput[0]}
            onChange={(e) => handleInputChange(e.target.value)}
            className="text-puzzle-input"
            placeholder="Your answer..."
            disabled={solved}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="puzzle-overlay">
      <div className={`puzzle-container ${shakingError ? 'shaking' : ''} ${solved ? 'solved' : ''}`}>
        <div className="puzzle-header">
          <h2 className="puzzle-title">{puzzle.name}</h2>
          <button 
            className="puzzle-close" 
            onClick={onClose}
            aria-label="Close puzzle"
          >
            ×
          </button>
        </div>
        
        <div className="puzzle-content">
          {renderPuzzleContent()}
          
          {message && (
            <div className={`puzzle-message ${message.includes('Correct') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          {showHint && puzzle.hint && (
            <div className="puzzle-hint">
              <strong>Hint:</strong> {puzzle.hint}
            </div>
          )}
        </div>
        
        <div className="puzzle-footer">
          {!showHint && puzzle.hint && (
            <button 
              className="puzzle-hint-btn" 
              onClick={requestHint}
              disabled={solved}
            >
              Get Hint
            </button>
          )}
          
          <button 
            className="puzzle-submit" 
            onClick={checkSolution}
            disabled={solved}
          >
            Submit
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .puzzle-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        
        .puzzle-container {
          background-color: rgba(20, 20, 20, 0.95);
          border: 1px solid #444;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          color: #eee;
          font-family: 'Goudy Old Style', serif;
        }
        
        .puzzle-container.shaking {
          animation: shake 0.5s;
        }
        
        .puzzle-container.solved {
          box-shadow: 0 0 20px rgba(100, 255, 100, 0.6);
          border-color: #4caf50;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .puzzle-header {
          background-color: rgba(0, 0, 0, 0.5);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #333;
        }
        
        .puzzle-title {
          margin: 0;
          font-size: 24px;
        }
        
        .puzzle-close {
          background: none;
          border: none;
          color: #ccc;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .puzzle-close:hover {
          color: #fff;
        }
        
        .puzzle-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        
        .puzzle-footer {
          padding: 15px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          border-top: 1px solid #333;
        }
        
        .puzzle-hint-btn, .puzzle-submit {
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        
        .puzzle-hint-btn {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
        }
        
        .puzzle-hint-btn:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .puzzle-submit {
          background-color: rgba(76, 175, 80, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.5);
          color: #4caf50;
        }
        
        .puzzle-submit:hover:not(:disabled) {
          background-color: rgba(76, 175, 80, 0.3);
        }
        
        .puzzle-hint-btn:disabled, .puzzle-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .puzzle-message {
          margin-top: 15px;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
        }
        
        .puzzle-message.success {
          background-color: rgba(76, 175, 80, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.5);
          color: #4caf50;
        }
        
        .puzzle-message.error {
          background-color: rgba(244, 67, 54, 0.2);
          border: 1px solid rgba(244, 67, 54, 0.5);
          color: #f44336;
        }
        
        .puzzle-hint {
          margin-top: 15px;
          padding: 10px;
          background-color: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          border-radius: 4px;
          color: #ffc107;
        }
        
        /* Combination puzzle specific styles */
        .combination-puzzle {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .combination-slots {
          display: flex;
          gap: 15px;
        }
        
        .combination-slot {
          width: 60px;
          height: 60px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 2px solid #555;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .combination-input {
          width: 40px;
          height: 40px;
          background-color: transparent;
          border: none;
          color: #fff;
          font-size: 24px;
          text-align: center;
        }
        
        /* Riddle puzzle specific styles */
        .riddle-puzzle {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .riddle-text {
          font-size: 18px;
          line-height: 1.5;
          font-style: italic;
        }
        
        .riddle-input {
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          font-size: 16px;
          width: 100%;
        }
        
        /* Pattern puzzle specific styles */
        .pattern-puzzle {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .pattern-instruction {
          font-size: 18px;
          line-height: 1.5;
        }
        
        .pattern-output {
          min-height: 60px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 4px;
          padding: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .pattern-selected-item {
          width: 40px;
          height: 40px;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid #777;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        .pattern-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .pattern-option {
          width: 50px;
          height: 50px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pattern-option:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .pattern-reset {
          background-color: rgba(244, 67, 54, 0.2);
          border: 1px solid rgba(244, 67, 54, 0.5);
          color: #f44336;
          padding: 0 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .pattern-reset:hover:not(:disabled) {
          background-color: rgba(244, 67, 54, 0.3);
        }
        
        /* Text puzzle specific styles */
        .text-puzzle {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .text-puzzle-scroll {
          max-height: 200px;
          overflow-y: auto;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 4px;
          line-height: 1.5;
        }
        
        .text-puzzle-question {
          font-size: 18px;
          font-weight: bold;
        }
        
        .text-puzzle-input {
          padding: 10px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid #555;
          border-radius: 4px;
          color: #fff;
          font-size: 16px;
          width: 100%;
        }
        
        /* Slider puzzle specific styles */
        .slider-puzzle {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        
        .slider-instruction {
          font-size: 18px;
          text-align: center;
        }
        
        .slider-placeholder {
          width: 300px;
          height: 300px;
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }
        
        /* Common image container for all puzzles */
        .puzzle-image-container {
          display: flex;
          justify-content: center;
          margin: 15px 0;
        }
        
        .puzzle-image {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default PuzzleInterface;
import React, { useState, useEffect } from 'react';
import { Puzzle, PuzzleInput } from '../types';

interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  onSubmit: (solution: string[] | Record<string, string>) => void;
  onRequestHint: () => void;
  attempts: number;
  maxAttempts?: number;
  onClose: () => void;
}

/**
 * Interactive puzzle interface supporting multiple puzzle types
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  onSubmit,
  onRequestHint,
  attempts,
  maxAttempts = 3,
  onClose,
}) => {
  // For combination locks, riddles, sequences
  const [inputs, setInputs] = useState<string[]>([]);
  // For pattern puzzles
  const [selectedPattern, setSelectedPattern] = useState<string[]>([]);
  // For slider puzzles
  const [sliderPositions, setSliderPositions] = useState<number[]>([]);
  // For feedback message
  const [feedback, setFeedback] = useState<string | null>(null);
  // For animation
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Initialize different puzzle types
  useEffect(() => {
    if (!puzzle) return;
    
    if (puzzle.type === 'combination' || puzzle.type === 'sequence' || puzzle.type === 'riddle') {
      // Initialize inputs based on puzzle configuration
      if (puzzle.inputs) {
        setInputs(Array(puzzle.inputs.length).fill(''));
      }
    } else if (puzzle.type === 'pattern') {
      setSelectedPattern([]);
    } else if (puzzle.type === 'slider') {
      if (puzzle.inputs) {
        // Initialize sliders in starting position
        setSliderPositions(Array(puzzle.inputs.length).fill(0));
      }
    } else if (puzzle.type === 'order') {
      // Initialize with randomized order that needs to be arranged
      const initialState = puzzle.initialState ? [...puzzle.initialState] : [];
      setInputs(initialState);
    } else if (puzzle.type === 'selection') {
      setSelectedPattern([]);
    }
  }, [puzzle]);
  
  const attemptRemaining = maxAttempts - attempts;
  
  // Handle input changes for text-based puzzles
  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };
  
  // Handle slider position changes
  const handleSliderChange = (index: number, value: number) => {
    const newPositions = [...sliderPositions];
    newPositions[index] = value;
    setSliderPositions(newPositions);
  };
  
  // Handle pattern selection
  const handlePatternSelect = (pattern: string) => {
    // Toggle pattern selection
    if (selectedPattern.includes(pattern)) {
      setSelectedPattern(selectedPattern.filter(p => p !== pattern));
    } else {
      setSelectedPattern([...selectedPattern, pattern]);
    }
  };
  
  // Handle dragging for order puzzles
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    // Reorder the items
    const newInputs = [...inputs];
    const [moved] = newInputs.splice(sourceIndex, 1);
    newInputs.splice(targetIndex, 0, moved);
    
    setInputs(newInputs);
  };
  
  // Submit puzzle solution
  const handleSubmit = () => {
    // Prevent submission if animating
    if (isAnimating) return;
    
    // Determine the solution format based on puzzle type
    let solution: string[] | Record<string, string>;
    
    if (puzzle.type === 'combination' || puzzle.type === 'sequence' || puzzle.type === 'riddle') {
      solution = inputs;
    } else if (puzzle.type === 'pattern') {
      solution = selectedPattern;
    } else if (puzzle.type === 'slider') {
      solution = sliderPositions.map(pos => pos.toString());
    } else if (puzzle.type === 'order') {
      solution = inputs;
    } else if (puzzle.type === 'selection') {
      solution = selectedPattern;
    } else {
      // Default case
      solution = inputs;
    }
    
    // Animate submission
    setIsAnimating(true);
    setFeedback('Checking solution...');
    
    // Submit solution after a brief delay for feedback
    setTimeout(() => {
      onSubmit(solution);
      setIsAnimating(false);
      setFeedback(null);
    }, 1000);
  };
  
  // Render combination lock puzzle
  const renderCombinationPuzzle = () => {
    if (!puzzle.inputs) return null;
    
    return (
      <div className="puzzle-combination">
        <div className="input-container">
          {puzzle.inputs.map((input, index) => (
            <div key={`input-${index}`} className="input-field">
              <label>{input.label}</label>
              <input
                type="text"
                value={inputs[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={input.placeholder || ''}
                maxLength={input.maxLength || 10}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render order/sequence puzzle where items need to be arranged
  const renderOrderPuzzle = () => {
    if (puzzle.type !== 'order') return null;
    
    return (
      <div className="puzzle-order">
        <div className="order-items">
          {inputs.map((item, index) => (
            <div
              key={`order-${index}`}
              className="order-item"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="item-number">{index + 1}</div>
              <div className="item-content">{puzzle.items[index]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render pattern puzzle
  const renderPatternPuzzle = () => {
    if (puzzle.type !== 'pattern') return null;
    
    return (
      <div className="puzzle-pattern">
        <div className="pattern-grid">
          {puzzle.pattern.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="pattern-row">
              {row.map((cell, cellIndex) => {
                const patternId = `${rowIndex}-${cellIndex}`;
                const isSelected = selectedPattern.includes(patternId);
                
                return (
                  <div
                    key={`cell-${patternId}`}
                    className={`pattern-cell ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePatternSelect(patternId)}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render selection puzzle (multiple choice)
  const renderSelectionPuzzle = () => {
    if (puzzle.type !== 'selection') return null;
    
    return (
      <div className="puzzle-selection">
        <div className="selection-options">
          {puzzle.options.map((option, index) => {
            const isSelected = selectedPattern.includes(option.id);
            
            return (
              <div
                key={`option-${index}`}
                className={`selection-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePatternSelect(option.id)}
              >
                <div className="selection-marker">
                  {isSelected ? '✓' : ''}
                </div>
                <div className="selection-text">{option.text}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render slider puzzle
  const renderSliderPuzzle = () => {
    if (puzzle.type !== 'slider' || !puzzle.inputs) return null;
    
    return (
      <div className="puzzle-slider">
        {puzzle.inputs.map((input, index) => (
          <div key={`slider-${index}`} className="slider-container">
            <label>{input.label}</label>
            <input
              type="range"
              min={input.min || 0}
              max={input.max || 100}
              value={sliderPositions[index]}
              onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
              step={input.step || 1}
            />
            <div className="slider-value">{sliderPositions[index]}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render the appropriate puzzle interface based on type
  const renderPuzzleInterface = () => {
    switch (puzzle.type) {
      case 'combination':
      case 'riddle':
      case 'sequence':
        return renderCombinationPuzzle();
      case 'pattern':
        return renderPatternPuzzle();
      case 'slider':
        return renderSliderPuzzle();
      case 'lock':
        return renderCombinationPuzzle();
      case 'order':
        return renderOrderPuzzle();
      case 'selection':
        return renderSelectionPuzzle();
      default:
        return <div>Unknown puzzle type</div>;
    }
  };
  
  return (
    <div className="puzzle-interface">
      <div className="puzzle-container">
        <div className="puzzle-header">
          <h2>{puzzle.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="puzzle-description">
          <p>{puzzle.description}</p>
        </div>
        
        <div className="puzzle-content">
          {renderPuzzleInterface()}
        </div>
        
        {feedback && (
          <div className="puzzle-feedback">
            <p>{feedback}</p>
          </div>
        )}
        
        <div className="puzzle-footer">
          <div className="puzzle-attempts">
            <span>Attempts remaining: {attemptRemaining}</span>
          </div>
          
          <div className="puzzle-actions">
            <button 
              className="hint-button" 
              onClick={onRequestHint}
              disabled={isAnimating}
            >
              Hint
            </button>
            <button 
              className="submit-button" 
              onClick={handleSubmit}
              disabled={isAnimating}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .puzzle-interface {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            backdrop-filter: blur(3px);
          }
          
          .puzzle-container {
            background-color: #1f1a2e;
            border: 2px solid #645c84;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
            color: #e0d0ff;
            display: flex;
            flex-direction: column;
            padding: 20px;
            font-family: serif;
          }
          
          .puzzle-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #645c84;
            padding-bottom: 15px;
          }
          
          .puzzle-header h2 {
            margin: 0;
            font-size: 1.6rem;
            color: #ad99ff;
          }
          
          .close-button {
            background: none;
            border: none;
            color: #e0d0ff;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
          }
          
          .close-button:hover {
            background-color: rgba(224, 208, 255, 0.1);
          }
          
          .puzzle-description {
            margin-bottom: 20px;
            font-size: 1rem;
            line-height: 1.5;
          }
          
          .puzzle-content {
            margin-bottom: 20px;
            min-height: 150px;
          }
          
          .input-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .input-field {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .input-field label {
            font-size: 0.9rem;
            color: #ad99ff;
          }
          
          .input-field input {
            background-color: #2d2640;
            border: 1px solid #645c84;
            border-radius: 5px;
            padding: 10px;
            color: #e0d0ff;
            font-size: 1rem;
            transition: border-color 0.2s ease;
          }
          
          .input-field input:focus {
            border-color: #ad99ff;
            outline: none;
          }
          
          .puzzle-feedback {
            background-color: rgba(173, 153, 255, 0.1);
            border-radius: 5px;
            padding: 10px 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .puzzle-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid #645c84;
          }
          
          .puzzle-attempts {
            font-size: 0.9rem;
            color: #e0d0ff;
          }
          
          .puzzle-actions {
            display: flex;
            gap: 10px;
          }
          
          .hint-button, .submit-button {
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
          }
          
          .hint-button {
            background-color: transparent;
            border: 1px solid #645c84;
            color: #e0d0ff;
          }
          
          .hint-button:hover {
            background-color: rgba(224, 208, 255, 0.1);
          }
          
          .submit-button {
            background-color: #7a63c9;
            border: none;
            color: #fff;
          }
          
          .submit-button:hover {
            background-color: #8f7ad8;
          }
          
          .submit-button:disabled, .hint-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          /* Pattern Puzzle Styles */
          .pattern-grid {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .pattern-row {
            display: flex;
            gap: 5px;
          }
          
          .pattern-cell {
            width: 60px;
            height: 60px;
            background-color: #2d2640;
            border: 1px solid #645c84;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .pattern-cell.selected {
            background-color: #7a63c9;
            transform: scale(0.95);
          }
          
          /* Slider Puzzle Styles */
          .slider-container {
            margin-bottom: 15px;
          }
          
          .slider-container label {
            display: block;
            margin-bottom: 5px;
            color: #ad99ff;
          }
          
          .slider-container input[type="range"] {
            width: 100%;
            -webkit-appearance: none;
            height: 8px;
            background: #2d2640;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          
          .slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: #7a63c9;
            border-radius: 50%;
            cursor: pointer;
          }
          
          .slider-value {
            text-align: center;
            font-size: 1.2rem;
            color: #ad99ff;
          }
          
          /* Order Puzzle Styles */
          .order-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .order-item {
            display: flex;
            background-color: #2d2640;
            border: 1px solid #645c84;
            padding: 10px;
            border-radius: 5px;
            cursor: move;
            transition: background-color 0.2s ease;
            align-items: center;
          }
          
          .order-item:hover {
            background-color: #3a3150;
          }
          
          .item-number {
            width: 25px;
            height: 25px;
            background-color: #645c84;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
          }
          
          .item-content {
            flex-grow: 1;
          }
          
          /* Selection Puzzle Styles */
          .selection-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          
          .selection-option {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: #2d2640;
            border: 1px solid #645c84;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .selection-option:hover {
            background-color: #3a3150;
          }
          
          .selection-option.selected {
            background-color: #3a3150;
            border-color: #7a63c9;
          }
          
          .selection-marker {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1px solid #645c84;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.7rem;
            background-color: transparent;
            transition: all 0.2s ease;
          }
          
          .selection-option.selected .selection-marker {
            background-color: #7a63c9;
            border-color: #7a63c9;
          }
          
          .selection-text {
            flex-grow: 1;
          }
        `}
      </style>
    </div>
  );
};

export default PuzzleInterface;
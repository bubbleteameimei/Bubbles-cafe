import React, { useState, useEffect, useRef } from 'react';
import { PuzzleInterfaceProps, Puzzle } from '../types';

/**
 * PuzzleInterface Component - Handles various types of puzzle interactions
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  onSolve,
  onClose,
  onHint
}) => {
  const [userInput, setUserInput] = useState('');
  const [sliderValues, setSliderValues] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize puzzle state
  useEffect(() => {
    // Reset states when puzzle changes
    setUserInput('');
    setErrorMessage('');
    setShowHint(false);
    setCurrentHint(0);
    
    // Focus input if it exists
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Initialize sliders based on puzzle data
    if (puzzle.type === 'slider' && puzzle.data && Array.isArray(puzzle.data.initialValues)) {
      setSliderValues([...puzzle.data.initialValues]);
    }
    
    // Initialize puzzle-specific states
    if (puzzle.type === 'pattern' && puzzle.data && Array.isArray(puzzle.data.options)) {
      setSelectedOptions([]);
    }
  }, [puzzle.id]);
  
  // Check if puzzle solution is correct
  const checkSolution = () => {
    switch (puzzle.type) {
      case 'riddle':
        if (puzzle.acceptedAnswers) {
          const answers = Array.isArray(puzzle.acceptedAnswers) 
            ? puzzle.acceptedAnswers 
            : [puzzle.acceptedAnswers];
          
          const isCorrect = answers.some(answer => 
            userInput.toLowerCase().trim() === answer.toLowerCase().trim()
          );
          
          if (isCorrect) {
            onSolve();
          } else {
            setErrorMessage('That doesn\'t seem to be the right answer.');
          }
        }
        break;
        
      case 'combination':
        if (userInput === puzzle.data?.solution) {
          onSolve();
        } else {
          setErrorMessage('That combination doesn\'t work.');
        }
        break;
        
      case 'slider':
        const targetValues = puzzle.data?.targetValues;
        if (targetValues && JSON.stringify(sliderValues) === JSON.stringify(targetValues)) {
          onSolve();
        } else {
          setErrorMessage('The sliders aren\'t in the right positions yet.');
        }
        break;
        
      case 'pattern':
        const pattern = puzzle.data?.pattern;
        if (pattern && JSON.stringify(selectedOptions) === JSON.stringify(pattern)) {
          onSolve();
        } else {
          setErrorMessage('That pattern isn\'t correct.');
        }
        break;
        
      case 'memory':
        if (userInput === puzzle.data?.solution) {
          onSolve();
        } else {
          setErrorMessage('That\'s not what you need to remember.');
        }
        break;
        
      case 'order':
        const correctOrder = puzzle.data?.correctOrder;
        if (correctOrder && JSON.stringify(selectedOptions) === JSON.stringify(correctOrder)) {
          onSolve();
        } else {
          setErrorMessage('The order isn\'t correct.');
        }
        break;
    }
  };
  
  // Handle input change for text-based puzzles
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    setErrorMessage('');
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkSolution();
  };
  
  // Handle slider change
  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...sliderValues];
    newValues[index] = value;
    setSliderValues(newValues);
    setErrorMessage('');
  };
  
  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setErrorMessage('');
    
    if (puzzle.type === 'pattern') {
      // Toggle selection for pattern puzzles
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(opt => opt !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else if (puzzle.type === 'order') {
      // Add to sequence or remove if already last item for order puzzles
      if (selectedOptions[selectedOptions.length - 1] === option) {
        setSelectedOptions(selectedOptions.slice(0, -1));
      } else if (!selectedOptions.includes(option)) {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };
  
  // Show the next hint
  const handleHintClick = () => {
    if (showHint) {
      // If already showing a hint, go to next one
      if (currentHint < puzzle.hints.length - 1) {
        setCurrentHint(currentHint + 1);
      } else {
        // Cycle back to first hint
        setCurrentHint(0);
      }
    } else {
      // Show first hint
      setShowHint(true);
    }
    
    // Call parent hint handler
    onHint();
  };
  
  // Render puzzle specific UI
  const renderPuzzleContent = () => {
    switch (puzzle.type) {
      case 'riddle':
        return (
          <div className="puzzle-riddle">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.image && (
              <div className="puzzle-image-container">
                <img src={puzzle.data.image} alt="Riddle clue" className="puzzle-image" />
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter your answer..."
                className="puzzle-input"
              />
              <button type="submit" className="puzzle-submit">Solve</button>
            </form>
          </div>
        );
        
      case 'combination':
        return (
          <div className="puzzle-combination">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.image && (
              <div className="puzzle-image-container">
                <img src={puzzle.data.image} alt="Lock" className="puzzle-image" />
              </div>
            )}
            <div className="combination-input">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter combination..."
                className="puzzle-input"
                maxLength={puzzle.data?.maxLength || 10}
              />
              <button onClick={checkSolution} className="puzzle-submit">Try</button>
            </div>
          </div>
        );
        
      case 'slider':
        return (
          <div className="puzzle-slider">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.image && (
              <div className="puzzle-image-container">
                <img src={puzzle.data.image} alt="Slider mechanism" className="puzzle-image" />
              </div>
            )}
            <div className="sliders-container">
              {sliderValues.map((value, index) => (
                <div key={index} className="slider-item">
                  <input
                    type="range"
                    min={puzzle.data?.minValue || 0}
                    max={puzzle.data?.maxValue || 10}
                    value={value}
                    onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                    className="puzzle-slider-input"
                  />
                  <span className="slider-value">{value}</span>
                </div>
              ))}
              <button onClick={checkSolution} className="puzzle-submit">Try</button>
            </div>
          </div>
        );
        
      case 'pattern':
        return (
          <div className="puzzle-pattern">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.options && (
              <div className="pattern-grid">
                {puzzle.data.options.map((option, index) => (
                  <button
                    key={index}
                    className={`pattern-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            <button onClick={checkSolution} className="puzzle-submit">Check Pattern</button>
          </div>
        );
        
      case 'memory':
        return (
          <div className="puzzle-memory">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.longText && (
              <div className="memory-text-container">
                <p className="memory-text">{puzzle.data.longText}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="What do you remember?"
                className="puzzle-input"
              />
              <button type="submit" className="puzzle-submit">Answer</button>
            </form>
          </div>
        );
        
      case 'order':
        return (
          <div className="puzzle-order">
            <p className="puzzle-description">{puzzle.description}</p>
            {puzzle.data?.options && (
              <div className="order-options">
                {puzzle.data.options.map((option, index) => (
                  <button
                    key={index}
                    className={`order-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            <div className="selected-order">
              <p>Current sequence:</p>
              <div className="order-sequence">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((option, index) => (
                    <div key={index} className="order-item">
                      {option}
                    </div>
                  ))
                ) : (
                  <p className="empty-sequence">No items selected</p>
                )}
              </div>
            </div>
            <button onClick={checkSolution} className="puzzle-submit">Check Order</button>
          </div>
        );
        
      default:
        return (
          <div className="puzzle-generic">
            <p className="puzzle-description">{puzzle.description}</p>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Enter your solution..."
                className="puzzle-input"
              />
              <button type="submit" className="puzzle-submit">Solve</button>
            </form>
          </div>
        );
    }
  };
  
  return (
    <div className="puzzle-interface">
      <div className="puzzle-container">
        <div className="puzzle-header">
          <h2 className="puzzle-title">{puzzle.name}</h2>
          <span className="puzzle-difficulty">
            {"⭐".repeat(puzzle.difficulty)}
          </span>
          <button className="puzzle-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="puzzle-error">
            {errorMessage}
          </div>
        )}
        
        {/* Puzzle specific content */}
        <div className="puzzle-content">
          {renderPuzzleContent()}
        </div>
        
        {/* Hint section */}
        <div className="puzzle-hint-section">
          <button 
            className="hint-button" 
            onClick={handleHintClick}
          >
            {showHint ? "Next Hint" : "Get Hint"}
          </button>
          
          {showHint && puzzle.hints && puzzle.hints.length > 0 && (
            <div className="hint-display">
              <p>{puzzle.hints[currentHint]}</p>
              <span className="hint-counter">
                Hint {currentHint + 1} of {puzzle.hints.length}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <style>
        {`
          .puzzle-interface {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(3px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 800;
            animation: fadeIn 0.3s ease;
          }
          
          .puzzle-container {
            width: 90%;
            max-width: 600px;
            background-color: rgba(30, 30, 40, 0.95);
            border: 1px solid rgba(100, 100, 150, 0.5);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
            animation: slideDown 0.3s ease;
          }
          
          .puzzle-header {
            padding: 15px;
            background-color: rgba(40, 40, 60, 0.8);
            border-bottom: 1px solid rgba(100, 100, 150, 0.4);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .puzzle-title {
            margin: 0;
            color: white;
            font-size: 1.5rem;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          
          .puzzle-difficulty {
            color: #ffcc00;
            font-size: 1.2rem;
          }
          
          .puzzle-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 5px;
            transition: color 0.2s;
          }
          
          .puzzle-close:hover {
            color: white;
          }
          
          .puzzle-error {
            background-color: rgba(170, 30, 30, 0.3);
            border-left: 4px solid #aa3333;
            padding: 10px 15px;
            color: #ffaaaa;
            margin: 10px;
            border-radius: 4px;
            animation: shake 0.5s;
          }
          
          .puzzle-content {
            padding: 20px;
            color: white;
          }
          
          .puzzle-description {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          
          .puzzle-image-container {
            text-align: center;
            margin: 15px 0;
          }
          
          .puzzle-image {
            max-width: 100%;
            max-height: 200px;
            border-radius: 4px;
            border: 1px solid rgba(100, 100, 150, 0.3);
          }
          
          .puzzle-input {
            padding: 10px;
            border: 1px solid rgba(100, 100, 150, 0.4);
            border-radius: 4px;
            background-color: rgba(20, 20, 30, 0.7);
            color: white;
            font-size: 16px;
            width: calc(100% - 100px);
            margin-right: 10px;
          }
          
          .puzzle-input:focus {
            outline: none;
            border-color: rgba(100, 150, 255, 0.6);
            box-shadow: 0 0 5px rgba(100, 150, 255, 0.3);
          }
          
          .puzzle-submit {
            padding: 10px 15px;
            border: 1px solid rgba(100, 150, 200, 0.4);
            border-radius: 4px;
            background-color: rgba(60, 80, 150, 0.6);
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .puzzle-submit:hover {
            background-color: rgba(80, 100, 170, 0.8);
          }
          
          /* Slider puzzle styles */
          .sliders-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .slider-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .puzzle-slider-input {
            width: 100%;
            -webkit-appearance: none;
            height: 8px;
            background-color: rgba(50, 50, 70, 0.6);
            border-radius: 4px;
            outline: none;
          }
          
          .puzzle-slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background-color: rgba(100, 150, 200, 0.8);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .puzzle-slider-input::-webkit-slider-thumb:hover {
            background-color: rgba(120, 170, 220, 1);
          }
          
          .slider-value {
            min-width: 30px;
            text-align: center;
            padding: 5px;
            background-color: rgba(40, 40, 60, 0.6);
            border-radius: 4px;
          }
          
          /* Pattern puzzle styles */
          .pattern-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .pattern-option {
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            background-color: rgba(50, 50, 70, 0.6);
            border: 1px solid rgba(100, 100, 150, 0.3);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .pattern-option:hover {
            background-color: rgba(70, 70, 90, 0.8);
          }
          
          .pattern-option.selected {
            background-color: rgba(80, 130, 200, 0.6);
            border-color: rgba(100, 150, 220, 0.8);
            box-shadow: 0 0 10px rgba(100, 150, 220, 0.3);
          }
          
          /* Order puzzle styles */
          .order-options {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .order-option {
            padding: 8px 15px;
            background-color: rgba(50, 50, 70, 0.6);
            border: 1px solid rgba(100, 100, 150, 0.3);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }
          
          .order-option:hover {
            background-color: rgba(70, 70, 90, 0.8);
          }
          
          .order-option.selected {
            background-color: rgba(80, 100, 140, 0.6);
            opacity: 0.7;
          }
          
          .selected-order {
            margin-bottom: 20px;
          }
          
          .order-sequence {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 10px;
            background-color: rgba(20, 20, 30, 0.5);
            border-radius: 4px;
            min-height: 40px;
            align-items: center;
          }
          
          .order-item {
            padding: 5px 12px;
            background-color: rgba(80, 130, 200, 0.6);
            border-radius: 4px;
            position: relative;
          }
          
          .order-item:not(:last-child)::after {
            content: "→";
            position: absolute;
            right: -12px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
          }
          
          .empty-sequence {
            color: rgba(255, 255, 255, 0.4);
            font-style: italic;
            margin: 0;
          }
          
          /* Memory puzzle styles */
          .memory-text-container {
            max-height: 150px;
            overflow-y: auto;
            padding: 10px;
            background-color: rgba(20, 20, 30, 0.5);
            border-radius: 4px;
            margin-bottom: 20px;
            border: 1px solid rgba(100, 100, 150, 0.3);
          }
          
          .memory-text {
            margin: 0;
            line-height: 1.6;
          }
          
          /* Hint section */
          .puzzle-hint-section {
            padding: 15px;
            border-top: 1px solid rgba(100, 100, 150, 0.3);
            background-color: rgba(20, 20, 30, 0.6);
          }
          
          .hint-button {
            padding: 8px 15px;
            background-color: rgba(100, 70, 140, 0.6);
            border: 1px solid rgba(150, 100, 200, 0.4);
            border-radius: 4px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .hint-button:hover {
            background-color: rgba(120, 90, 160, 0.8);
          }
          
          .hint-display {
            margin-top: 10px;
            padding: 10px;
            background-color: rgba(60, 40, 80, 0.4);
            border-left: 3px solid rgba(120, 80, 180, 0.6);
            border-radius: 4px;
          }
          
          .hint-display p {
            margin: 0 0 8px 0;
            font-style: italic;
          }
          
          .hint-counter {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
          }
          
          /* Animations */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          /* Mobile responsive */
          @media (max-width: 500px) {
            .puzzle-container {
              width: 95%;
            }
            
            .puzzle-title {
              font-size: 1.2rem;
            }
            
            .puzzle-description {
              font-size: 14px;
            }
            
            .puzzle-input {
              width: calc(100% - 80px);
              font-size: 14px;
            }
            
            .puzzle-submit {
              font-size: 14px;
              padding: 8px 12px;
            }
            
            .pattern-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PuzzleInterface;
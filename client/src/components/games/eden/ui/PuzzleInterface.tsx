import React, { useState } from 'react';
import { Puzzle } from '../types';

interface PuzzleInterfaceProps {
  puzzle: Puzzle;
  attempts: number;
  onAttempt: (solution: any) => void;
  onClose: () => void;
}

/**
 * Interface for solving in-game puzzles
 */
const PuzzleInterface: React.FC<PuzzleInterfaceProps> = ({
  puzzle,
  attempts,
  onAttempt,
  onClose
}) => {
  const [solution, setSolution] = useState<any>(initializeSolution(puzzle));
  
  // Handle input changes based on puzzle type
  const handleInputChange = (value: string | number | boolean, key?: string) => {
    if (puzzle.type === 'combination' && key) {
      setSolution({
        ...solution,
        [key]: value
      });
    } else if (puzzle.type === 'order') {
      if (typeof value === 'number') {
        // For order puzzles, we're reordering items
        const newOrder = [...solution.order];
        // Find the item to move
        const itemIndex = newOrder.indexOf(value);
        if (itemIndex !== -1) {
          // Remove the item
          newOrder.splice(itemIndex, 1);
          // Add it back at the end
          newOrder.push(value);
          setSolution({ order: newOrder });
        }
      }
    } else {
      setSolution(value);
    }
  };
  
  // Submit puzzle solution
  const handleSubmit = () => {
    onAttempt(solution);
  };
  
  return (
    <div className="puzzle-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 200
    }}>
      <div className="puzzle-container" style={{
        backgroundColor: '#232323',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '25px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        color: '#fff'
      }}>
        <div className="puzzle-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#f1c40f' }}>{puzzle.name}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              fontSize: '22px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="puzzle-description" style={{
          marginBottom: '25px',
          lineHeight: '1.5',
          fontSize: '16px'
        }}>
          {puzzle.description}
        </div>
        
        <div className="puzzle-interface" style={{
          marginBottom: '25px'
        }}>
          {renderPuzzleInterface(puzzle, solution, handleInputChange)}
        </div>
        
        {attempts > 0 && (
          <div className="puzzle-attempts" style={{
            marginBottom: '15px',
            color: attempts > 2 ? '#e74c3c' : '#f1c40f',
            fontSize: '14px'
          }}>
            Failed attempts: {attempts}
          </div>
        )}
        
        <div className="puzzle-controls" style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#555',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#3498db',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to initialize solution state based on puzzle type
function initializeSolution(puzzle: Puzzle): any {
  switch (puzzle.type) {
    case 'combination':
      return puzzle.inputs.reduce((acc, input) => {
        acc[input.id] = '';
        return acc;
      }, {} as Record<string, string>);
    
    case 'order':
      return {
        order: puzzle.initialState || []
      };
      
    case 'selection':
      return '';
      
    default:
      return '';
  }
}

// Helper function to render puzzle interface based on puzzle type
function renderPuzzleInterface(
  puzzle: Puzzle,
  solution: any,
  handleInputChange: (value: string | number | boolean, key?: string) => void
) {
  switch (puzzle.type) {
    case 'combination':
      return (
        <div className="combination-puzzle" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          {puzzle.inputs.map((input) => (
            <div key={input.id} className="input-group">
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                {input.label}
              </label>
              <input
                type="text"
                value={solution[input.id] || ''}
                onChange={(e) => handleInputChange(e.target.value, input.id)}
                style={{
                  backgroundColor: '#333',
                  border: '1px solid #555',
                  color: '#fff',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </div>
          ))}
        </div>
      );
      
    case 'order':
      return (
        <div className="order-puzzle">
          <div className="items-to-order" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center'
          }}>
            {solution.order.map((itemId: number, index: number) => {
              const item = puzzle.items?.find(i => i.id === itemId);
              return (
                <div
                  key={itemId}
                  className="order-item"
                  onClick={() => handleInputChange(itemId)}
                  style={{
                    backgroundColor: '#444',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: '1px solid #666'
                  }}
                >
                  {index + 1}. {item?.name || `Item ${itemId}`}
                </div>
              );
            })}
          </div>
        </div>
      );
      
    case 'selection':
      return (
        <div className="selection-puzzle">
          <div className="selection-options" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {puzzle.options?.map((option) => (
              <div
                key={option.id}
                className={`selection-option ${solution === option.value ? 'selected' : ''}`}
                onClick={() => handleInputChange(option.value)}
                style={{
                  backgroundColor: solution === option.value ? '#2980b9' : '#444',
                  padding: '12px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      );
      
    default:
      return (
        <div>Unsupported puzzle type</div>
      );
  }
}

export default PuzzleInterface;
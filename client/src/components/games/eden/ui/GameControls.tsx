import React from 'react';

interface GameControlsProps {
  health: number;
  mana: number;
  onInventoryToggle: () => void;
  onSettingsToggle: () => void;
  onSaveGame: () => void;
}

/**
 * Main game controls and status bars
 */
const GameControls: React.FC<GameControlsProps> = ({
  health,
  mana,
  onInventoryToggle,
  onSettingsToggle,
  onSaveGame
}) => {
  return (
    <div className="game-controls" style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      {/* Status bars */}
      <div className="status-bars">
        {/* Health bar */}
        <div className="status-bar health" style={{ marginBottom: '8px' }}>
          <div className="status-label" style={{
            fontSize: '14px',
            marginBottom: '4px',
            color: '#fff',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
          }}>
            Health
          </div>
          <div className="status-bar-container" style={{
            width: '150px',
            height: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div className="status-bar-fill" style={{
              width: `${health}%`,
              height: '100%',
              backgroundColor: '#e74c3c',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        
        {/* Mana bar */}
        <div className="status-bar mana">
          <div className="status-label" style={{
            fontSize: '14px',
            marginBottom: '4px',
            color: '#fff',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
          }}>
            Mana
          </div>
          <div className="status-bar-container" style={{
            width: '150px',
            height: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div className="status-bar-fill" style={{
              width: `${mana}%`,
              height: '100%',
              backgroundColor: '#3498db',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="game-actions" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={onInventoryToggle}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            color: '#fff',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '120px',
            textAlign: 'center'
          }}
        >
          Inventory
        </button>
        
        <button
          onClick={onSaveGame}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            color: '#fff',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '120px',
            textAlign: 'center'
          }}
        >
          Save Game
        </button>
        
        <button
          onClick={onSettingsToggle}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            color: '#fff',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            width: '120px',
            textAlign: 'center'
          }}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default GameControls;
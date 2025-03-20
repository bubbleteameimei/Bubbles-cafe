import React from 'react';

interface GameControlsProps {
  health: number;
  mana: number;
  onInventoryToggle: () => void;
  onSettingsToggle: () => void;
  onSaveGame: () => void;
}

/**
 * Game controls UI component with player stats and action buttons
 */
const GameControls: React.FC<GameControlsProps> = ({
  health,
  mana,
  onInventoryToggle,
  onSettingsToggle,
  onSaveGame
}) => {
  return (
    <div className="game-controls">
      <div className="player-stats">
        <div className="stat health-stat">
          <span className="stat-label">Health:</span>
          <div className="stat-bar-container">
            <div 
              className="stat-bar health-bar" 
              style={{ width: `${health}%` }}
            ></div>
          </div>
          <span className="stat-value">{health}%</span>
        </div>
        
        <div className="stat mana-stat">
          <span className="stat-label">Energy:</span>
          <div className="stat-bar-container">
            <div 
              className="stat-bar mana-bar" 
              style={{ width: `${mana}%` }}
            ></div>
          </div>
          <span className="stat-value">{mana}%</span>
        </div>
      </div>
      
      <div className="control-buttons">
        <button 
          className="control-button inventory-button"
          onClick={onInventoryToggle}
        >
          Inventory
        </button>
        
        <button 
          className="control-button save-button"
          onClick={onSaveGame}
        >
          Save Game
        </button>
        
        <button 
          className="control-button settings-button"
          onClick={onSettingsToggle}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default GameControls;
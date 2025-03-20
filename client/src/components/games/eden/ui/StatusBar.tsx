import React from 'react';

export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  onInventoryClick: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  health, 
  maxHealth, 
  mana, 
  maxMana, 
  onInventoryClick 
}) => {
  const healthPercentage = (health / maxHealth) * 100;
  const manaPercentage = (mana / maxMana) * 100;
  
  // Determine health bar color based on current health percentage
  const getHealthColor = () => {
    if (healthPercentage > 60) return '#4CAF50'; // Green
    if (healthPercentage > 30) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };
  
  return (
    <div className="status-bar">
      <div className="status-container">
        <div className="status-bars">
          <div className="status-bar-label">Health</div>
          <div className="status-bar-container">
            <div 
              className="status-bar-fill health-bar" 
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: getHealthColor()
              }}
            />
          </div>
          <div className="status-bar-value">{Math.floor(health)}/{maxHealth}</div>
        
          <div className="status-bar-label">Mana</div>
          <div className="status-bar-container">
            <div 
              className="status-bar-fill mana-bar" 
              style={{ 
                width: `${manaPercentage}%`,
                backgroundColor: '#2196F3' // Blue
              }}
            />
          </div>
          <div className="status-bar-value">{Math.floor(mana)}/{maxMana}</div>
        </div>
      </div>
      
      <div className="game-controls">
        <button className="inventory-button" onClick={onInventoryClick}>
          Inventory
        </button>
        <button className="menu-button">
          Menu
        </button>
      </div>
      
      <style jsx>{`
        .status-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          color: #fff;
          font-family: 'Cinzel', serif;
          z-index: 100;
        }
        
        .status-container {
          display: flex;
          align-items: center;
        }
        
        .status-bars {
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-gap: 8px;
          align-items: center;
          min-width: 300px;
        }
        
        .status-bar-label {
          font-size: 14px;
          margin-right: 8px;
        }
        
        .status-bar-container {
          height: 12px;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          overflow: hidden;
          width: 100%;
        }
        
        .status-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .status-bar-value {
          font-size: 12px;
          margin-left: 8px;
          min-width: 60px;
          text-align: left;
        }
        
        .game-controls {
          display: flex;
          gap: 10px;
        }
        
        .inventory-button, .menu-button {
          background-color: rgba(50, 50, 50, 0.7);
          color: #fff;
          border: 1px solid #666;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          transition: background-color 0.2s ease;
        }
        
        .inventory-button:hover, .menu-button:hover {
          background-color: rgba(80, 80, 80, 0.9);
        }
      `}</style>
    </div>
  );
};
import React from 'react';

export interface StatusBarProps {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  onInventoryClick: () => void;
  onMapClick: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  health,
  maxHealth,
  mana,
  maxMana,
  onInventoryClick,
  onMapClick
}) => {
  // Calculate health and mana percentages for visual indicators
  const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const manaPercentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
  
  // Determine health color based on percentage
  const getHealthColor = () => {
    if (healthPercentage <= 20) return '#ff3b30'; // Critical - red
    if (healthPercentage <= 50) return '#ff9500'; // Warning - orange
    return '#30d158'; // Good - green
  };
  
  // Determine mana color (always a shade of blue, but intensity varies)
  const getManaColor = () => {
    if (manaPercentage <= 20) return '#5ac8fa'; // Light blue
    if (manaPercentage <= 50) return '#007aff'; // Medium blue
    return '#5e5ce6'; // Deep blue/purple
  };
  
  return (
    <div className="status-bar">
      <div className="status-meters">
        <div className="meter health-meter">
          <div className="meter-label">Health</div>
          <div className="meter-bar">
            <div 
              className="meter-fill health-fill" 
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: getHealthColor()
              }} 
            />
            <div className="meter-text">{health}/{maxHealth}</div>
          </div>
        </div>
        
        <div className="meter mana-meter">
          <div className="meter-label">Mana</div>
          <div className="meter-bar">
            <div 
              className="meter-fill mana-fill" 
              style={{ 
                width: `${manaPercentage}%`,
                backgroundColor: getManaColor()
              }} 
            />
            <div className="meter-text">{mana}/{maxMana}</div>
          </div>
        </div>
      </div>
      
      <div className="status-buttons">
        <button 
          className="status-button inventory-button"
          onClick={onInventoryClick}
        >
          Inventory
        </button>
        <button 
          className="status-button map-button"
          onClick={onMapClick}
        >
          Map
        </button>
      </div>
      
      <style jsx>{`
        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(10, 10, 15, 0.9);
          border-top: 2px solid #8a5c41;
          padding: 10px 15px;
          height: 70px;
          box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2);
        }
        
        .status-meters {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        
        .meter {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .meter-label {
          width: 60px;
          font-size: 14px;
          color: #eee;
          text-align: right;
        }
        
        .meter-bar {
          position: relative;
          height: 15px;
          width: 100%;
          max-width: 250px;
          background-color: rgba(30, 30, 35, 0.7);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #8a5c41;
        }
        
        .meter-fill {
          height: 100%;
          width: 0;
          transition: width 0.5s, background-color 0.5s;
        }
        
        .meter-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        }
        
        .status-buttons {
          display: flex;
          gap: 10px;
        }
        
        .status-button {
          background-color: rgba(60, 40, 30, 0.6);
          border: 1px solid #8a5c41;
          border-radius: 5px;
          color: #f1d7c5;
          padding: 8px 15px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .status-button:hover {
          background-color: rgba(80, 50, 30, 0.7);
          border-color: #a47755;
        }
        
        .inventory-button {
          background-color: rgba(70, 45, 30, 0.7);
        }
        
        .map-button {
          background-color: rgba(40, 50, 60, 0.7);
        }
      `}</style>
    </div>
  );
};
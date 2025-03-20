import React from 'react';
import { StatusBarProps } from '../types';

/**
 * StatusBar component - Displays player health, mana, and game status
 */
const StatusBar: React.FC<StatusBarProps> = ({
  health,
  maxHealth,
  mana,
  maxMana
}) => {
  // Calculate health and mana percentages
  const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const manaPercentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
  
  // Determine health bar color based on health percentage
  const getHealthColor = (): string => {
    if (healthPercentage <= 20) return '#ff3333'; // Red - low health
    if (healthPercentage <= 50) return '#ffaa33'; // Orange - medium health
    return '#33cc33'; // Green - good health
  };
  
  // Format the current/max display values
  const formatStatValue = (current: number, max: number): string => {
    return `${Math.round(current)}/${max}`;
  };
  
  return (
    <div className="status-bar-container">
      <div className="status-bar">
        {/* Health Bar */}
        <div className="stat-container">
          <div className="stat-label">Health</div>
          <div className="stat-bar">
            <div 
              className="stat-fill health-fill" 
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: getHealthColor()
              }}
            />
            <div className="stat-text">
              {formatStatValue(health, maxHealth)}
            </div>
          </div>
        </div>
        
        {/* Mana Bar */}
        <div className="stat-container">
          <div className="stat-label">Mana</div>
          <div className="stat-bar">
            <div 
              className="stat-fill mana-fill"
              style={{ width: `${manaPercentage}%` }}
            />
            <div className="stat-text">
              {formatStatValue(mana, maxMana)}
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          .status-bar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 10px;
            z-index: 900;
            pointer-events: none;
          }
          
          .status-bar {
            background-color: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            padding: 10px 15px;
            display: flex;
            gap: 15px;
            pointer-events: auto;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          
          .stat-container {
            display: flex;
            flex-direction: column;
            min-width: 150px;
          }
          
          .stat-label {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
          }
          
          .stat-bar {
            height: 20px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 3px;
            overflow: hidden;
            position: relative;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .stat-fill {
            height: 100%;
            transition: width 0.3s ease-out;
          }
          
          .health-fill {
            background-color: #33cc33;
            box-shadow: 0 0 5px rgba(51, 204, 51, 0.5);
          }
          
          .mana-fill {
            background-color: #3388ff;
            box-shadow: 0 0 5px rgba(51, 136, 255, 0.5);
          }
          
          .stat-text {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
            letter-spacing: 0.5px;
          }
          
          @media (max-width: 500px) {
            .stat-container {
              min-width: 100px;
            }
            
            .status-bar {
              padding: 8px 12px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default StatusBar;
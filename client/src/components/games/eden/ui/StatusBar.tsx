import React from 'react';
import { StatusBarProps } from '../types';

/**
 * StatusBar Component - Displays player status indicators (health, mana, sanity)
 */
const StatusBar: React.FC<StatusBarProps> = ({
  health,
  maxHealth,
  mana,
  maxMana,
  sanity,
  maxSanity
}) => {
  // Calculate percentages for the bar visuals
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const manaPercent = Math.max(0, Math.min(100, (mana / maxMana) * 100));
  const sanityPercent = sanity && maxSanity ? Math.max(0, Math.min(100, (sanity / maxSanity) * 100)) : 0;
  
  // Determine health bar color based on current health
  const getHealthColor = (): string => {
    if (healthPercent > 60) return '#3bbb4c'; // Green
    if (healthPercent > 30) return '#e6b035'; // Yellow
    return '#bb3b3b'; // Red
  };
  
  // Determine sanity bar color based on current sanity
  const getSanityColor = (): string => {
    if (!sanity || !maxSanity) return '#6b46c1'; // Default purple
    if (sanityPercent > 60) return '#6b46c1'; // Purple
    if (sanityPercent > 30) return '#8246c1'; // Lighter purple
    return '#a546c1'; // Pink/purple
  };
  
  return (
    <div className="status-bar">
      {/* Health Bar */}
      <div className="status-item">
        <div className="status-icon health-icon">❤️</div>
        <div className="status-bar-container">
          <div 
            className="status-bar-fill health-bar" 
            style={{ 
              width: `${healthPercent}%`,
              backgroundColor: getHealthColor() 
            }}
          />
          <span className="status-text">
            {health}/{maxHealth}
          </span>
        </div>
      </div>
      
      {/* Mana Bar */}
      <div className="status-item">
        <div className="status-icon mana-icon">🔮</div>
        <div className="status-bar-container">
          <div 
            className="status-bar-fill mana-bar" 
            style={{ width: `${manaPercent}%` }}
          />
          <span className="status-text">
            {mana}/{maxMana}
          </span>
        </div>
      </div>
      
      {/* Sanity Bar - only show if provided */}
      {sanity !== undefined && maxSanity !== undefined && (
        <div className="status-item">
          <div className="status-icon sanity-icon">🧠</div>
          <div className="status-bar-container">
            <div 
              className="status-bar-fill sanity-bar" 
              style={{ 
                width: `${sanityPercent}%`,
                backgroundColor: getSanityColor()
              }}
            />
            <span className="status-text">
              {sanity}/{maxSanity}
            </span>
          </div>
        </div>
      )}
      
      <style>
        {`
          .status-bar {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 700;
            padding: 10px;
            background-color: rgba(20, 20, 30, 0.7);
            backdrop-filter: blur(5px);
            border-radius: 8px;
            border: 1px solid rgba(100, 100, 150, 0.4);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          
          .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .status-icon {
            font-size: 18px;
            width: 24px;
            text-align: center;
          }
          
          .status-bar-container {
            height: 20px;
            width: 150px;
            background-color: rgba(20, 20, 30, 0.6);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            border: 1px solid rgba(100, 100, 150, 0.4);
          }
          
          .status-bar-fill {
            height: 100%;
            transition: width 0.5s ease;
          }
          
          .health-bar {
            background-color: #3bbb4c;
          }
          
          .mana-bar {
            background-color: #3b5dbb;
          }
          
          .sanity-bar {
            background-color: #6b46c1;
          }
          
          .status-text {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
          }
          
          /* Animations for damage/healing */
          @keyframes damage-flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .damage-animation {
            animation: damage-flash 0.3s ease;
          }
          
          @keyframes healing-glow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.5); }
          }
          
          .healing-animation {
            animation: healing-glow 0.5s ease;
          }
          
          /* Mobile responsive */
          @media (max-width: 500px) {
            .status-bar {
              top: 10px;
              right: 10px;
              padding: 8px;
            }
            
            .status-icon {
              font-size: 16px;
              width: 20px;
            }
            
            .status-bar-container {
              width: 120px;
              height: 18px;
            }
            
            .status-text {
              font-size: 10px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default StatusBar;
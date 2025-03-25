import React from 'react';
import { StatusBarProps } from '../types';

/**
 * StatusBar - Displays player stats like health and mana
 */
const StatusBar: React.FC<StatusBarProps> = ({
  health = 100,
  maxHealth = 100,
  mana = 100,
  maxMana = 100,
  sanity = 100,
  maxSanity = 100,
  showLabels = true,
  compact = false
}) => {
  // Calculate percentages for visual representation
  const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const manaPercentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
  const sanityPercentage = Math.max(0, Math.min(100, (sanity / maxSanity) * 100));
  
  // Get color classes based on status values
  const getHealthColorClass = () => {
    if (healthPercentage > 60) return 'status-good';
    if (healthPercentage > 30) return 'status-warning';
    return 'status-danger';
  };
  
  const getManaColorClass = () => {
    if (manaPercentage > 60) return 'status-good-mana';
    if (manaPercentage > 30) return 'status-warning-mana';
    return 'status-danger-mana';
  };
  
  const getSanityColorClass = () => {
    if (sanityPercentage > 60) return 'status-good-sanity';
    if (sanityPercentage > 30) return 'status-warning-sanity';
    return 'status-danger-sanity';
  };
  
  return (
    <div className={`status-bar ${compact ? 'status-bar-compact' : ''}`}>
      {/* Health Bar */}
      <div className="status-item">
        {showLabels && <div className="status-label">Health</div>}
        <div className="status-bar-container">
          <div 
            className={`status-bar-fill ${getHealthColorClass()}`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
          <div className="status-value">{Math.floor(health)}/{maxHealth}</div>
        </div>
      </div>
      
      {/* Mana Bar */}
      <div className="status-item">
        {showLabels && <div className="status-label">Mana</div>}
        <div className="status-bar-container">
          <div 
            className={`status-bar-fill ${getManaColorClass()}`}
            style={{ width: `${manaPercentage}%` }}
          ></div>
          <div className="status-value">{Math.floor(mana)}/{maxMana}</div>
        </div>
      </div>
      
      {/* Sanity Bar */}
      <div className="status-item">
        {showLabels && <div className="status-label">Sanity</div>}
        <div className="status-bar-container">
          <div 
            className={`status-bar-fill ${getSanityColorClass()}`}
            style={{ width: `${sanityPercentage}%` }}
          ></div>
          <div className="status-value">{Math.floor(sanity)}/{maxSanity}</div>
        </div>
      </div>
      
      <style jsx>{`
        .status-bar {
          display: flex;
          gap: 15px;
          background-color: rgba(20, 20, 30, 0.85);
          border: 1px solid rgba(100, 100, 150, 0.4);
          border-radius: 6px;
          padding: 10px 15px;
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          width: 100%;
        }
        
        .status-bar-compact {
          padding: 6px 10px;
          gap: 8px;
        }
        
        .status-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .status-label {
          font-size: 14px;
          color: #b0b0c0;
          margin-bottom: 2px;
        }
        
        .status-bar-compact .status-label {
          font-size: 12px;
          margin-bottom: 1px;
        }
        
        .status-bar-container {
          position: relative;
          height: 20px;
          background-color: rgba(40, 40, 50, 0.7);
          border: 1px solid rgba(80, 80, 110, 0.4);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .status-bar-compact .status-bar-container {
          height: 16px;
        }
        
        .status-bar-fill {
          height: 100%;
          transition: width 0.5s ease-out;
        }
        
        /* Health status colors */
        .status-good {
          background: linear-gradient(to bottom, #4caf50, #388e3c);
        }
        
        .status-warning {
          background: linear-gradient(to bottom, #ffc107, #ffa000);
        }
        
        .status-danger {
          background: linear-gradient(to bottom, #f44336, #d32f2f);
        }
        
        /* Mana status colors */
        .status-good-mana {
          background: linear-gradient(to bottom, #2196f3, #1976d2);
        }
        
        .status-warning-mana {
          background: linear-gradient(to bottom, #03a9f4, #0288d1);
        }
        
        .status-danger-mana {
          background: linear-gradient(to bottom, #80deea, #4dd0e1);
        }
        
        /* Sanity status colors */
        .status-good-sanity {
          background: linear-gradient(to bottom, #9c27b0, #7b1fa2);
        }
        
        .status-warning-sanity {
          background: linear-gradient(to bottom, #ba68c8, #ab47bc);
        }
        
        .status-danger-sanity {
          background: linear-gradient(to bottom, #ff9e80, #ff6e40);
        }
        
        .status-value {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #ffffff;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9);
        }
        
        .status-bar-compact .status-value {
          font-size: 10px;
        }
        
        /* Animation for critical status */
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        .status-danger, .status-danger-mana, .status-danger-sanity {
          animation: pulse 1.5s infinite;
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
          .status-bar {
            padding: 8px 10px;
            gap: 6px;
          }
          
          .status-label {
            font-size: 12px;
          }
          
          .status-bar-container {
            height: 16px;
          }
          
          .status-value {
            font-size: 10px;
          }
          
          .status-bar-compact {
            padding: 5px 8px;
          }
          
          .status-bar-compact .status-label {
            font-size: 10px;
          }
          
          .status-bar-compact .status-bar-container {
            height: 14px;
          }
          
          .status-bar-compact .status-value {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};

export default StatusBar;
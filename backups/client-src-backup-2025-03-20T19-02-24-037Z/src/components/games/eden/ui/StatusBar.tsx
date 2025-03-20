import React from 'react';
import { StatusBarProps } from '../types';

/**
 * StatusBar - Displays player's statistics like health, mana, and sanity
 */
const StatusBar: React.FC<StatusBarProps> = ({
  health,
  maxHealth,
  mana,
  maxMana, 
  sanity,
  maxSanity,
  showLabels = true,
  compact = false
}) => {
  
  // Calculate percentages
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const manaPercent = Math.max(0, Math.min(100, (mana / maxMana) * 100));
  const sanityPercent = Math.max(0, Math.min(100, (sanity / maxSanity) * 100));
  
  // Get color based on percentage
  const getHealthColor = (percent: number) => {
    if (percent <= 25) return '#e53935'; // Critical - red
    if (percent <= 50) return '#ff9800'; // Low - orange
    return '#43a047'; // Good - green
  };
  
  const getManaColor = (percent: number) => {
    if (percent <= 25) return '#5c6bc0'; // Critical - light blue
    if (percent <= 50) return '#3949ab'; // Low - medium blue
    return '#283593'; // Good - deep blue
  };
  
  const getSanityColor = (percent: number) => {
    if (percent <= 25) return '#9c27b0'; // Critical - dark purple
    if (percent <= 50) return '#7b1fa2'; // Low - medium purple
    return '#6a1b9a'; // Good - purple
  };
  
  return (
    <div className={`status-bar ${compact ? 'compact' : ''}`}>
      {/* Health */}
      <div className="status-section">
        {showLabels && <span className="status-label">Health</span>}
        <div className="status-bar-container">
          <div 
            className="status-bar-fill health" 
            style={{ 
              width: `${healthPercent}%`,
              backgroundColor: getHealthColor(healthPercent)
            }}
          ></div>
          <span className="status-value">{health}/{maxHealth}</span>
        </div>
      </div>
      
      {/* Mana */}
      <div className="status-section">
        {showLabels && <span className="status-label">Mana</span>}
        <div className="status-bar-container">
          <div 
            className="status-bar-fill mana" 
            style={{ 
              width: `${manaPercent}%`,
              backgroundColor: getManaColor(manaPercent)
            }}
          ></div>
          <span className="status-value">{mana}/{maxMana}</span>
        </div>
      </div>
      
      {/* Sanity */}
      <div className="status-section">
        {showLabels && <span className="status-label">Sanity</span>}
        <div className="status-bar-container">
          <div 
            className="status-bar-fill sanity" 
            style={{ 
              width: `${sanityPercent}%`,
              backgroundColor: getSanityColor(sanityPercent)
            }}
          ></div>
          <span className="status-value">{sanity}/{maxSanity}</span>
        </div>
      </div>
      
      <style jsx>{`
        .status-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          background-color: rgba(20, 20, 30, 0.85);
          border-radius: 8px;
          border: 1px solid rgba(100, 100, 150, 0.4);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          font-family: 'Times New Roman', serif;
          color: #e0e0e0;
          width: 100%;
        }
        
        .status-bar.compact {
          flex-direction: row;
          gap: 15px;
          padding: 8px 12px;
        }
        
        .status-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .status-bar.compact .status-section {
          flex: 1;
        }
        
        .status-label {
          font-size: 14px;
          color: #b0b0c0;
        }
        
        .status-bar-container {
          height: 20px;
          background-color: rgba(50, 50, 60, 0.6);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .status-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease, background-color 0.5s ease;
        }
        
        .status-bar-fill.health {
          background-color: #43a047;
          box-shadow: 0 0 8px rgba(67, 160, 71, 0.5);
        }
        
        .status-bar-fill.mana {
          background-color: #283593;
          box-shadow: 0 0 8px rgba(40, 53, 147, 0.5);
        }
        
        .status-bar-fill.sanity {
          background-color: #6a1b9a;
          box-shadow: 0 0 8px rgba(106, 27, 154, 0.5);
        }
        
        .status-value {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          pointer-events: none;
        }
        
        /* Special effects for low values */
        .status-bar-fill.health[style*="width: 25%"], 
        .status-bar-fill.health[style*="width: 20%"],
        .status-bar-fill.health[style*="width: 15%"],
        .status-bar-fill.health[style*="width: 10%"],
        .status-bar-fill.health[style*="width: 5%"] {
          animation: pulse 1s infinite alternate;
        }
        
        .status-bar-fill.sanity[style*="width: 25%"], 
        .status-bar-fill.sanity[style*="width: 20%"],
        .status-bar-fill.sanity[style*="width: 15%"],
        .status-bar-fill.sanity[style*="width: 10%"],
        .status-bar-fill.sanity[style*="width: 5%"] {
          animation: flicker 1.5s infinite alternate;
        }
        
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
          75% { opacity: 0.7; }
        }
        
        @media (max-width: 768px) {
          .status-bar {
            padding: 8px;
            gap: 6px;
          }
          
          .status-bar.compact {
            padding: 6px 10px;
            gap: 10px;
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
        }
      `}</style>
    </div>
  );
};

export default StatusBar;
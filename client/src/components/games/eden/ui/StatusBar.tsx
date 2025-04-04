/**
 * Eden's Hollow Status Bar
 * Displays player stats (sanity & corruption)
 */

import React from 'react';
import './StatusBar.css';
import { Player } from '../types';

interface StatusBarProps {
  player: Player;
}

/**
 * Status Bar Component
 * Shows the player's current statistics (sanity, corruption, etc.)
 */
const StatusBar: React.FC<StatusBarProps> = ({ player }) => {
  // Determine style classes for sanity bar
  const getSanityBarClass = () => {
    if (player.sanity >= 75) return 'high';
    if (player.sanity >= 50) return 'medium';
    if (player.sanity >= 25) return 'low';
    return 'critical';
  };
  
  // Determine style classes for corruption bar
  const getCorruptionBarClass = () => {
    if (player.corruption <= 25) return 'low';
    if (player.corruption <= 50) return 'medium';
    if (player.corruption <= 75) return 'high';
    return 'critical';
  };
  
  // Format location for display
  const formatLocation = (location: string) => {
    return location.length > 30 ? location.substring(0, 27) + '...' : location;
  };
  
  return (
    <div className="eden-status-bar">
      <div className="eden-status-wrapper">
        {/* Sanity Status */}
        <div className="eden-status-group">
          <div className="eden-status-label">Sanity</div>
          <div className="eden-status-bar-container">
            <div 
              className={`eden-sanity-bar ${getSanityBarClass()}`} 
              style={{ width: `${player.sanity}%` }}
            ></div>
          </div>
          <div className="eden-status-value">{player.sanity}/100</div>
        </div>
        
        {/* Corruption Status */}
        <div className="eden-status-group">
          <div className="eden-status-label">Corruption</div>
          <div className="eden-status-bar-container">
            <div 
              className={`eden-corruption-bar ${getCorruptionBarClass()}`} 
              style={{ width: `${player.corruption}%` }}
            ></div>
          </div>
          <div className="eden-status-value">{player.corruption}/100</div>
        </div>
      </div>
      
      {/* Player Info */}
      <div className="eden-player-info">
        <div className="eden-info-group">
          <div className="eden-info-label">Location</div>
          <div className="eden-info-value">{formatLocation(player.location)}</div>
        </div>
        
        <div className="eden-info-group">
          <div className="eden-info-label">Time</div>
          <div className="eden-info-value">{player.time}</div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
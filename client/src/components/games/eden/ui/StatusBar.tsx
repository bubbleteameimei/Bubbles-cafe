/**
 * Status Bar Component
 * 
 * This component displays the player's health, sanity, and corruption levels.
 */
import React from 'react';
import { StatusBarProps } from '../types';
import '../styles/game.css';
import { getSanityStatusText, getCorruptionStatusText } from '../utils/gameUtils';

const StatusBar: React.FC<StatusBarProps> = ({ playerState }) => {
  const { health, sanity, corruption } = playerState;

  return (
    <div className="eden-status-bar">
      <div className="eden-status-item">
        <div className="eden-status-label">Health</div>
        <div className="eden-status-value">{health.toFixed(0)}%</div>
        <div className="eden-health-bar">
          <div 
            className="eden-health-fill" 
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

      <div className="eden-status-item">
        <div className="eden-status-label">Sanity</div>
        <div className="eden-status-value">
          {sanity.toFixed(0)}% - {getSanityStatusText(sanity)}
        </div>
        <div className="eden-sanity-bar">
          <div 
            className="eden-sanity-fill" 
            style={{ width: `${sanity}%` }}
          />
        </div>
      </div>

      <div className="eden-status-item">
        <div className="eden-status-label">Corruption</div>
        <div className="eden-status-value">
          {corruption.toFixed(0)}% - {getCorruptionStatusText(corruption)}
        </div>
        <div className="eden-corruption-bar">
          <div 
            className="eden-corruption-fill" 
            style={{ width: `${corruption}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
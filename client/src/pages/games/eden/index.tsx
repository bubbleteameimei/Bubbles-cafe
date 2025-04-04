/**
 * Eden's Hollow Game Page
 * Main entry point for the game with layout and container
 */

import React, { useState } from 'react';
import { GameEngine } from '../../../components/games/eden/core/GameEngine';
import GameUI from '../../../components/games/eden/ui/GameUI';
import { GameState } from '../../../components/games/eden/types';
import './styles.css';

/**
 * Eden's Hollow Game Page Component
 */
const EdensHollowPage: React.FC = () => {
  const [gameOver, setGameOver] = useState(false);
  const [finalState, setFinalState] = useState<GameState | null>(null);
  
  // Handle game completion
  const handleGameEnd = (endState: GameState) => {
    setGameOver(true);
    setFinalState(endState);
  };
  
  // Handle starting a new game
  const handleStartNewGame = () => {
    setGameOver(false);
    setFinalState(null);
    // The game will be reinitialized due to component remount
  };
  
  // Game completion stats
  const renderGameCompletion = () => {
    if (!finalState) return null;
    
    return (
      <div className="eden-game-completion">
        <h2 className="eden-completion-title">
          {finalState.gameWon ? 'You Survived Eden\'s Hollow' : 'The Darkness Has Claimed You'}
        </h2>
        
        <div className="eden-completion-stats">
          <div className="eden-stat">
            <div className="eden-stat-label">Time Played</div>
            <div className="eden-stat-value">
              {Math.floor(finalState.playTime / 60)}m {finalState.playTime % 60}s
            </div>
          </div>
          
          <div className="eden-stat">
            <div className="eden-stat-label">Final Sanity</div>
            <div className="eden-stat-value">{finalState.player.sanity}%</div>
          </div>
          
          <div className="eden-stat">
            <div className="eden-stat-label">Corruption Level</div>
            <div className="eden-stat-value">{finalState.player.corruption}%</div>
          </div>
          
          <div className="eden-stat">
            <div className="eden-stat-label">Locations Visited</div>
            <div className="eden-stat-value">{finalState.visitedScenes.length}</div>
          </div>
          
          <div className="eden-stat">
            <div className="eden-stat-label">Decisions Made</div>
            <div className="eden-stat-value">{finalState.player.decisions.length}</div>
          </div>
        </div>
        
        <button className="eden-new-game-btn" onClick={handleStartNewGame}>
          Brave the Hollow Again
        </button>
      </div>
    );
  };
  
  return (
    <div className="eden-page-container">
      <div className="eden-background-overlay"></div>
      
      {!gameOver ? (
        <div className="eden-game-container">
          <GameEngine onGameEnd={handleGameEnd}>
            <GameUI />
          </GameEngine>
        </div>
      ) : (
        renderGameCompletion()
      )}
      
      <div className="eden-footer">
        <p>Eden's Hollow - An Interactive Dark Fantasy Experience</p>
      </div>
    </div>
  );
};

export default EdensHollowPage;
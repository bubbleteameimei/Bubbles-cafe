/**
 * Eden's Hollow Game Entry Point
 * 
 * This component serves as the main entry point for the Eden's Hollow game.
 * It sets up the game configuration and initializes the GameEngine.
 */
import React from 'react';
import GameEngine from './core/GameEngine';
import GameUI from './ui/GameUI';
import { gameConfig } from './data/gameState';
import { scenes } from './data/scenes';
import './styles/game.css';

/**
 * Main Eden's Hollow Game Component
 */
const EdensHollowGame: React.FC = () => {
  return (
    <div className="eden-game-wrapper">
      <GameEngine 
        config={gameConfig}
        scenes={scenes}
      >
        {(props) => <GameUI {...props} />}
      </GameEngine>
    </div>
  );
};

export default EdensHollowGame;
/**
 * Eden's Hollow Game - Game Page Component
 * 
 * This page displays the game container and provides any surrounding UI
 * or controls needed for the game experience.
 */

import React from 'react';
import GameContainer from '../components/GameContainer';

const GamePage: React.FC = () => {
  return (
    <div className="game-page">
      <header className="game-header">
        <h1 className="game-title">Eden's Hollow</h1>
        <p className="game-subtitle">A Pixel Art Adventure</p>
      </header>
      
      <main className="game-main">
        <GameContainer className="main-game" />
        
        <div className="game-controls">
          <div className="control-info">
            <h3>Controls</h3>
            <ul>
              <li>Arrow Keys: Move character</li>
              <li>Space: Interact</li>
              <li>E: Open inventory</li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="game-footer">
        <p>Pixel art assets loaded and rendered with Phaser.js</p>
      </footer>
      
      <style jsx>{`
        .game-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 2rem;
          background-color: #1a1a2d;
          color: #ffffff;
        }
        
        .game-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .game-title {
          font-family: 'Courier New', monospace;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ffec27; /* Using our palette yellow */
        }
        
        .game-subtitle {
          font-size: 1.2rem;
          opacity: 0.8;
        }
        
        .game-main {
          display: flex;
          flex-direction: column;
          flex: 1;
          align-items: center;
        }
        
        .game-controls {
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
        }
        
        .control-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .control-info h3 {
          margin-bottom: 0.5rem;
          color: #29adff; /* Using our palette blue */
        }
        
        .control-info ul {
          list-style-type: none;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }
        
        .control-info li {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: monospace;
        }
        
        .game-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        @media (max-width: 768px) {
          .game-page {
            padding: 1rem;
          }
          
          .game-title {
            font-size: 2rem;
          }
          
          .control-info ul {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GamePage;
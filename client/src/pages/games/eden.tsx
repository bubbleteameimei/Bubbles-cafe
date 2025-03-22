/**
 * Eden's Hollow Game Page
 * This is the main page for the game
 */

import React, { useState } from 'react';
import GameContainer from '../../components/GameContainer';
import Game from '../../game/Game';
import { Link } from 'wouter';

export default function EdenGame() {
  const [gameInstance, setGameInstance] = useState<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Handle game ready event
  const handleGameReady = (game: Game) => {
    setGameInstance(game);
    console.log('Eden\'s Hollow game is ready!');
  };

  // Start the game and hide intro screen
  const handleStartGame = () => {
    setGameStarted(true);
    setShowInstructions(false);
  };

  // Toggle instructions overlay
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="eden-game-page">
      <header className="game-header">
        <div className="header-content">
          <h1 className="game-title">Eden's Hollow</h1>
          <div className="header-actions">
            {gameStarted && (
              <button 
                className="help-button"
                onClick={toggleInstructions}
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </button>
            )}
            <Link href="/stories">
              <a className="back-link">Return to Stories</a>
            </Link>
          </div>
        </div>
      </header>

      <div className="game-container-wrapper">
        {/* Game Container */}
        <div className="game-main-container">
          <GameContainer
            width="100%"
            height="600px"
            autoStart={false}
            onGameReady={handleGameReady}
            className={gameStarted ? 'game-started' : 'game-intro'}
          />

          {/* Intro Screen (shown before game starts) */}
          {!gameStarted && (
            <div className="game-intro-overlay">
              <div className="intro-content">
                <h2>Welcome to Eden's Hollow</h2>
                <p className="intro-description">
                  Explore the mysterious world of Eden's Hollow, a pixel art adventure filled with secrets and stories to uncover.
                </p>
                <div className="intro-actions">
                  <button 
                    className="start-button"
                    onClick={handleStartGame}
                  >
                    Start Adventure
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Overlay (can be toggled) */}
          {showInstructions && gameStarted && (
            <div className="instructions-overlay">
              <div className="instructions-content">
                <h3>How to Play</h3>
                <ul className="controls-list">
                  <li><span className="key">Arrow Keys</span>: Move your character</li>
                  <li><span className="key">Space</span>: Interact with objects</li>
                  <li><span className="key">Z/X</span>: Zoom in/out</li>
                </ul>
                <div className="objective">
                  <h4>Your Quest:</h4>
                  <p>Explore Eden's Hollow, collect items, and uncover its secrets. Find the hidden chests for special rewards!</p>
                </div>
                <button 
                  className="close-instructions"
                  onClick={toggleInstructions}
                >
                  Close Instructions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="game-footer">
        <p>Eden's Hollow © 2025 - A pixel art adventure</p>
      </footer>

      <style>{`
        .eden-game-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #121212;
          color: #eaeaea;
        }

        .game-header {
          padding: 1rem;
          background-color: #1f1f1f;
          border-bottom: 2px solid #333;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .game-title {
          font-family: 'Courier New', monospace;
          font-size: 1.8rem;
          margin: 0;
          color: #32CD32; /* Pixel-like green */
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .help-button, .back-link {
          padding: 0.5rem 1rem;
          background-color: #333;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .help-button:hover, .back-link:hover {
          background-color: #444;
        }

        .game-container-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .game-main-container {
          position: relative;
          width: 100%;
          max-width: 1000px;
          border: 4px solid #333;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }

        .game-intro-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .intro-content {
          text-align: center;
          max-width: 80%;
          background-color: #1f1f1f;
          padding: 2rem;
          border-radius: 8px;
          border: 2px solid #32CD32;
        }

        .intro-description {
          margin: 1.5rem 0;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .intro-actions {
          margin-top: 2rem;
        }

        .start-button {
          padding: 0.8rem 2rem;
          background-color: #32CD32;
          color: #000;
          border: none;
          border-radius: 4px;
          font-size: 1.2rem;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }

        .start-button:hover {
          background-color: #28A428;
          transform: scale(1.05);
        }

        .instructions-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 300px;
          background-color: rgba(31, 31, 31, 0.9);
          border-radius: 8px;
          border: 2px solid #32CD32;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          z-index: 15;
          transition: all 0.3s ease;
        }

        .instructions-content {
          padding: 1.5rem;
        }

        .instructions-content h3 {
          margin-top: 0;
          color: #32CD32;
          font-family: 'Courier New', monospace;
        }

        .controls-list {
          list-style-type: none;
          padding-left: 0;
          margin: 1rem 0;
        }

        .controls-list li {
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
        }

        .key {
          display: inline-block;
          background-color: #333;
          padding: 0.2rem 0.5rem;
          margin-right: 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: bold;
          min-width: 30px;
          text-align: center;
        }

        .objective {
          margin-top: 1.5rem;
          border-top: 1px solid #444;
          padding-top: 1.5rem;
        }

        .objective h4 {
          margin-top: 0;
          color: #32CD32;
        }

        .close-instructions {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: transparent;
          color: #fff;
          border: 1px solid #555;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .close-instructions:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .game-footer {
          text-align: center;
          padding: 1rem;
          background-color: #1a1a1a;
          font-size: 0.9rem;
          color: #888;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .game-container-wrapper {
            padding: 1rem;
          }

          .instructions-overlay {
            width: 90%;
            right: 5%;
          }
        }
      `}</style>
    </div>
  );
}
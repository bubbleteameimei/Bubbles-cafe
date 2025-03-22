/**
 * Eden's Hollow Game Page
 * This is the main page for the game
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

// Instead of importing directly (which might cause the error), we'll load Phaser dynamically
// and only render the game container when we're sure Phaser is available
const GameContainer = React.lazy(() => import('../../components/GameContainer'));

// Ensure Phaser is in the global namespace
declare global {
  interface Window {
    Phaser: any;
  }
}

export default function EdenGame() {
  const [gameInstance, setGameInstance] = useState<any | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const [loadingPhaser, setLoadingPhaser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Phaser library on component mount
  useEffect(() => {
    const loadPhaserScript = async () => {
      try {
        // Check if Phaser is already available
        if (window.Phaser) {
          console.log("Phaser is already loaded:", window.Phaser.VERSION);
          setPhaserLoaded(true);
          setLoadingPhaser(false);
          return;
        }

        console.log("Loading Phaser script...");
        setLoadingPhaser(true);

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
        script.async = true;
        
        // Create promise to handle script loading
        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log("Phaser script loaded successfully:", window.Phaser?.VERSION);
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Failed to load Phaser script"));
          };
        });
        
        // Add script to document
        document.head.appendChild(script);
        
        // Wait for script to load
        await loadPromise;
        
        // Verify Phaser is now available
        if (!window.Phaser) {
          throw new Error("Phaser failed to initialize correctly");
        }
        
        // Update state
        setPhaserLoaded(true);
        setLoadingPhaser(false);
      } catch (err) {
        console.error("Error loading Phaser:", err);
        setError(`Failed to load game engine: ${err instanceof Error ? err.message : String(err)}`);
        setLoadingPhaser(false);
      }
    };

    loadPhaserScript();
    
    // Cleanup function
    return () => {
      // Nothing to clean up for script loading
    };
  }, []);

  // Handle game ready event
  const handleGameReady = (game: any) => {
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
          {loadingPhaser && (
            <div className="game-loading">
              <div className="loading-spinner"></div>
              <p>Loading game engine...</p>
            </div>
          )}
          
          {error && (
            <div className="game-error">
              <h3>Game Error</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
          
          {phaserLoaded && !error && (
            <React.Suspense fallback={
              <div className="game-loading">
                <div className="loading-spinner"></div>
                <p>Initializing game...</p>
              </div>
            }>
              <GameContainer
                width="100%"
                height="600px"
                autoStart={false}
                onGameReady={handleGameReady}
                className={gameStarted ? 'game-started' : 'game-intro'}
              />
            </React.Suspense>
          )}

          {/* Intro Screen (shown before game starts) */}
          {!gameStarted && !loadingPhaser && !error && (
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
          {showInstructions && gameStarted && !error && (
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
          z-index: 20;
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
          min-height: 600px;
        }

        .game-loading, .game-error {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 25;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #32CD32;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .game-error {
          background-color: rgba(0, 0, 0, 0.9);
          text-align: center;
          padding: 2rem;
        }

        .game-error h3 {
          color: #ff6b6b;
          margin-top: 0;
        }

        .game-error button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #444;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .game-error button:hover {
          background-color: #555;
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
          z-index: 20;
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
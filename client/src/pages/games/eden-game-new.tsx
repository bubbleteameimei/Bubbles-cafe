/**
 * Eden's Hollow Game - PixelEngine Implementation
 * A pixel art style adventure game built with our custom Canvas-based engine
 */

import React, { useEffect, useRef, useState } from 'react';
import { PixelEngine } from '../../game/pixelEngine/PixelEngine';
import { GameWorld } from '../../game/pixelEngine/scenes/GameWorld';

const EdenGameNew: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pixelEngineRef = useRef<PixelEngine | null>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);

  // Initialize game when component mounts
  useEffect(() => {
    // Safety check for browser environment
    if (typeof window === 'undefined' || !canvasRef.current || gameInitialized) return;

    try {
      setIsLoading(true);
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 480;
      canvas.className = 'game-canvas';
      canvas.tabIndex = 0;
      
      // Clear any existing content and append the new canvas
      if (canvasRef.current.firstChild) {
        canvasRef.current.innerHTML = '';
      }
      canvasRef.current.appendChild(canvas);
      
      // Safe initialization with error handling
      setTimeout(() => {
        try {
          // Initialize PixelEngine with proper configuration
          const pixelEngine = new PixelEngine({
            width: canvas.width,
            height: canvas.height,
            parent: canvasRef.current || document.body,
            backgroundColor: '#000000',
            fps: 60,
            pixelScale: 1,
            debug: false
          });
          pixelEngineRef.current = pixelEngine;
          
          // Create game world
          const gameWorld = new GameWorld(pixelEngine, {
            gravity: 800,
            playerSpeed: 300,
            jumpForce: 500,
            collectibles: 15,
            debug: false
          });
          gameWorldRef.current = gameWorld;
          
          // Start the game
          pixelEngine.start();
          gameWorld.startGame();
          
          // Update game initialized flag
          setGameInitialized(true);
          setIsLoading(false);
          
          // Set up game score/lives update interval
          const updateInterval = setInterval(() => {
            if (gameWorldRef.current) {
              setScore(gameWorldRef.current.getScore());
              setLives(gameWorldRef.current.getLives());
            }
          }, 500);
          
          // Cleanup function
          return () => {
            clearInterval(updateInterval);
            if (pixelEngineRef.current) {
              pixelEngineRef.current.stop();
            }
          };
        } catch (err) {
          console.error('Failed to initialize game:', err);
          setError('Failed to initialize game. Please try refreshing the page.');
          setIsLoading(false);
        }
      }, 100);
    } catch (err) {
      console.error('Error in game initialization:', err);
      setError('Failed to set up game environment. Please try refreshing the page.');
      setIsLoading(false);
    }
  }, [gameInitialized]);
  
  // Handle pause/resume
  const togglePause = () => {
    if (!gameWorldRef.current) return;
    
    if (isPaused) {
      gameWorldRef.current.resumeGame();
    } else {
      gameWorldRef.current.pauseGame();
    }
    
    setIsPaused(!isPaused);
  };
  
  // Handle restart
  const restartGame = () => {
    if (!canvasRef.current || !pixelEngineRef.current) return;
    
    try {
      // Clean up existing game
      pixelEngineRef.current.stop();
      
      // Reset state
      setGameInitialized(false);
      setScore(0);
      setLives(3);
      setIsPaused(false);
      setError(null);
    } catch (err) {
      console.error('Error during game restart:', err);
      setError('Failed to restart game. Please refresh the page.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="eden-game-loading">
        <h2>Loading Eden's Hollow...</h2>
        <div className="loading-spinner"></div>
        <style jsx>{`
          .eden-game-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #121212;
            color: #eaeaea;
          }
          .loading-spinner {
            margin-top: 20px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: #32CD32;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="eden-game-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={restartGame}>Try Again</button>
        <style jsx>{`
          .eden-game-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #121212;
            color: #eaeaea;
            padding: 20px;
            text-align: center;
          }
          button {
            margin-top: 20px;
            background-color: #32CD32;
            color: #121212;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Game UI
  return (
    <div className="eden-game-container">
      <div className="game-header">
        <h1>Eden's Hollow</h1>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Lives: {lives}</div>
        </div>
        <div className="game-controls">
          <button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
          <button onClick={restartGame}>Restart</button>
        </div>
      </div>
      
      <div className="game-canvas-container">
        <div ref={canvasRef} className="canvas-wrapper"></div>
      </div>
      
      <div className="game-instructions">
        <h3>How to Play</h3>
        <ul>
          <li>Use <kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> to move</li>
          <li>Press <kbd>↑</kbd>, <kbd>W</kbd>, or <kbd>Space</kbd> to jump</li>
          <li>Collect coins for points</li>
          <li>Find potions for extra lives</li>
          <li>Reach the treasure chest to win!</li>
        </ul>
      </div>
      
      <style>{`
        .eden-game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background-color: #121212;
          color: #eaeaea;
          min-height: 100vh;
        }
        
        .game-header {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }
        
        .game-header h1 {
          text-align: center;
          margin: 0 0 15px 0;
          color: #32CD32;
          font-size: 2.5rem;
          text-shadow: 0 0 10px rgba(50, 205, 50, 0.5);
        }
        
        .game-stats {
          display: flex;
          justify-content: space-between;
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        
        .game-controls {
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        
        .game-controls button {
          background-color: #32CD32;
          color: #121212;
          border: none;
          padding: 8px 16px;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .game-controls button:hover {
          background-color: #2ECC71;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(46, 204, 113, 0.5);
        }
        
        .game-canvas-container {
          position: relative;
          width: 800px;
          height: 480px;
          border: 3px solid #32CD32;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(50, 205, 50, 0.3);
        }
        
        .canvas-wrapper {
          width: 100%;
          height: 100%;
        }
        
        .game-canvas {
          display: block;
          background-color: #000000;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        .game-instructions {
          margin-top: 25px;
          background-color: rgba(50, 205, 50, 0.1);
          border: 1px solid rgba(50, 205, 50, 0.3);
          border-radius: 8px;
          padding: 15px 25px;
          max-width: 800px;
        }
        
        .game-instructions h3 {
          color: #32CD32;
          margin-top: 0;
        }
        
        .game-instructions ul {
          padding-left: 20px;
        }
        
        .game-instructions li {
          margin-bottom: 8px;
        }
        
        kbd {
          background-color: #333;
          border-radius: 3px;
          border: 1px solid #666;
          box-shadow: 0 1px 1px rgba(0,0,0,.2), 0 2px 0 0 rgba(255,255,255,.1) inset;
          color: #fff;
          display: inline-block;
          font-size: .85em;
          font-weight: 700;
          line-height: 1;
          padding: 2px 5px;
          margin: 0 2px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default EdenGameNew;
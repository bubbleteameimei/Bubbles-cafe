import React, { useEffect, useRef, useState } from 'react';
import { PixelEngine } from '../../game/pixelEngine/PixelEngine';
import { GameWorld, GameState } from '../../game/pixelEngine/scenes/GameWorld';

/**
 * Eden's Hollow Game Component
 * 
 * A pixel art-style adventure game built with a custom Canvas-based game engine.
 */
const EdenGame: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<PixelEngine | null>(null);
  const [gameWorld, setGameWorld] = useState<GameWorld | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [showControls, setShowControls] = useState<boolean>(false);
  
  // Initialize the game engine and world
  useEffect(() => {
    if (!gameContainerRef.current) return;
    
    // Create the game engine
    const pixelEngine = new PixelEngine({
      width: 800,
      height: 400,
      parent: gameContainerRef.current,
      backgroundColor: '#87CEEB',
      fps: 60,
      pixelScale: 1,
      debug: false
    });
    
    // Create the game world
    const world = new GameWorld(pixelEngine, {
      gravity: 980,
      playerSpeed: 200,
      jumpForce: 450,
      collectibles: 12,
      debug: false
    });
    
    // Store references
    setEngine(pixelEngine);
    setGameWorld(world);
    
    // Start the game engine
    pixelEngine.start();
    
    // Set up game state update interval
    const stateInterval = setInterval(() => {
      if (world) {
        setGameState(world.getGameState());
        setScore(world.getScore());
        setLives(world.getLives());
      }
    }, 500);
    
    // Cleanup function
    return () => {
      clearInterval(stateInterval);
      pixelEngine.stop();
    };
  }, [gameContainerRef]);
  
  // Handle start game button
  const handleStartGame = () => {
    if (gameWorld && gameState === GameState.READY) {
      gameWorld.startGame();
    }
  };
  
  // Handle pause/resume game button
  const handlePauseResumeGame = () => {
    if (!gameWorld) return;
    
    if (gameState === GameState.PLAYING) {
      gameWorld.pauseGame();
    } else if (gameState === GameState.PAUSED) {
      gameWorld.resumeGame();
    }
  };
  
  // Show/hide controls
  const toggleControls = () => {
    setShowControls(!showControls);
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Eden's Hollow</h1>
      
      <div className="relative w-full max-w-3xl rounded-lg overflow-hidden shadow-lg border-4 border-amber-700">
        {/* Game Canvas Container */}
        <div 
          ref={gameContainerRef} 
          className="w-full bg-slate-800 flex items-center justify-center"
          style={{ height: '400px' }}
        >
          {gameState === GameState.LOADING && (
            <div className="text-white text-lg">Loading game assets...</div>
          )}
        </div>
        
        {/* Game Controls */}
        <div className="bg-amber-800 p-3 text-white flex justify-between items-center">
          <div className="flex gap-3">
            <div>Score: {score}</div>
            <div>Lives: {lives}</div>
          </div>
          
          <div className="flex gap-2">
            {gameState === GameState.READY && (
              <button 
                onClick={handleStartGame}
                className="px-3 py-1 bg-green-600 rounded hover:bg-green-500"
              >
                Start Game
              </button>
            )}
            
            {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
              <button 
                onClick={handlePauseResumeGame}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
              >
                {gameState === GameState.PAUSED ? 'Resume' : 'Pause'}
              </button>
            )}
            
            <button 
              onClick={toggleControls}
              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500"
            >
              {showControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Instructions */}
      {showControls && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg shadow-md max-w-3xl w-full">
          <h2 className="text-xl font-bold mb-2">How to Play</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move the character</li>
            <li>Press <strong>Space</strong> or <strong>Up Arrow</strong> to jump</li>
            <li>Collect coins to increase your score</li>
            <li>Find potions to gain extra lives</li>
            <li>Reach the treasure chest at the end of the level</li>
          </ul>
        </div>
      )}
      
      {/* Game State Display */}
      {gameState === GameState.WIN && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg shadow-md max-w-3xl w-full text-center">
          <h2 className="text-2xl font-bold">Victory!</h2>
          <p>You've completed the game with a score of {score}!</p>
        </div>
      )}
      
      {gameState === GameState.GAME_OVER && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg shadow-md max-w-3xl w-full text-center">
          <h2 className="text-2xl font-bold">Game Over</h2>
          <p>Better luck next time! Final score: {score}</p>
        </div>
      )}
      
      <style>{`
        canvas {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
};

export default EdenGame;
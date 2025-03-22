/**
 * GameContainer Component
 * 
 * This component integrates the game into a React application.
 * It creates a container for the game canvas and manages the game lifecycle.
 */

import React, { useEffect, useRef } from 'react';
import { Game } from '../game/Game';

interface GameContainerProps {
  width?: number;
  height?: number;
  className?: string;
}

const GameContainer: React.FC<GameContainerProps> = ({ 
  width = 640, 
  height = 480,
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  
  // Initialize game when component mounts
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log('[GameContainer] Initializing game');
    
    // Create game instance
    const game = new Game(containerRef.current, width, height);
    
    // Start the game
    game.start().catch(error => {
      console.error('[GameContainer] Error starting game:', error);
    });
    
    // Store game instance
    gameRef.current = game;
    
    // Clean up when component unmounts
    return () => {
      console.log('[GameContainer] Destroying game');
      
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [width, height]);
  
  // Handle pause/resume when window visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!gameRef.current) return;
      
      if (document.hidden) {
        console.log('[GameContainer] Window hidden, pausing game');
        gameRef.current.pause();
      } else {
        console.log('[GameContainer] Window visible, resuming game');
        gameRef.current.resume();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return (
    <div 
      className={`game-container relative bg-black ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        margin: '0 auto',
        border: '1px solid #333'
      }}
      ref={containerRef}
    >
      {/* Game will be rendered here by the Game class */}
    </div>
  );
};

export default GameContainer;
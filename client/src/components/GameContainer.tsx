/**
 * GameContainer Component
 * A React component that wraps the Phaser game instance
 */

import React, { useEffect, useRef, useState } from 'react';
import Game from '../game/Game';

// Props for the GameContainer component
interface GameContainerProps {
  // Container ID (must be unique if multiple games on page)
  containerId?: string;
  
  // Game dimensions
  width?: number | string;
  height?: number | string;
  
  // Additional game config options
  pixelArt?: boolean;
  backgroundColor?: string;
  
  // Whether to auto-start the game
  autoStart?: boolean;
  
  // Callback when game is ready
  onGameReady?: (game: Game) => void;
  
  // Custom styles for the container
  style?: React.CSSProperties;
  
  // Custom class name for the container
  className?: string;
}

/**
 * Game Container Component
 * Renders a container for the Phaser game and manages its lifecycle
 */
export default function GameContainer({
  containerId = 'eden-game-container',
  width = '100%',
  height = '600px',
  pixelArt = true,
  backgroundColor = '#000000',
  autoStart = true,
  onGameReady,
  style,
  className,
}: GameContainerProps) {
  // Refs for the container and game instance
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Game | null>(null);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the game on component mount
  useEffect(() => {
    // Skip if no container
    if (!containerRef.current) return;
    
    // Keep track of mounted state to avoid updates after component unmounts
    let isMounted = true;
    
    // Setup function to initialize the game
    const setupGame = async () => {
      try {
        // Verify Phaser is available (it should be since we include it in index.html)
        if (typeof window === 'undefined' || !window.Phaser) {
          throw new Error('Phaser is not available. Please make sure it is loaded in index.html');
        }
        
        console.log('Using pre-loaded Phaser library');
        
        // Create Game instance
        const game = new Game({
          parent: containerId,
          width: typeof width === 'string' ? parseInt(width) || 800 : width,
          height: typeof height === 'string' ? parseInt(height) || 600 : height,
          pixelArt,
          backgroundColor,
        });
        
        // Store the game instance in ref
        gameInstanceRef.current = game;
        
        // Initialize the game
        if (autoStart) {
          await game.initialize();
        }
        
        // Guard against continues if component unmounted during async operations
        if (!isMounted) return;
        
        // Notify parent when game is ready
        if (onGameReady && isMounted) {
          onGameReady(game);
        }
        
        // Update loading state
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing game:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize game');
          setLoading(false);
        }
      }
    };
    
    // Call setup function after a short delay to ensure Phaser is loaded
    const timerId = setTimeout(() => {
      setupGame();
    }, 100);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timerId);
      isMounted = false;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [containerId, width, height, pixelArt, backgroundColor, autoStart, onGameReady]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameInstanceRef.current && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        gameInstanceRef.current.resize(clientWidth, clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Combine base and custom styles
  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };
  
  return (
    <div 
      ref={containerRef}
      id={containerId}
      className={`game-container ${className || ''}`}
      style={containerStyle}
    >
      {loading && (
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>Loading Eden's Hollow...</p>
        </div>
      )}
      
      {error && (
        <div className="game-error">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )}
      
      <style>{`
        .game-container {
          background-color: #000;
          color: #fff;
          font-family: monospace;
        }
        
        .game-loading,
        .game-error {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 10;
        }
        
        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #fff;
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
        
        .game-error button {
          margin-top: 20px;
          padding: 8px 16px;
          background-color: #4a4a4a;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .game-error button:hover {
          background-color: #5a5a5a;
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useRef } from 'react';

interface GameContainerProps {
  width: string | number;
  height: string | number;
  className?: string;
  autoStart?: boolean;
  onGameReady?: (game: any) => void;
}

/**
 * Game Container Component
 * Wrapper for the Phaser game instance
 */
const GameContainer: React.FC<GameContainerProps> = ({
  width,
  height,
  className = '',
  autoStart = true,
  onGameReady
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any | null>(null);
  
  // Initialize and clean up the game
  useEffect(() => {
    if (!gameRef.current || !window.Phaser) return;
    
    try {
      console.log("Initializing Phaser game...");
      
      // Create a basic Phaser config
      const config = {
        type: Phaser.AUTO,
        width: '100%',
        height: '100%',
        parent: gameRef.current,
        backgroundColor: '#1a1a1a',
        pixelArt: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 500 },
            debug: false
          }
        },
        scene: {
          preload: function(this: any) {
            // Preload assets
            this.load.image('ground', '/assets/platform.png');
            this.load.image('star', '/assets/star.png');
            this.load.image('sky', '/assets/sky.png');
            
            // Create loading text
            const loadingText = this.add.text(
              this.cameras.main.width / 2, 
              this.cameras.main.height / 2,
              'Loading game assets...',
              { 
                font: '20px Arial', 
                fill: '#ffffff' 
              }
            ).setOrigin(0.5);
            
            // Update progress text during loading
            this.load.on('progress', function(value: number) {
              loadingText.setText(`Loading game assets... ${Math.floor(value * 100)}%`);
            });
            
            this.load.on('complete', function() {
              loadingText.destroy();
            });
          },
          create: function(this: any) {
            // Set up the game world
            this.add.image(0, 0, 'sky').setOrigin(0, 0).setScale(2);
            
            // Create a platform
            const platforms = this.physics.add.staticGroup();
            platforms.create(400, 568, 'ground').setScale(2).refreshBody();
            
            // Create stars
            const stars = this.physics.add.group({
              key: 'star',
              repeat: 12,
              setXY: { x: 12, y: 0, stepX: 70 }
            });
            
            stars.children.iterate(function(child: any) {
              child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            });
            
            // Add text on screen to indicate placeholder
            this.add.text(
              this.cameras.main.width / 2, 
              50,
              'Eden\'s Hollow Placeholder', 
              { 
                font: '24px Arial', 
                fill: '#ffffff' 
              }
            ).setOrigin(0.5);
            
            // Add text with instructions
            this.add.text(
              this.cameras.main.width / 2, 
              this.cameras.main.height - 50,
              'This is just a placeholder. The actual game is under development.', 
              { 
                font: '16px Arial', 
                fill: '#ffffff',
                align: 'center'
              }
            ).setOrigin(0.5);
            
            // Notify parent that game is ready
            if (onGameReady) {
              onGameReady(this.game);
            }
          }
        }
      };
      
      // Create the Phaser game instance
      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;
      
      // Auto-start the game if needed
      if (autoStart && game.scene) {
        game.scene.start('default');
      }
    } catch (error) {
      console.error("Error initializing Phaser game:", error);
    }
    
    // Cleanup function
    return () => {
      console.log("Destroying Phaser game instance...");
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [onGameReady, autoStart]);
  
  return (
    <div 
      ref={gameRef} 
      className={`game-canvas-container ${className}`} 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height 
      }}
    />
  );
};

export default GameContainer;
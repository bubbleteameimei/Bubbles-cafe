/**
 * GameScene.ts
 * 
 * The main game scene for Eden's Hollow.
 * Handles the gameplay logic, rendering, and player interactions.
 */

import { PixelArtAssetLoader } from '../utils/assetLoader';

// Types for game entities
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface GameObject {
  position: Position;
  size: Size;
  velocity?: Velocity;
  render(ctx: CanvasRenderingContext2D): void;
  update(delta: number): void;
}

interface Player extends GameObject {
  speed: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
}

// Input state management
interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  inventory: boolean;
}

export class GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameWidth: number;
  private gameHeight: number;
  private player: Player;
  private input: InputState;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gameWidth = canvas.width;
    this.gameHeight = canvas.height;
    
    // Initialize canvas context
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;
    
    // Enable pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Initialize input state
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      interact: false,
      inventory: false
    };
    
    // Create player
    this.player = this.createPlayer();
    
    // Set up input handlers
    this.setupInputHandlers();
  }
  
  private createPlayer(): Player {
    // Create player object with initial position and properties
    return {
      position: {
        x: this.gameWidth / 2 - 16, // Center player horizontally
        y: this.gameHeight / 2 - 24  // Center player vertically
      },
      size: {
        width: 32,
        height: 48
      },
      velocity: {
        x: 0,
        y: 0
      },
      speed: 100, // Pixels per second
      direction: 'down',
      isMoving: false,
      
      render(ctx: CanvasRenderingContext2D): void {
        // Get appropriate sprite based on direction and movement
        // For now, draw a placeholder rectangle
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
      },
      
      update(delta: number): void {
        // Update position based on velocity
        if (this.velocity) {
          this.position.x += this.velocity.x * delta;
          this.position.y += this.velocity.y * delta;
        }
        
        // Keep player within game bounds
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.y < 0) this.position.y = 0;
        if (this.position.x > 640 - this.size.width) {
          this.position.x = 640 - this.size.width;
        }
        if (this.position.y > 480 - this.size.height) {
          this.position.y = 480 - this.size.height;
        }
      }
    };
  }
  
  private setupInputHandlers(): void {
    // Keyboard down event handler
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.input.up = true;
          break;
        case 'ArrowDown':
          this.input.down = true;
          break;
        case 'ArrowLeft':
          this.input.left = true;
          break;
        case 'ArrowRight':
          this.input.right = true;
          break;
        case ' ':
          this.input.interact = true;
          break;
        case 'e':
        case 'E':
          this.input.inventory = true;
          break;
      }
    });
    
    // Keyboard up event handler
    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowUp':
          this.input.up = false;
          break;
        case 'ArrowDown':
          this.input.down = false;
          break;
        case 'ArrowLeft':
          this.input.left = false;
          break;
        case 'ArrowRight':
          this.input.right = false;
          break;
        case ' ':
          this.input.interact = false;
          break;
        case 'e':
        case 'E':
          this.input.inventory = false;
          break;
      }
    });
  }
  
  public start(): void {
    console.log('[GameScene] Starting game loop');
    this.lastTime = performance.now();
    
    // Start the game loop
    this.gameLoop(this.lastTime);
    
    // Play background music
    try {
      PixelArtAssetLoader.playAudio('bgm_village', true, 0.5);
    } catch (error) {
      console.warn('[GameScene] Could not play background music:', error);
    }
  }
  
  private gameLoop = (timestamp: number): void => {
    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    
    // Update game state
    this.update(deltaTime);
    
    // Render game state
    this.render();
    
    // Continue game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(delta: number): void {
    // Update player velocity based on input
    this.player.velocity = { x: 0, y: 0 };
    
    if (this.input.up) {
      this.player.velocity.y = -this.player.speed;
      this.player.direction = 'up';
      this.player.isMoving = true;
    } else if (this.input.down) {
      this.player.velocity.y = this.player.speed;
      this.player.direction = 'down';
      this.player.isMoving = true;
    }
    
    if (this.input.left) {
      this.player.velocity.x = -this.player.speed;
      this.player.direction = 'left';
      this.player.isMoving = true;
    } else if (this.input.right) {
      this.player.velocity.x = this.player.speed;
      this.player.direction = 'right';
      this.player.isMoving = true;
    }
    
    // Normalize diagonal movement
    if (this.player.velocity.x !== 0 && this.player.velocity.y !== 0) {
      const normalizer = Math.sqrt(2) / 2; // 1/sqrt(2)
      this.player.velocity.x *= normalizer;
      this.player.velocity.y *= normalizer;
    }
    
    // Check if player is not moving
    if (this.player.velocity.x === 0 && this.player.velocity.y === 0) {
      this.player.isMoving = false;
    }
    
    // Update player state
    this.player.update(delta);
    
    // Implement game logic here
    // - Collision detection
    // - Enemy AI
    // - Item interactions
    // - etc.
  }
  
  private render(): void {
    // Draw background
    this.drawBackground();
    
    // Draw player
    this.player.render(this.ctx);
    
    // Draw UI elements
    this.drawUI();
  }
  
  private drawBackground(): void {
    // Draw background (placeholder)
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
    
    // Draw tilemap (placeholder)
    // In the future, this will render the actual tilemap loaded from assets
    this.ctx.fillStyle = '#8FBC8F'; // Dark Sea Green (grass)
    this.ctx.fillRect(0, this.gameHeight - 100, this.gameWidth, 100);
  }
  
  private drawUI(): void {
    // Draw UI elements (placeholder)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(10, 10, 150, 30);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '14px monospace';
    this.ctx.fillText("Eden's Hollow", 20, 30);
  }
  
  public stop(): void {
    // Stop the game loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop any audio
    // This would need to be implemented in the asset loader
  }
  
  public resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Maintain pixel perfect rendering after resize
    this.ctx.imageSmoothingEnabled = false;
  }
  
  public destroy(): void {
    // Clean up resources
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  
  // Event handler bound methods (for proper cleanup)
  private handleKeyDown = (event: KeyboardEvent): void => {
    // Same logic as in setupInputHandlers keydown
  };
  
  private handleKeyUp = (event: KeyboardEvent): void => {
    // Same logic as in setupInputHandlers keyup
  };
}
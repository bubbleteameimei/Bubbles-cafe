/**
 * Eden's Hollow Game
 * Main game initialization class
 */

// Import game scenes
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

// Ensure we have a type declaration for the global Phaser object
declare global {
  interface Window {
    Phaser: any;
  }
}

// Game configuration
export interface GameConfig {
  parent: string;
  width: number;
  height: number;
  pixelArt?: boolean;
  roundPixels?: boolean;
  backgroundColor?: string;
  disableContextMenu?: boolean;
  antialias?: boolean;
}

// Default game configuration
const DEFAULT_CONFIG: GameConfig = {
  parent: 'game-container',
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#000000',
  disableContextMenu: true,
  antialias: false,
};

/**
 * Eden's Hollow Game class
 * Handles game creation and initialization
 */
export default class Game {
  private config: GameConfig;
  private game: any | null; // Using any instead of Phaser.Game to avoid TypeScript errors

  constructor(config: Partial<GameConfig> = {}) {
    // Merge provided config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Initialize game property
    this.game = null;
  }

  /**
   * Initialize the game
   * @returns A promise that resolves when the game is fully initialized
   */
  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if Phaser is available
        if (typeof window === 'undefined' || !window.Phaser) {
          throw new Error('Phaser is not loaded. Game engine is required for Eden\'s Hollow.');
        }

        console.log('Creating game with Phaser version:', window.Phaser.VERSION);

        // Full game configuration with physics, etc.
        const gameConfig = {
          type: window.Phaser.AUTO,
          parent: this.config.parent,
          width: this.config.width,
          height: this.config.height,
          pixelArt: this.config.pixelArt,
          roundPixels: this.config.roundPixels,
          backgroundColor: this.config.backgroundColor,
          disableContextMenu: this.config.disableContextMenu,
          antialias: this.config.antialias,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0 }, // No gravity for top-down game
              debug: false, // Set to true for physics debugging
            },
          },
          scene: [BootScene, GameScene],
        };

        // Create the game instance with window.Phaser reference
        try {
          this.game = new window.Phaser.Game(gameConfig);
          console.log('Game instance created successfully');
        } catch (gameError) {
          console.error('Error creating Phaser.Game instance:', gameError);
          throw new Error('Failed to create game instance: ' + String(gameError));
        }

        // Resolve when the game is ready
        if (this.game && this.game.events) {
          this.game.events.once('ready', () => {
            console.log('Eden\'s Hollow game initialized successfully (ready event)');
            resolve();
          });

          // Also listen for boot event as backup
          this.game.events.once('boot', () => {
            console.log('Eden\'s Hollow game boot event fired');
          });
        } else {
          console.warn('Game events not available, using timeout fallback only');
        }

        // Resolve after a timeout in case events don't fire
        setTimeout(() => {
          if (this.game && !this.game.destroyed) {
            console.log('Eden\'s Hollow game initialized (timeout fallback)');
            resolve();
          } else if (!this.game) {
            reject(new Error('Game failed to initialize (timeout reached and no game instance)'));
          }
        }, 3000); // Longer timeout for safety

      } catch (error) {
        console.error('Error initializing game:', error);
        reject(error);
      }
    });
  }

  /**
   * Destroy the game instance (useful for cleanup)
   */
  destroy(): void {
    if (this.game) {
      try {
        this.game.destroy(true);
        console.log('Game destroyed successfully');
      } catch (error) {
        console.error('Error destroying game:', error);
      }
      this.game = null;
    }
  }

  /**
   * Resize the game canvas
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number): void {
    if (this.game && this.game.scale) {
      try {
        this.game.scale.resize(width, height);
      } catch (error) {
        console.error('Error resizing game:', error);
      }
    }
  }

  /**
   * Get the current game scene by key
   * @param key Scene key
   * @returns The scene instance or undefined if not found
   */
  getScene(key: string): any | undefined {
    if (this.game && this.game.scene) {
      try {
        return this.game.scene.getScene(key);
      } catch (error) {
        console.error('Error getting scene:', error);
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Start a scene
   * @param key Scene key
   * @param data Optional data to pass to the scene
   */
  startScene(key: string, data?: any): void {
    if (this.game && this.game.scene) {
      try {
        this.game.scene.start(key, data);
      } catch (error) {
        console.error('Error starting scene:', error);
      }
    }
  }

  /**
   * Check if the game instance exists and is running
   */
  isRunning(): boolean {
    return !!this.game && !this.game.destroyed;
  }
}
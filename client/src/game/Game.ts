/**
 * Eden's Hollow Game
 * Main game initialization class
 */

// Import game scenes
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

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
  private game: Phaser.Game | null;

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
        if (typeof Phaser === 'undefined') {
          throw new Error('Phaser is not loaded. Make sure to include it in your project.');
        }

        // Full game configuration with physics, etc.
        const gameConfig = {
          type: Phaser.AUTO,
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

        // Create the game instance
        this.game = new Phaser.Game(gameConfig);

        // Resolve when the game is ready
        this.game.events.once('ready', () => {
          console.log('Eden\'s Hollow game initialized successfully');
          resolve();
        });

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
      this.game.destroy(true);
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
      this.game.scale.resize(width, height);
    }
  }

  /**
   * Get the current game scene by key
   * @param key Scene key
   * @returns The scene instance or undefined if not found
   */
  getScene(key: string): Phaser.Scene | undefined {
    if (this.game && this.game.scene) {
      return this.game.scene.getScene(key);
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
      this.game.scene.start(key, data);
    }
  }

  /**
   * Check if the game instance exists and is running
   */
  isRunning(): boolean {
    return !!this.game && !this.game.destroyed;
  }
}
/**
 * Boot Scene for Eden's Hollow
 * Handles initial asset loading and setup for the game
 */

import AssetLoader, { defaultAssets } from '../utils/assetLoader';
import PixelArtGenerator, { SpriteSheetConfig } from '../utils/pixelArtGenerator';

export default class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private pixelArtGenerator!: PixelArtGenerator;
  
  constructor() {
    super('BootScene');
  }
  
  preload(): void {
    this.createLoadingUI();
    
    // Initialize asset loader
    const assetLoader = new AssetLoader(this);
    
    // Load all default assets
    assetLoader.loadAssets(defaultAssets, (progress) => {
      // Update progress bar
      this.updateLoadingProgress(progress);
    });
    
    // Listen for load completion
    this.load.on('complete', () => {
      this.processAssets();
    });
  }
  
  create(): void {
    // Transition to the main game scene
    this.scene.start('GameScene');
  }
  
  /**
   * Create loading UI elements
   */
  private createLoadingUI(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create progress container
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);
    
    // Create loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '24px monospace',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5, 0.5);
    
    // Create progress bar
    this.progressBar = this.add.graphics();
  }
  
  /**
   * Update loading progress UI
   */
  private updateLoadingProgress(value: number): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Clear previous progress
    this.progressBar.clear();
    
    // Draw new progress
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(
      width / 4 + 10, 
      height / 2 - 20, 
      (width / 2 - 20) * value, 
      30
    );
    
    // Update loading percentage text
    const percent = Math.floor(value * 100);
    this.loadingText.setText(`Loading... ${percent}%`);
  }
  
  /**
   * Process loaded assets (applying pixel art filters, etc.)
   */
  private processAssets(): void {
    console.log('Starting asset processing...');
    
    // Create pixel art generator with debug mode enabled
    this.pixelArtGenerator = new PixelArtGenerator(this, true);
    
    // Process item assets
    this.processItemAssets();
    
    // Process player spritesheet
    this.processPlayerSprite();
    
    // Process environment assets
    this.processEnvironmentAssets();
    
    // Create special effects textures
    this.createSpecialEffects();
    
    console.log('Assets processed successfully');
  }
  
  /**
   * Process item assets (coins, potions, chests)
   */
  private processItemAssets(): void {
    try {
      // Process each item asset
      const itemKeys = ['coin', 'potion', 'chest'];
      
      itemKeys.forEach(key => {
        if (this.textures.exists(key)) {
          // Create a pixelated version if the original exists
          const pixelKey = `${key}_pixel`;
          this.pixelArtGenerator.pixelateTexture(key, pixelKey);
          
          // Get dimensions for logging
          const texture = this.textures.get(key);
          console.log(`${key} dimensions:`, texture.source[0].width, texture.source[0].height);
          
          // For chests, we need to handle the open/closed states
          if (key === 'chest') {
            // For now we'll use the same texture for both states
            // In a full implementation, we would have separate frames
            this.anims.create({
              key: 'chest_open',
              frames: [
                { key: pixelKey, frame: 0 }
              ],
              frameRate: 5,
              repeat: 0
            });
          }
          
          // Add bobbing animation for coins
          if (key === 'coin') {
            // We don't have actual frames for coin rotation,
            // so we'll use the game loop to handle the visual effect
            console.log(`Created coin visual effect`);
          }
        } else {
          console.warn(`Texture '${key}' not found`);
        }
      });
      
      console.log('Item assets processed successfully');
    } catch (error) {
      console.error('Error processing item assets:', error);
    }
  }
  
  /**
   * Process player spritesheet
   */
  private processPlayerSprite(): void {
    try {
      console.log('Processing player sprite');
      const playerKey = 'player';
      
      // Check if player texture exists
      if (!this.textures.exists(playerKey)) {
        console.error(`Player texture '${playerKey}' not found`);
        return;
      }
      
      // Get player texture dimensions
      const texture = this.textures.get(playerKey);
      const width = texture.source[0].width;
      const height = texture.source[0].height;
      console.log(`Player texture dimensions: ${width}x${height}`);
      
      // Create pixelated version
      const playerPixelKey = 'player_pixel';
      this.pixelArtGenerator.pixelateTexture(playerKey, playerPixelKey);
      
      // Define player spritesheet configuration
      const playerSpriteConfig: SpriteSheetConfig = {
        frameWidth: 24,
        frameHeight: 32,
        margin: 0,
        spacing: 0,
        // 4 rows (directions) with 4 frames each
        rows: 4,
        columns: 4,
        // Define animations for each direction
        animations: {
          'player_down': {
            frames: [0, 1, 2, 3],
            frameRate: 10,
            repeat: -1
          },
          'player_left': {
            frames: [4, 5, 6, 7],
            frameRate: 10,
            repeat: -1
          },
          'player_right': {
            frames: [8, 9, 10, 11],
            frameRate: 10,
            repeat: -1
          },
          'player_up': {
            frames: [12, 13, 14, 15],
            frameRate: 10,
            repeat: -1
          },
          // Idle animations (just the first frame of each direction)
          'player_idle_down': {
            frames: [0],
            frameRate: 1,
            repeat: 0
          },
          'player_idle_left': {
            frames: [4],
            frameRate: 1,
            repeat: 0
          },
          'player_idle_right': {
            frames: [8],
            frameRate: 1,
            repeat: 0
          },
          'player_idle_up': {
            frames: [12],
            frameRate: 1,
            repeat: 0
          }
        }
      };
      
      // Process the player spritesheet
      this.pixelArtGenerator.processSpriteSheet(playerPixelKey, playerSpriteConfig);
      
      console.log('Player sprite processed successfully');
    } catch (error) {
      console.error('Error processing player sprite:', error);
      this.createFallbackPlayerAnimations();
    }
  }
  
  /**
   * Create fallback player animations as a last resort
   */
  private createFallbackPlayerAnimations(): void {
    try {
      console.log('Creating fallback player animations');
      const playerKey = 'player';
      const frameRate = 10;
      
      // Simplified animation creation function
      const createAnim = (key: string, start: number, end: number, repeat = -1) => {
        try {
          // Create frames array
          const frames = [];
          for (let i = start; i <= end; i++) {
            frames.push({ key: playerKey, frame: i });
          }
          
          // Create the animation
          this.anims.create({
            key,
            frames,
            frameRate,
            repeat
          });
        } catch (err) {
          console.error(`Failed to create animation ${key}:`, err);
          
          // Ultra fallback to single frame
          this.anims.create({
            key,
            frames: [{ key: playerKey, frame: 0 }],
            frameRate: 1,
            repeat: 0
          });
        }
      };
      
      // Create all animations
      createAnim('player_down', 0, 3);
      createAnim('player_left', 4, 7);
      createAnim('player_right', 8, 11);
      createAnim('player_up', 12, 15);
      
      // Create idle animations
      createAnim('player_idle_down', 0, 0, 0);
      createAnim('player_idle_left', 4, 4, 0);
      createAnim('player_idle_right', 8, 8, 0);
      createAnim('player_idle_up', 12, 12, 0);
      
      console.log('Fallback player animations created');
    } catch (error) {
      console.error('Failed to create fallback player animations:', error);
    }
  }
  
  /**
   * Process environment assets (tileset, map, etc.)
   */
  private processEnvironmentAssets(): void {
    try {
      // The tileset is already in a pixel art style,
      // so we don't need to process it further
      console.log('Environment assets processed');
    } catch (error) {
      console.error('Error processing environment assets:', error);
    }
  }
  
  /**
   * Create special effects textures for use in the game
   */
  private createSpecialEffects(): void {
    try {
      // Create a simple particle texture
      this.pixelArtGenerator.generateRandomPattern(
        8, 8, 
        [0xffffff, 0xffff00, 0xff8800], 
        'particle_glow',
        2
      );
      
      // Create a shadow texture using arc rather than ellipse for compatibility
      const shadowGraphics = this.add.graphics();
      shadowGraphics.fillStyle(0x000000, 1);
      // Draw an oval shadow using arcs instead of fillEllipse
      shadowGraphics.beginPath();
      shadowGraphics.arc(8, 4, 8, 0, Math.PI * 2);
      shadowGraphics.closePath();
      shadowGraphics.fill();
      shadowGraphics.generateTexture('shadow', 16, 8);
      shadowGraphics.destroy();
      
      console.log('Special effects textures created');
    } catch (error) {
      console.error('Error creating special effects:', error);
    }
  }
  
  /**
   * Create a pixelated version of a texture (fallback method)
   */
  private createPixelVersion(key: string): void {
    try {
      // Use the original texture directly since our SVGs are already pixel art style
      console.log(`Using ${key} directly as pixel art`);
      
      // Add the texture with a _pixel suffix if it doesn't exist
      const pixelKey = `${key}_pixel`;
      if (!this.textures.exists(pixelKey) && this.textures.exists(key)) {
        // Create a new render texture to clone the original
        const texture = this.textures.get(key);
        const { width, height } = texture.source[0];
        
        const renderTexture = this.add.renderTexture(0, 0, width, height);
        renderTexture.draw(key, 0, 0);
        renderTexture.saveTexture(pixelKey);
        
        console.log(`Created ${pixelKey} from ${key}`);
      }
    } catch (error) {
      console.error(`Error creating pixel version for ${key}:`, error);
    }
  }
}
/**
 * Boot Scene for Eden's Hollow
 * Handles initial asset loading and setup for the game
 */

import AssetLoader, { defaultAssets } from '../utils/assetLoader';
import PixelArtGenerator from '../utils/pixelArtGenerator';

export default class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  
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
    // Create pixel art generator
    const pixelArtGenerator = new PixelArtGenerator(this);
    
    // Apply pixel art style to the loaded assets
    // Items
    pixelArtGenerator.pixelateTexture('coin', 'coin_pixel', { 
      pixelSize: 2,
      edgeDetection: true
    });
    
    pixelArtGenerator.pixelateTexture('potion', 'potion_pixel', { 
      pixelSize: 2,
      edgeDetection: true
    });
    
    pixelArtGenerator.pixelateTexture('chest', 'chest_pixel', { 
      pixelSize: 2,
      edgeDetection: true
    });
    
    // Process player spritesheet
    pixelArtGenerator.pixelateTexture('player', 'player_pixel', { 
      pixelSize: 2,
      edgeDetection: true
    });
    
    // Create player animations
    this.createPlayerAnimations();
    
    console.log('Assets processed successfully');
  }
  
  /**
   * Create animations for the player character
   */
  private createPlayerAnimations(): void {
    // Player animations
    const frameRate = 10;
    
    // Down animation
    this.anims.create({
      key: 'player_down',
      frames: this.anims.generateFrameNumbers('player_pixel', { start: 0, end: 0 }),
      frameRate,
      repeat: -1
    });
    
    // Right animation
    this.anims.create({
      key: 'player_right',
      frames: this.anims.generateFrameNumbers('player_pixel', { start: 1, end: 1 }),
      frameRate,
      repeat: -1
    });
    
    // Up animation
    this.anims.create({
      key: 'player_up',
      frames: this.anims.generateFrameNumbers('player_pixel', { start: 2, end: 2 }),
      frameRate,
      repeat: -1
    });
    
    // Left animation
    this.anims.create({
      key: 'player_left',
      frames: this.anims.generateFrameNumbers('player_pixel', { start: 3, end: 3 }),
      frameRate,
      repeat: -1
    });
  }
}
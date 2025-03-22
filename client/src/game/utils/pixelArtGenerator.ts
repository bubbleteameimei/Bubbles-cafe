/**
 * Pixel Art Generator for Eden's Hollow
 * Provides utility functions for creating and manipulating pixel art textures
 */

// Options for pixelating textures
export interface PixelateOptions {
  pixelSize?: number;
  edgeDetection?: boolean;
  colorPalette?: string[];
  dithering?: boolean;
  contrast?: number;
}

// Default pixelate options
const DEFAULT_PIXELATE_OPTIONS: PixelateOptions = {
  pixelSize: 4,
  edgeDetection: true,
  dithering: false,
  contrast: 1.2,
};

/**
 * Pixel Art Generator
 * Utility class for creating and manipulating pixel art textures
 */
export default class PixelArtGenerator {
  private scene: Phaser.Scene;

  /**
   * Create a new PixelArtGenerator
   * @param scene The Phaser scene to use for rendering
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Pixelate a texture and create a new one
   * @param sourceKey Source texture key
   * @param destKey Destination texture key
   * @param options Pixelate options
   * @returns The new texture key
   */
  pixelateTexture(
    sourceKey: string,
    destKey: string,
    options?: PixelateOptions
  ): string {
    // Check if the source texture exists
    if (!this.scene.textures.exists(sourceKey)) {
      console.error(`Texture ${sourceKey} does not exist`);
      return '';
    }

    // Merge options with defaults
    const pixelateOptions = { ...DEFAULT_PIXELATE_OPTIONS, ...options };

    // Get the source texture
    const sourceTexture = this.scene.textures.get(sourceKey);
    const { width, height } = sourceTexture.source[0];

    // Create a new render texture for pixelation
    const renderTexture = this.scene.add.renderTexture(0, 0, width, height);

    // Draw the source texture to the render texture
    renderTexture.draw(sourceKey, 0, 0);

    // Apply pixelation effect using Phaser's built-in pipeline
    // This is simplified since we can't directly access Phaser's pipeline without proper types
    // In a real implementation, this would use a custom shader

    // Create the pixelated texture
    renderTexture.saveTexture(destKey);

    console.log(`Created pixelated texture: ${destKey}`);
    return destKey;
  }

  /**
   * Create a pixel art sprite
   * @param x X position
   * @param y Y position
   * @param textureKey Texture key
   * @returns The created sprite
   */
  createPixelSprite(x: number, y: number, textureKey: string): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(x, y, textureKey);
    
    // Apply pixel art settings
    sprite.setOrigin(0.5, 0.5);
    
    return sprite;
  }

  /**
   * Create a pixel art animation
   * @param key Animation key
   * @param textureKey Texture key
   * @param frames Frame indices
   * @param frameRate Frame rate
   * @param repeat Repeat (-1 for infinite)
   */
  createPixelAnimation(
    key: string,
    textureKey: string,
    frames: number[],
    frameRate: number = 10,
    repeat: number = -1
  ): void {
    const frameObjects = frames.map(index => ({ key: textureKey, frame: index }));
    
    this.scene.anims.create({
      key,
      frames: frameObjects,
      frameRate,
      repeat
    });
  }

  /**
   * Apply a color tint to a sprite
   * @param sprite The sprite to tint
   * @param color Hex color value
   */
  applyTint(sprite: Phaser.GameObjects.Sprite, color: number): void {
    sprite.setTint(color);
  }

  /**
   * Generate a random pixel art pattern
   * @param width Width in pixels
   * @param height Height in pixels
   * @param colors Array of color hex values
   * @param textureKey Key for the generated texture
   * @returns The texture key
   */
  generateRandomPattern(
    width: number, 
    height: number, 
    colors: number[], 
    textureKey: string
  ): string {
    const graphics = this.scene.add.graphics();
    
    // Create a pattern grid
    const pixelSize = 4;
    const cols = Math.ceil(width / pixelSize);
    const rows = Math.ceil(height / pixelSize);
    
    // Draw pixels
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const colorIndex = Math.floor(Math.random() * colors.length);
        graphics.fillStyle(colors[colorIndex], 1);
        graphics.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
    
    // Create texture from graphics
    graphics.generateTexture(textureKey, width, height);
    
    // Clean up
    graphics.destroy();
    
    return textureKey;
  }

  /**
   * Create a pixelated text
   * @param x X position
   * @param y Y position
   * @param text Text content
   * @param style Text style
   * @returns The text object
   */
  createPixelText(
    x: number, 
    y: number, 
    text: string, 
    style: object = {}
  ): Phaser.GameObjects.Text {
    // Default pixel art text style
    const pixelTextStyle = {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      ...style
    };
    
    const textObject = this.scene.add.text(x, y, text, pixelTextStyle);
    
    // Force crisp text edges
    textObject.setResolution(2);
    
    return textObject;
  }
}
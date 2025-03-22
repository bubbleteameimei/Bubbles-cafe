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

// Configuration for sprite sheets
export interface SpriteSheetConfig {
  frameWidth: number;
  frameHeight: number;
  startFrame?: number;
  endFrame?: number;
  margin?: number;
  spacing?: number;
  rows?: number;
  columns?: number;
  direction?: 'horizontal' | 'vertical';
  animations?: {
    [key: string]: {
      frames: number[] | [number, number]; // Either specific frames or [start, end] range
      frameRate?: number;
      repeat?: number;
      yoyo?: boolean;
    };
  };
}

// Default pixelate options
const DEFAULT_PIXELATE_OPTIONS: PixelateOptions = {
  pixelSize: 4,
  edgeDetection: true,
  dithering: false,
  contrast: 1.2,
};

// RGBA color type for operations
type RGBAColor = [number, number, number, number];

/**
 * Pixel Art Generator
 * Utility class for creating and manipulating pixel art textures
 */
export default class PixelArtGenerator {
  private scene: Phaser.Scene;
  private debugMode: boolean;

  /**
   * Create a new PixelArtGenerator
   * @param scene The Phaser scene to use for rendering
   * @param debug Whether to enable debug logging and visualization
   */
  constructor(scene: Phaser.Scene, debug: boolean = false) {
    this.scene = scene;
    this.debugMode = debug;
    
    if (this.debugMode) {
      console.log('PixelArtGenerator initialized in debug mode');
    }
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
    try {
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

      // Apply pixelation effect
      // In a real implementation with proper shader support, we'd apply a pixel shader here
      // For now, we'll use a simplified approach that works within our type constraints

      // Create the pixelated texture
      renderTexture.saveTexture(destKey);

      if (this.debugMode) {
        console.log(`Created pixelated texture: ${destKey} (${width}x${height})`);
      }
      
      return destKey;
    } catch (error) {
      console.error('Error in pixelateTexture:', error);
      return '';
    }
  }

  /**
   * Process a sprite sheet to create animations
   * @param key The texture key of the sprite sheet
   * @param config Configuration for the sprite sheet
   */
  processSpriteSheet(key: string, config: SpriteSheetConfig): void {
    try {
      if (!this.scene.textures.exists(key)) {
        console.error(`Texture ${key} does not exist`);
        return;
      }

      const texture = this.scene.textures.get(key);
      const source = texture.source[0];
      
      if (this.debugMode) {
        console.log(`Processing sprite sheet: ${key} (${source.width}x${source.height})`);
        console.log(`Frame dimensions: ${config.frameWidth}x${config.frameHeight}`);
      }

      // Calculate total frames
      const columns = config.columns || Math.floor(source.width / config.frameWidth);
      const rows = config.rows || Math.floor(source.height / config.frameHeight);
      const totalFrames = rows * columns;
      
      if (this.debugMode) {
        console.log(`Grid: ${columns}x${rows} (${totalFrames} frames)`);
      }

      // Create animations if specified
      if (config.animations) {
        Object.entries(config.animations).forEach(([animKey, animConfig]) => {
          let frames: number[];
          
          // Handle frame ranges [start, end] or specific frame arrays
          if (Array.isArray(animConfig.frames) && animConfig.frames.length === 2 && 
              typeof animConfig.frames[0] === 'number' && typeof animConfig.frames[1] === 'number') {
            // It's a range [start, end]
            const [start, end] = animConfig.frames as [number, number];
            frames = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          } else {
            // It's a specific frame array
            frames = animConfig.frames as number[];
          }
          
          // Create the animation
          this.createPixelAnimation(
            animKey,
            key,
            frames,
            animConfig.frameRate || 10,
            animConfig.repeat ?? -1,
            animConfig.yoyo || false
          );
          
          if (this.debugMode) {
            console.log(`Created animation: ${animKey} with ${frames.length} frames`);
          }
        });
      }
    } catch (error) {
      console.error('Error processing sprite sheet:', error);
    }
  }

  /**
   * Create a pixel art sprite
   * @param x X position
   * @param y Y position
   * @param textureKey Texture key
   * @param frame Optional frame index
   * @returns The created sprite
   */
  createPixelSprite(
    x: number, 
    y: number, 
    textureKey: string, 
    frame?: number | string
  ): Phaser.GameObjects.Sprite {
    try {
      // Create the sprite
      const sprite = this.scene.add.sprite(x, y, textureKey, frame);
      
      // Apply pixel art settings
      sprite.setOrigin(0.5, 0.5);
      
      // Optimize for pixel art
      (sprite as any).texture.setFilter(0); // Use nearest-neighbor filtering
      
      if (this.debugMode) {
        console.log(`Created pixel sprite: ${textureKey}${frame !== undefined ? ` (frame ${frame})` : ''}`);
      }
      
      return sprite;
    } catch (error) {
      console.error('Error creating pixel sprite:', error);
      // Create a fallback sprite if there's an error
      return this.scene.add.sprite(x, y, '__DEFAULT');
    }
  }

  /**
   * Create a pixel art animation
   * @param key Animation key
   * @param textureKey Texture key
   * @param frames Frame indices
   * @param frameRate Frame rate
   * @param repeat Repeat (-1 for infinite)
   * @param yoyo Whether the animation should play backward after playing forward
   */
  createPixelAnimation(
    key: string,
    textureKey: string,
    frames: number[],
    frameRate: number = 10,
    repeat: number = -1,
    yoyo: boolean = false
  ): void {
    try {
      // Check if animation already exists
      const existingAnim = this.scene.anims.get(key);
      if (existingAnim) {
        if (this.debugMode) {
          console.log(`Animation ${key} already exists, skipping creation`);
        }
        return;
      }
      
      // Create frame objects
      const frameObjects = frames.map(index => ({ key: textureKey, frame: index }));
      
      // Create the animation
      this.scene.anims.create({
        key,
        frames: frameObjects,
        frameRate,
        repeat,
        yoyo
      });
      
      if (this.debugMode) {
        console.log(`Created animation: ${key} with ${frames.length} frames at ${frameRate}fps (repeat: ${repeat}, yoyo: ${yoyo})`);
      }
    } catch (error) {
      console.error(`Error creating animation ${key}:`, error);
    }
  }

  /**
   * Apply a color tint to a sprite
   * @param sprite The sprite to tint
   * @param color Hex color value
   */
  applyTint(sprite: Phaser.GameObjects.Sprite, color: number): void {
    try {
      sprite.setTint(color);
      
      if (this.debugMode) {
        console.log(`Applied tint ${color.toString(16)} to sprite`);
      }
    } catch (error) {
      console.error('Error applying tint:', error);
    }
  }

  /**
   * Generate a random pixel art pattern
   * @param width Width in pixels
   * @param height Height in pixels
   * @param colors Array of color hex values
   * @param textureKey Key for the generated texture
   * @param pixelSize Size of each pixel in the pattern (default: 4)
   * @returns The texture key
   */
  generateRandomPattern(
    width: number, 
    height: number, 
    colors: number[], 
    textureKey: string,
    pixelSize: number = 4
  ): string {
    try {
      // Create graphics object for drawing
      const graphics = this.scene.add.graphics();
      
      // Create a pattern grid
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
      
      if (this.debugMode) {
        console.log(`Generated random pattern texture: ${textureKey} (${width}x${height}, ${colors.length} colors, ${pixelSize}px grid)`);
      }
      
      return textureKey;
    } catch (error) {
      console.error('Error generating pattern:', error);
      return '';
    }
  }

  /**
   * Create a pixel art tilemap pattern
   * @param width Width in tiles
   * @param height Height in tiles
   * @param tileSize Size of each tile
   * @param tiles Array of tile indices to use
   * @param rules Optional rules for tile placement
   * @param textureKey Key for the generated texture
   * @returns The texture key
   */
  generateTilemapPattern(
    width: number,
    height: number,
    tileSize: number,
    tiles: number[],
    textureKey: string
  ): string {
    try {
      // Create graphics object for drawing
      const graphics = this.scene.add.graphics();
      
      // Generate a simple random tile pattern
      // In a full implementation, this would use more advanced pattern generation
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tileIndex = Math.floor(Math.random() * tiles.length);
          const tile = tiles[tileIndex];
          
          // Draw a colored rectangle to represent the tile
          // In a real implementation, this would draw actual tile textures
          graphics.fillStyle(0x000000 + (tile * 1000), 1);
          graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          graphics.lineStyle(1, 0xcccccc, 0.5);
          graphics.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
      
      // Create texture from graphics
      graphics.generateTexture(textureKey, width * tileSize, height * tileSize);
      
      // Clean up
      graphics.destroy();
      
      if (this.debugMode) {
        console.log(`Generated tilemap pattern: ${textureKey} (${width}x${height} tiles, ${tileSize}px tile size)`);
      }
      
      return textureKey;
    } catch (error) {
      console.error('Error generating tilemap pattern:', error);
      return '';
    }
  }

  /**
   * Create a pixel art particle effect
   * @param emitter The particle emitter to configure
   * @param texture Texture key to use for particles
   * @param config Configuration for the particle effect
   */
  createPixelParticles(
    emitter: Phaser.GameObjects.Particles.ParticleEmitter,
    texture: string,
    config: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {}
  ): void {
    try {
      // Default config optimized for pixel art
      const pixelConfig: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {
        frame: 0,
        lifespan: 1000,
        speed: { min: 50, max: 100 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        rotate: { min: 0, max: 360 },
        // Override with user config
        ...config
      };
      
      // Configure the emitter
      emitter.setTexture(texture);
      emitter.setConfig(pixelConfig);
      
      if (this.debugMode) {
        console.log(`Configured pixel particle emitter with texture: ${texture}`);
      }
    } catch (error) {
      console.error('Error creating pixel particles:', error);
    }
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
    style: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    try {
      // Default pixel art text style
      const pixelTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        resolution: 2, // Sharper text
        ...style
      };
      
      // Create text object
      const textObject = this.scene.add.text(x, y, text, pixelTextStyle);
      
      // Set origin for better positioning
      textObject.setOrigin(0.5, 0.5);
      
      if (this.debugMode) {
        console.log(`Created pixel text: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
      }
      
      return textObject;
    } catch (error) {
      console.error('Error creating pixel text:', error);
      // Create a fallback text object
      return this.scene.add.text(x, y, text);
    }
  }

  /**
   * Create a retro shadow effect for a sprite
   * @param sprite The sprite to add shadow to
   * @param offsetX Shadow X offset
   * @param offsetY Shadow Y offset
   * @param color Shadow color
   * @param alpha Shadow opacity
   * @returns The shadow sprite
   */
  createShadow(
    sprite: Phaser.GameObjects.Sprite,
    offsetX: number = 4,
    offsetY: number = 4,
    color: number = 0x000000,
    alpha: number = 0.5
  ): Phaser.GameObjects.Sprite {
    try {
      // Create a shadow sprite using the same texture
      const shadow = this.scene.add.sprite(
        sprite.x + offsetX,
        sprite.y + offsetY,
        sprite.texture.key,
        sprite.frame.name
      );
      
      // Set shadow properties
      shadow.setTint(color);
      shadow.setAlpha(alpha);
      shadow.setDepth(sprite.depth - 1);
      shadow.setOrigin(sprite.originX, sprite.originY);
      shadow.setScale(sprite.scaleX, sprite.scaleY);
      
      // Link shadow to the original sprite to move together
      sprite.setData('shadow', shadow);
      
      // Listen for position updates
      sprite.on('destroy', () => {
        shadow.destroy();
      });
      
      if (this.debugMode) {
        console.log(`Created shadow for sprite (offset: ${offsetX},${offsetY}, color: ${color.toString(16)}, alpha: ${alpha})`);
      }
      
      return shadow;
    } catch (error) {
      console.error('Error creating shadow:', error);
      // Return the original sprite as fallback
      return sprite;
    }
  }

  /**
   * Make a sprite flash with a color tint
   * @param sprite The sprite to flash
   * @param color Flash color
   * @param duration Flash duration in ms
   * @param repeat Number of flashes
   */
  flashSprite(
    sprite: Phaser.GameObjects.Sprite,
    color: number = 0xffffff,
    duration: number = 100,
    repeat: number = 3
  ): void {
    try {
      // Original tint
      const originalTint = sprite.tintTopLeft;
      let flashing = false;
      
      // Create repeating timer
      const timer = this.scene.time.addEvent({
        delay: duration,
        callback: () => {
          if (flashing) {
            // Restore original tint
            sprite.setTint(originalTint);
          } else {
            // Apply flash tint
            sprite.setTint(color);
          }
          flashing = !flashing;
        },
        repeat: repeat * 2 - 1 // Each flash needs 2 timer events (on+off)
      });
      
      // Always end on original tint
      this.scene.time.delayedCall(duration * (repeat * 2), () => {
        sprite.setTint(originalTint);
      });
      
      if (this.debugMode) {
        console.log(`Flashing sprite with color ${color.toString(16)} for ${duration}ms x ${repeat}`);
      }
    } catch (error) {
      console.error('Error flashing sprite:', error);
    }
  }
}
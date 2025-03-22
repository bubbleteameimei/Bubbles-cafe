/**
 * Pixel Art Generator Utility
 * 
 * This utility provides functions to generate and manipulate pixel art assets
 * for the game at runtime, in case we have missing assets or need to create
 * dynamic effects.
 */

// Types for pixel art generation
interface PixelArtOptions {
  width: number;
  height: number;
  scale?: number;
  palette?: string[];
  background?: string;
}

// Common color palettes for pixel art
export const PALETTES = {
  // DawnBringer 16 palette - popular for pixel art
  DB16: [
    '#140c1c', '#442434', '#30346d', '#4e4a4e',
    '#854c30', '#346524', '#d04648', '#757161',
    '#597dce', '#d27d2c', '#8595a1', '#6daa2c',
    '#d2aa99', '#6dc2ca', '#dad45e', '#deeed6'
  ],
  // NES-inspired palette with limited colors
  NES: [
    '#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc',
    '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8',
    '#0000fc', '#b8b8f8', '#6888fc', '#44fc62',
    '#00a800', '#004400', '#e49454', '#e43a28',
    '#b8002a', '#f8b8f8', '#fc74b4', '#84186c'
  ],
  // GameBoy-inspired palette (4 shades of green)
  GB: [
    '#0f380f', '#306230', '#8bac0f', '#9bbc0f'
  ],
  // Grayscale palette for monochrome effects
  GRAYSCALE: [
    '#000000', '#333333', '#666666', '#999999', 
    '#cccccc', '#ffffff'
  ]
};

/**
 * Create a blank pixel art canvas
 */
export function createPixelArtCanvas(options: PixelArtOptions): HTMLCanvasElement {
  const { width, height, scale = 1, background = 'transparent' } = options;
  
  // Create canvas with appropriate size
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  
  // Set up context for pixel art rendering
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  // Enable pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  
  // Fill background if specified
  if (background !== 'transparent') {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  return canvas;
}

/**
 * Draw a pixel at the specified coordinates
 */
export function drawPixel(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  color: string, 
  scale = 1
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

/**
 * Create a simple character sprite as a placeholder
 */
export function generateCharacterSprite(options: {
  width?: number;
  height?: number;
  scale?: number;
  bodyColor?: string;
  headColor?: string;
  backgroundColor?: string;
}): HTMLCanvasElement {
  const {
    width = 16,
    height = 24,
    scale = 1,
    bodyColor = '#4CAF50',
    headColor = '#FFA000',
    backgroundColor = 'transparent'
  } = options;
  
  const canvas = createPixelArtCanvas({
    width,
    height,
    scale,
    background: backgroundColor
  });
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  // Draw head (top third)
  ctx.fillStyle = headColor;
  ctx.fillRect(
    Math.floor(width / 4) * scale, 
    0, 
    Math.floor(width / 2) * scale, 
    Math.floor(height / 3) * scale
  );
  
  // Draw body (bottom two thirds)
  ctx.fillStyle = bodyColor;
  ctx.fillRect(
    Math.floor(width / 4) * scale, 
    Math.floor(height / 3) * scale, 
    Math.floor(width / 2) * scale, 
    Math.floor(height * 2 / 3) * scale
  );
  
  // Add simple details (eyes)
  ctx.fillStyle = '#000000';
  ctx.fillRect(
    Math.floor(width / 3) * scale, 
    Math.floor(height / 6) * scale, 
    Math.floor(scale), 
    Math.floor(scale)
  );
  ctx.fillRect(
    Math.floor(width * 2 / 3) * scale, 
    Math.floor(height / 6) * scale, 
    Math.floor(scale), 
    Math.floor(scale)
  );
  
  return canvas;
}

/**
 * Create a simple tile sprite as a placeholder
 */
export function generateTileSprite(options: {
  size?: number;
  scale?: number;
  baseColor?: string;
  patternColor?: string;
  pattern?: 'solid' | 'checker' | 'grid' | 'diagonal' | 'dot';
}): HTMLCanvasElement {
  const {
    size = 16,
    scale = 1,
    baseColor = '#8BC34A',
    patternColor = '#689F38',
    pattern = 'solid'
  } = options;
  
  const canvas = createPixelArtCanvas({
    width: size,
    height: size,
    scale,
    background: baseColor
  });
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  ctx.fillStyle = patternColor;
  
  // Draw pattern based on selected type
  switch (pattern) {
    case 'checker':
      for (let x = 0; x < size; x += 2) {
        for (let y = 0; y < size; y += 2) {
          if ((x + y) % 4 === 0) {
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      break;
      
    case 'grid':
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      break;
      
    case 'diagonal':
      for (let i = 0; i < size * 2; i += 4) {
        for (let x = 0; x < size; x++) {
          const y = i - x;
          if (y >= 0 && y < size) {
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      break;
      
    case 'dot':
      for (let x = 4; x < size; x += 4) {
        for (let y = 4; y < size; y += 4) {
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
      break;
      
    case 'solid':
    default:
      // Base color only, already filled
      break;
  }
  
  return canvas;
}

/**
 * Generate a simple item sprite as a placeholder
 */
export function generateItemSprite(options: {
  type?: 'potion' | 'coin' | 'key' | 'scroll';
  size?: number;
  scale?: number;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}): HTMLCanvasElement {
  const {
    type = 'potion',
    size = 16,
    scale = 1,
    primaryColor = '#E91E63',
    secondaryColor = '#FFC107',
    backgroundColor = 'transparent'
  } = options;
  
  const canvas = createPixelArtCanvas({
    width: size,
    height: size,
    scale,
    background: backgroundColor
  });
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  switch (type) {
    case 'potion':
      // Draw potion bottle
      const bottleColor = '#90CAF9';
      const liquidColor = primaryColor;
      const capColor = secondaryColor;
      
      // Draw bottle
      ctx.fillStyle = bottleColor;
      ctx.fillRect(size / 4 * scale, size / 3 * scale, size / 2 * scale, size / 2 * scale);
      
      // Draw liquid
      ctx.fillStyle = liquidColor;
      ctx.fillRect(size / 4 * scale, size / 2 * scale, size / 2 * scale, size / 3 * scale);
      
      // Draw bottle cap
      ctx.fillStyle = capColor;
      ctx.fillRect(size / 3 * scale, size / 4 * scale, size / 3 * scale, size / 6 * scale);
      break;
      
    case 'coin':
      // Draw coin
      ctx.fillStyle = secondaryColor;
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 3;
      
      ctx.beginPath();
      ctx.arc(centerX * scale, centerY * scale, radius * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw coin details
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(centerX * scale, centerY * scale, radius / 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'key':
      // Draw key
      ctx.fillStyle = secondaryColor;
      
      // Draw key head
      const headSize = size / 3;
      ctx.beginPath();
      ctx.arc((size / 4 + headSize / 2) * scale, (size / 3 + headSize / 2) * scale, headSize / 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw key shaft
      ctx.fillRect((size / 3 + headSize / 2) * scale, (size / 2) * scale, (size / 2) * scale, (size / 6) * scale);
      
      // Draw key teeth
      ctx.fillRect((size * 2 / 3) * scale, (size * 5 / 12) * scale, (size / 6) * scale, (size / 3) * scale);
      break;
      
    case 'scroll':
      // Draw scroll
      const scrollColor = '#F5F5F5';
      const textColor = primaryColor;
      
      // Draw scroll paper
      ctx.fillStyle = scrollColor;
      ctx.fillRect((size / 6) * scale, (size / 6) * scale, (size * 2 / 3) * scale, (size * 2 / 3) * scale);
      
      // Draw scroll text lines
      ctx.fillStyle = textColor;
      for (let i = 0; i < 3; i++) {
        ctx.fillRect((size / 4) * scale, (size / 4 + i * size / 6) * scale, (size / 2) * scale, (size / 12) * scale);
      }
      break;
  }
  
  return canvas;
}

/**
 * Convert an HTML canvas to a data URL for use as an image source
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' | 'webp' = 'png'): string {
  const mimeType = `image/${format}`;
  return canvas.toDataURL(mimeType);
}

/**
 * Create an Image element from a canvas
 */
export function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = canvasToDataURL(canvas);
    
    // Ensure proper pixel art rendering
    img.style.imageRendering = 'pixelated';
  });
}

/**
 * Apply a pixel art filter to an existing image
 */
export function pixelateImage(
  img: HTMLImageElement, 
  pixelSize: number = 4, 
  palette?: string[]
): HTMLCanvasElement {
  // Create a canvas to draw the pixelated image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  
  // Disable image smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false;
  
  // Draw the image at a smaller size
  const smallCanvas = document.createElement('canvas');
  const smallCtx = smallCanvas.getContext('2d');
  if (!smallCtx) {
    throw new Error('Failed to get 2D context from small canvas');
  }
  
  const smallWidth = Math.floor(img.width / pixelSize);
  const smallHeight = Math.floor(img.height / pixelSize);
  
  smallCanvas.width = smallWidth;
  smallCanvas.height = smallHeight;
  
  // Draw the image at a reduced size
  smallCtx.drawImage(img, 0, 0, smallWidth, smallHeight);
  
  // Get the pixel data
  const imageData = smallCtx.getImageData(0, 0, smallWidth, smallHeight);
  const pixels = imageData.data;
  
  // Apply color palette if provided
  if (palette && palette.length > 0) {
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Find the closest color in the palette
      let closestColor = palette[0];
      let closestDistance = Infinity;
      
      for (const color of palette) {
        // Convert hex to rgb
        const rgb = hexToRgb(color);
        if (!rgb) continue;
        
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(r - rgb.r, 2) +
          Math.pow(g - rgb.g, 2) +
          Math.pow(b - rgb.b, 2)
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestColor = color;
        }
      }
      
      // Apply the closest color
      const rgb = hexToRgb(closestColor);
      if (rgb) {
        pixels[i] = rgb.r;
        pixels[i + 1] = rgb.g;
        pixels[i + 2] = rgb.b;
      }
    }
    
    // Put the modified pixel data back
    smallCtx.putImageData(imageData, 0, 0);
  }
  
  // Scale up the small image to create pixelated effect
  ctx.drawImage(
    smallCanvas, 
    0, 0, smallWidth, smallHeight,
    0, 0, img.width, img.height
  );
  
  return canvas;
}

/**
 * Helper function to convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Generate a simple tilemap for testing
 */
export function generateTestTilemap(width: number, height: number): { data: number[][], width: number, height: number } {
  const data: number[][] = [];
  
  // Create a simple pattern with a border and some obstacles
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        // Border walls
        row.push(1);
      } else if ((x % 5 === 0 && y % 4 === 0) || (x % 7 === 0 && y % 6 === 0)) {
        // Some obstacles
        row.push(2);
      } else {
        // Floor
        row.push(0);
      }
    }
    data.push(row);
  }
  
  return { data, width, height };
}
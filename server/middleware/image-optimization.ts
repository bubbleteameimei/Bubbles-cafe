
import path from 'path';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

// Define allowed image extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const CACHE_CONTROL_HEADER = 'public, max-age=31536000, immutable';
const IMAGE_QUALITY = 80;
const WEBP_QUALITY = 75;

// Define image size presets (width in pixels)
const SIZE_PRESETS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  original: -1 // Original size
};

interface ImageOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
}

/**
 * Image optimization middleware
 */
export function imageOptimizationMiddleware(
  imagesDir: string = path.join(process.cwd(), 'attached_assets')
) {
  // Create cache directory
  const cacheDir = path.join(process.cwd(), 'server/public/img-cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // Only process GET requests to image paths
      if (req.method !== 'GET' || !req.path.startsWith('/img/')) {
        return next();
      }

      // Parse the requested path: /img/[optional size]/filename
      const pathParts = req.path.split('/').filter(part => part);
      
      if (pathParts.length < 2) {
        return next();
      }

      // Extract the size parameter and filename
      let size = 'original';
      let filename = pathParts[1];
      
      if (pathParts.length >= 3) {
        size = pathParts[1];
        filename = pathParts[2];
      }

      // Validate size parameter
      if (size !== 'original' && !Object.keys(SIZE_PRESETS).includes(size)) {
        return res.status(400).send('Invalid size parameter');
      }

      // Get full file path
      const originalImagePath = path.join(imagesDir, filename);
      const ext = path.extname(filename).toLowerCase();

      // Check if file exists and is an allowed image type
      if (!fs.existsSync(originalImagePath) || !ALLOWED_EXTENSIONS.includes(ext)) {
        return next();
      }

      // Parse query parameters for additional options
      const options: ImageOptions = {
        width: SIZE_PRESETS[size as keyof typeof SIZE_PRESETS],
        format: req.query.format as string || path.extname(filename).slice(1),
        quality: req.query.quality ? parseInt(req.query.quality as string, 10) : IMAGE_QUALITY
      };

      // Validate and normalize options
      if (options.format && !['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(options.format)) {
        options.format = 'webp'; // Default to webp for unsupported formats
      }

      if (options.quality && (options.quality < 1 || options.quality > 100)) {
        options.quality = IMAGE_QUALITY;
      }

      // Generate a cache key based on options
      const cacheKey = [
        path.basename(filename, ext),
        options.width !== -1 ? `w${options.width}` : 'orig',
        options.height ? `h${options.height}` : '',
        `q${options.quality}`,
        options.format || ext.slice(1)
      ].filter(Boolean).join('-');
      
      const cacheFilePath = path.join(cacheDir, `${cacheKey}.${options.format || ext.slice(1)}`);

      // Check if we have a cached version
      if (fs.existsSync(cacheFilePath)) {
        const cachedFileStats = fs.statSync(cacheFilePath);
        const originalFileStats = fs.statSync(originalImagePath);
        
        // If original is newer than cached, regenerate
        if (originalFileStats.mtime > cachedFileStats.mtime) {
          await processAndSaveImage(originalImagePath, cacheFilePath, options);
        }
        
        // Send the cached file
        res.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
        return res.sendFile(cacheFilePath);
      }

      // Process and cache the image
      await processAndSaveImage(originalImagePath, cacheFilePath, options);
      
      // Send the processed image
      res.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
      return res.sendFile(cacheFilePath);
    } catch (error) {
      console.error('[ImageOptimization] Error:', error);
      next(error);
    }
  };
}

/**
 * Process and save an image with the specified options
 */
async function processAndSaveImage(
  inputPath: string, 
  outputPath: string, 
  options: ImageOptions
): Promise<void> {
  try {
    let image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if needed
    if (options.width && options.width > 0) {
      image = image.resize({
        width: options.width,
        height: options.height,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to requested format
    if (options.format) {
      switch (options.format) {
        case 'jpg':
        case 'jpeg':
          image = image.jpeg({ quality: options.quality || IMAGE_QUALITY });
          break;
        case 'png':
          image = image.png({ quality: options.quality || IMAGE_QUALITY });
          break;
        case 'webp':
          image = image.webp({ quality: options.quality || WEBP_QUALITY });
          break;
        case 'avif':
          image = image.avif({ quality: options.quality || WEBP_QUALITY });
          break;
      }
    }

    // Save to output path
    await image.toFile(outputPath);
  } catch (error) {
    console.error('[ImageProcessing] Error processing image:', error);
    throw error;
  }
}

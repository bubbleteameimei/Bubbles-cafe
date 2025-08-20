/**
 * Image Optimization Middleware
 * 
 * This middleware optimizes images served by the application,
 * reducing file sizes and improving load times.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
let sharp: any = null;
try {
  // Lazy require sharp to avoid optional dependency issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sharp = require('sharp');
} catch {
  sharp = null;
}

// Define configuration options
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public', 'cache'); 
const DEFAULT_QUALITY = 80;
const MAX_WIDTH = 1200;
const WEBP_SUPPORTED = true;

// Define image pattern to match
const IMAGE_PATTERN = /\.(jpe?g|png|gif)$/i;

// Ensure cache directory exists
try {
  if (!fs.existsSync(IMAGE_CACHE_DIR)) {
    fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating image cache directory:', error);
}

// Helper function to determine if webp is supported by client
function clientSupportsWebP(req: Request): boolean {
  if (!WEBP_SUPPORTED) return false;
  
  const acceptHeader = req.headers.accept || '';
  return acceptHeader.includes('image/webp');
}

// Helper function to get optimized image parameters
function getOptimizedParams(req: Request): { 
  width?: number; 
  quality?: number;
  format?: string;
} {
  // Parse width parameter with proper validation
  let width: number | undefined = undefined;
  if (req.query.width) {
    const parsedWidth = parseInt(req.query.width as string, 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0 && parsedWidth <= MAX_WIDTH) {
      width = parsedWidth;
    }
  }
  
  // Parse quality parameter with proper validation
  let quality: number = DEFAULT_QUALITY;
  if (req.query.quality) {
    const parsedQuality = parseInt(req.query.quality as string, 10);
    if (!isNaN(parsedQuality) && parsedQuality > 0 && parsedQuality <= 100) {
      quality = parsedQuality;
    }
  }
  
  const format = clientSupportsWebP(req) ? 'webp' : undefined;
  
  return { width, quality, format };
}

// Get cache path for an image
function getCachePath(filePath: string, params: { width?: number; quality?: number; format?: string }): string {
  const fileExt = path.extname(filePath);
  const fileName = path.basename(filePath, fileExt);
  const hash = crypto.createHash('md5')
    .update(`${filePath}-w${params.width || 'orig'}-q${params.quality}-${params.format || fileExt.substring(1)}`)
    .digest('hex')
    .substring(0, 12);
  
  return path.join(
    IMAGE_CACHE_DIR, 
    `${fileName}-${hash}${params.format ? `.${params.format}` : fileExt}`
  );
}

// Resize function using Sharp when available, otherwise copy
async function processImage(source: string, target: string, options: { width?: number; quality?: number; format?: string }): Promise<void> {
  if (!sharp) {
    await fs.promises.copyFile(source, target);
    return;
  }
  const { width, quality = 80, format } = options;
  let pipeline = sharp(source);
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else {
    const ext = path.extname(source).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    if (ext === '.png') pipeline = pipeline.png({ quality });
  }
  await pipeline.toFile(target);
}

// Middleware function
export async function imageOptimizationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only process GET requests to image files
  if (req.method !== 'GET' || !req.path.match(IMAGE_PATTERN)) {
    return next();
  }
  
  // If no optimization params, just continue
  if (!req.query.width && !req.query.quality && !clientSupportsWebP(req)) {
    return next();
  }
  
  // Determine the file path (use dist/public in production)
  const publicRoot = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'dist', 'public')
    : path.join(process.cwd(), 'public');
  const filePath = path.join(publicRoot, req.path);
  
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return next();
  }
  
  try {
    // Get optimization parameters
    const params = getOptimizedParams(req);
    
    // Determine cache path for optimized image
    const cachePath = getCachePath(filePath, params);
    
    // If cached version exists, serve it
    if (fs.existsSync(cachePath)) {
      return res.sendFile(cachePath);
    }
    
    // If not cached, generate optimized image (or copy if sharp not available)
    await processImage(filePath, cachePath, params);
    return res.sendFile(cachePath);
  } catch (error) {
    console.error('Error in image optimization middleware:', error);
    next();
  }
}
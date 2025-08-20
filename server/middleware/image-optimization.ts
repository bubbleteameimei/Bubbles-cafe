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

// Mock resize function for now (to be implemented with Sharp when needed)
function mockResizeImage(source: string, target: string, options: any): Promise<void> {
  // Since we don't have the actual image processing library installed,
  // we'll just copy the file as-is for now
  return new Promise((resolve, reject) => {
    fs.copyFile(source, target, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Middleware function
export function imageOptimizationMiddleware(req: Request, res: Response, next: NextFunction) {
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
    
    // If not, we would normally optimize the image here
    // But since we don't have Sharp installed, we'll add a placeholder for now
    // In a real implementation, we would resize, format convert, and compress the image
    console.log(`[Image Optimizer] Would optimize ${filePath} with params:`, params);
    
    // For now, just send the original
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error in image optimization middleware:', error);
    next();
  }
}
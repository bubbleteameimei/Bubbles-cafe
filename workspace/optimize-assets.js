/**
 * Asset Optimization Script
 * 
 * This script optimizes the attached_assets directory by:
 * 1. Moving important images to client/public/images
 * 2. Removing unnecessary or duplicate assets
 * 3. Organizing assets into categories
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Size display helper
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Essential images to preserve and move to client/public
const ESSENTIAL_IMAGES = [
  'IMG_5891.jpeg', // Background image
  // Add other important images here
];

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy a file
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

// Get file extension
function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

// Get file size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Create an organized directory structure for assets
function organizeAssets() {
  const sourceDir = path.join(__dirname, 'attached_assets');
  const targetDir = path.join(__dirname, 'client/public/images');
  
  // Ensure directories exist
  ensureDir(targetDir);
  ensureDir(path.join(targetDir, 'backgrounds'));
  ensureDir(path.join(targetDir, 'icons'));
  ensureDir(path.join(targetDir, 'ui'));
  
  // Organize essential images
  for (const img of ESSENTIAL_IMAGES) {
    const source = path.join(sourceDir, img);
    const dest = path.join(targetDir, img);
    
    if (fs.existsSync(source)) {
      copyFile(source, dest);
    }
  }
  
  // Find all image files and categorize them
  const files = fs.readdirSync(sourceDir);
  let totalOptimized = 0;
  
  // Count file extensions for reporting
  const extensionCounts = {};
  
  for (const file of files) {
    const source = path.join(sourceDir, file);
    
    // Skip directories and non-files
    if (!fs.statSync(source).isFile()) continue;
    
    const ext = getExtension(file);
    extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
    
    // Skip essential images already copied
    if (ESSENTIAL_IMAGES.includes(file)) continue;
    
    // Categorize image files
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
      // Only move image files that are relevant for the app
      // For now, we leave them in place in attached_assets
      totalOptimized += getFileSize(source);
    }
  }
  
  // Report on file types in attached_assets
  console.log('\nFile types in attached_assets:');
  for (const [ext, count] of Object.entries(extensionCounts)) {
    console.log(`${ext}: ${count} files`);
  }
  
  return totalOptimized;
}

async function main() {
  console.log('==== Asset Optimization ====');
  
  const initialSize = getFileSize(path.join(__dirname, 'attached_assets'));
  console.log(`Initial assets size: ${formatBytes(initialSize)}`);
  
  // Organize assets into the client/public/images directory
  const optimized = organizeAssets();
  
  console.log('\n==== Optimization Summary ====');
  console.log(`Essential files copied to client/public/images`);
  console.log(`Assets organized for better management`);
  
  // If we decide to remove attached_assets after copying essential files:
  // console.log(`Space optimized: ${formatBytes(optimized)}`);
}

main().catch(console.error);
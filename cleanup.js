/**
 * Project Size Optimization Script
 * 
 * This script reduces the overall project size by:
 * 1. Removing unnecessary backup files
 * 2. Cleaning large log files
 * 3. Removing production build artifacts
 * 4. Optimizing the attached_assets directory
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to clean up
const DIRS_TO_CLEAN = [
  'backup-latest',
  'logs',
  'production-build',
  'temp_extract',
  'temp_loader',
  'temp_migration',
  'temp_toggle',
  'test-reports'
];

// Files to remove
const FILES_TO_REMOVE = [
  'backup-20250324.sql',
  'backup.sql',
];

// Size display helper
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Get size of path
function getPathSize(pathToCheck) {
  try {
    const output = execSync(`du -sb "${pathToCheck}" 2>/dev/null || echo 0`).toString();
    const size = parseInt(output.split(/\s+/)[0], 10);
    return isNaN(size) ? 0 : size;
  } catch (error) {
    return 0;
  }
}

// Clean a directory (empty it but keep the directory)
function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  const startSize = getPathSize(dir);
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const dirSize = getPathSize(fullPath);
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Removed directory: ${fullPath} (${formatBytes(dirSize)})`);
      } catch (error) {
        console.error(`Failed to remove directory ${fullPath}: ${error.message}`);
      }
    } else {
      const fileSize = getPathSize(fullPath);
      try {
        fs.unlinkSync(fullPath);
        console.log(`Removed file: ${fullPath} (${formatBytes(fileSize)})`);
      } catch (error) {
        console.error(`Failed to remove file ${fullPath}: ${error.message}`);
      }
    }
  }
  
  const endSize = getPathSize(dir);
  return startSize - endSize;
}

// Remove a file
function removeFile(file) {
  if (!fs.existsSync(file)) return 0;
  
  const fileSize = getPathSize(file);
  
  try {
    fs.unlinkSync(file);
    console.log(`Removed file: ${file} (${formatBytes(fileSize)})`);
    return fileSize;
  } catch (error) {
    console.error(`Failed to remove file ${file}: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('==== Project Size Optimization ====');
  
  // Get initial project size
  const initialSize = getPathSize('.');
  console.log(`Initial project size: ${formatBytes(initialSize)}`);
  
  let totalSaved = 0;
  
  // Clean directories
  for (const dir of DIRS_TO_CLEAN) {
    console.log(`\nCleaning directory: ${dir}`);
    const saved = cleanDirectory(dir);
    console.log(`Saved ${formatBytes(saved)} by cleaning ${dir}`);
    totalSaved += saved;
  }
  
  // Remove files
  for (const file of FILES_TO_REMOVE) {
    console.log(`\nRemoving file: ${file}`);
    const saved = removeFile(file);
    console.log(`Saved ${formatBytes(saved)} by removing ${file}`);
    totalSaved += saved;
  }
  
  // Get final project size
  const finalSize = getPathSize('.');
  
  console.log('\n==== Optimization Summary ====');
  console.log(`Initial size: ${formatBytes(initialSize)}`);
  console.log(`Final size: ${formatBytes(finalSize)}`);
  console.log(`Space saved: ${formatBytes(totalSaved)}`);
  console.log(`Reduction: ${(totalSaved / initialSize * 100).toFixed(2)}%`);
}

main().catch(console.error);
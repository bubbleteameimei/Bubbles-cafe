/**
 * Advanced Project Optimization Script
 * 
 * This script performs a comprehensive project optimization:
 * 1. Cleans unnecessary files and directories
 * 2. Optimizes assets and organizes them
 * 3. Analyzes dependencies and suggests optimizations
 * 4. Optionally performs npm dedupe to remove duplicate dependencies
 * 
 * Usage:
 *   node optimize-project-advanced.js         # Analysis only
 *   node optimize-project-advanced.js --dedupe # Run npm dedupe (requires confirmation)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

// Helper to get disk usage of a path
function getPathSize(pathToCheck) {
  try {
    const output = execSync(`du -sb "${pathToCheck}" 2>/dev/null || echo 0`).toString();
    const size = parseInt(output.split(/\s+/)[0], 10);
    return isNaN(size) ? 0 : size;
  } catch (error) {
    return 0;
  }
}

// Run a script
async function runScript(scriptPath) {
  console.log(`\n\n========== RUNNING ${scriptPath} ==========\n`);
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running ${scriptPath}:`, error.message);
    return false;
  }
}

// Ask for user confirmation
function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question + ' (y/n) ', answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run npm dedupe to remove duplicate dependencies
async function runNpmDedupe() {
  console.log('\n========== RUNNING NPM DEDUPE ==========\n');
  
  const beforeSize = getPathSize(path.join(__dirname, 'node_modules'));
  console.log(`Before deduplication: ${formatBytes(beforeSize)}`);
  
  try {
    console.log('Running npm dedupe...');
    execSync('npm dedupe', { stdio: 'inherit' });
    
    const afterSize = getPathSize(path.join(__dirname, 'node_modules'));
    console.log(`After deduplication: ${formatBytes(afterSize)}`);
    console.log(`Space saved: ${formatBytes(beforeSize - afterSize)}`);
    
    return true;
  } catch (error) {
    console.error('Error running npm dedupe:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const shouldDedupe = process.argv.includes('--dedupe');
  
  console.log('====== ADVANCED PROJECT OPTIMIZATION ======');
  
  // Get initial project size
  const initialSize = getPathSize(__dirname);
  console.log(`Initial project size: ${formatBytes(initialSize)}`);
  
  // Step 1: Clean unnecessary files
  await runScript('./cleanup.js');
  
  // Step 2: Optimize assets
  await runScript('./optimize-assets.js');
  
  // Step 3: Analyze dependencies
  await runScript('./analyze-top-deps.js');
  
  let dedupePerformed = false;
  
  // Step 4: Optionally run npm dedupe
  if (shouldDedupe) {
    const proceed = await confirm('Do you want to run npm dedupe to optimize dependencies?');
    
    if (proceed) {
      dedupePerformed = await runNpmDedupe();
    } else {
      console.log('Skipping npm dedupe.');
    }
  }
  
  // Get final project size
  const finalSize = getPathSize(__dirname);
  const savedSpace = initialSize - finalSize;
  
  console.log('\n\n====== OPTIMIZATION SUMMARY ======');
  console.log(`Initial size: ${formatBytes(initialSize)}`);
  console.log(`Final size: ${formatBytes(finalSize)}`);
  console.log(`Space saved: ${formatBytes(savedSpace)} (${(savedSpace / initialSize * 100).toFixed(2)}%)`);
  
  console.log('\nOptimizations performed:');
  console.log('1. Removed unnecessary backup files and directories');
  console.log('2. Cleaned log files');
  console.log('3. Organized and optimized assets');
  console.log('4. Analyzed dependencies');
  if (dedupePerformed) {
    console.log('5. Removed duplicate dependencies with npm dedupe');
  }
  
  console.log('\nAdditional recommended steps:');
  if (!dedupePerformed) {
    console.log('1. Run npm dedupe to remove duplicate dependencies');
  }
  console.log(`${dedupePerformed ? '1' : '2'}. For production deployment, run npm prune --production`);
  console.log(`${dedupePerformed ? '2' : '3'}. Consider removing unused large dependencies`);
}

main().catch(console.error);
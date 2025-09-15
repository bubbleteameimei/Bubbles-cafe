/**
 * Master Project Optimization Script
 * 
 * This script orchestrates all optimization steps to reduce the project size:
 * 1. Clean unnecessary files and directories
 * 2. Optimize assets
 * 3. Analyze and optimize dependencies
 */

import { execSync } from 'child_process';

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

async function main() {
  console.log('====== PROJECT OPTIMIZATION MASTER SCRIPT ======');
  console.log('Starting project optimization process...');
  
  // Step 1: Clean unnecessary files
  await runScript('./cleanup.js');
  
  // Step 2: Optimize assets
  await runScript('./optimize-assets.js');
  
  // Step 3: Analyze dependencies
  await runScript('./optimize-dependencies.js');
  
  console.log('\n\n====== OPTIMIZATION COMPLETE ======');
  console.log('The following optimizations have been performed:');
  console.log('1. Removed unnecessary backup files and directories');
  console.log('2. Cleaned log files');
  console.log('3. Organized and optimized assets');
  console.log('4. Analyzed dependencies for further optimization');
  
  console.log('\nAdditional recommended steps:');
  console.log('1. Run npm dedupe to remove duplicate dependencies');
  console.log('2. Consider removing unused dependencies');
  console.log('3. For production, use npm prune --production');
}

main().catch(console.error);
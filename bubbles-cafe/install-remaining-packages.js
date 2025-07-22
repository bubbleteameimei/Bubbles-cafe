/**
 * Package Installation for remaining libraries
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packages = [
  // Already installed:
  // 'react-device-detect',
  // 'react-use',
  // 'react-scramble',
  // 'posthog-js',
  
  // Remaining packages
  'use-local-storage-state',
  'react-simple-typewriter',
  'socket.io-client',
  'react-speech-recognition',
  'react-intersection-observer'
];

async function installPackage(packageName) {
  console.log(`Installing ${packageName}...`);
  try {
    execSync(`npm install --no-save --legacy-peer-deps ${packageName}`, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}`);
    return true;
  } catch (error) {
    console.error(`Failed to install ${packageName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Installing Remaining Packages ===');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const pkg of packages) {
    const success = await installPackage(pkg);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n=== Installation Summary ===');
  console.log(`Successfully installed: ${successCount} packages`);
  console.log(`Failed to install: ${failCount} packages`);
}

main().catch(console.error);
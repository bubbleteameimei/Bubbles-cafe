/**
 * Install Missing Libraries Script
 * 
 * This script installs the missing libraries for the comment moderation and recommended libraries demos
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a package is already installed
function isPackageInstalled(packageName) {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    return (
      (packageJson.dependencies && packageJson.dependencies[packageName]) ||
      (packageJson.devDependencies && packageJson.devDependencies[packageName])
    );
  } catch (error) {
    console.error(`Error checking if ${packageName} is installed:`, error);
    return false;
  }
}

// Function to install a package safely
function installPackage(packageName) {
  if (isPackageInstalled(packageName)) {
    console.log(`Package ${packageName} is already installed.`);
    return true;
  }
  
  try {
    console.log(`Installing ${packageName}...`);
    execSync(`npm install ${packageName}`, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}.`);
    return true;
  } catch (error) {
    console.error(`Failed to install ${packageName}:`, error.message);
    return false;
  }
}

// List of packages to install
const packagesToInstall = [
  'bad-words',
  'leo-profanity',
  'react-type-animation',
  'react-modal',
  'react-speech-kit',
  'immer',
  'clsx'
];

// Install each package separately
console.log('Starting installation of missing libraries...');
let successCount = 0;
let failureCount = 0;

for (const packageName of packagesToInstall) {
  const success = installPackage(packageName);
  if (success) {
    successCount++;
  } else {
    failureCount++;
  }
  
  // Add a small delay between installations to prevent rate limiting
  if (packageName !== packagesToInstall[packagesToInstall.length - 1]) {
    console.log('Waiting a moment before next installation...');
    execSync('sleep 2');
  }
}

console.log('\nInstallation summary:');
console.log(`- Successfully installed: ${successCount} packages`);
console.log(`- Failed to install: ${failureCount} packages`);

if (failureCount > 0) {
  console.log('\nSome packages failed to install. You may need to:');
  console.log('1. Try running this script again');
  console.log('2. Install the packages manually using npm install <package-name>');
  process.exit(1);
} else {
  console.log('\nAll packages installed successfully!');
  process.exit(0);
}
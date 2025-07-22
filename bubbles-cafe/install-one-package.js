/**
 * Install One Package Script
 * 
 * This script installs one package at a time to avoid timeout issues
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
    execSync(`npm install ${packageName} --legacy-peer-deps`, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}.`);
    return true;
  } catch (error) {
    console.error(`Failed to install ${packageName}:`, error.message);
    return false;
  }
}

// Get the package name from command line arguments
const packageName = process.argv[2];

if (!packageName) {
  console.error('Please provide a package name as an argument.');
  process.exit(1);
}

// Install the package
const success = installPackage(packageName);

if (success) {
  console.log(`\nPackage ${packageName} installed successfully!`);
  process.exit(0);
} else {
  console.error(`\nFailed to install package ${packageName}.`);
  process.exit(1);
}
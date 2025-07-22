/**
 * Install Recommended Libraries Script
 * 
 * This script installs the recommended libraries from the DEPENDENCY_UPDATE_SUMMARY.md
 * file using the safer direct npm install approach, avoiding packager_tool issues
 * with path aliases.
 */
import { execSync } from 'child_process';

const packages = [
  'jwt-decode',
  'react-beautiful-dnd',
  'chart.js',
  'react-chartjs-2',
  'react-pdf',
  'react-comments-section'
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
  console.log('=== Installing Recommended Libraries ===');
  
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
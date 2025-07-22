/**
 * Install Additional Libraries Script
 * 
 * This script installs the additional libraries requested by the user using
 * the safer direct npm install approach to avoid packager_tool issues.
 */
import { execSync } from 'child_process';

const packages = [
  'bad-words',
  'leo-profanity',
  'immer',
  'react-type-animation',
  'react-modal',
  'react-speech-kit',
  'react-aria',
  'clsx'
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
  console.log('=== Installing Additional Libraries ===');
  
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
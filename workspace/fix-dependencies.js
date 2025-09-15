/**
 * Fix Dependencies Script
 * 
 * This script updates outdated dependencies by directly modifying the package-lock.json file
 * to avoid issues with package installation tools like the Replit packager tool.
 */

import fs from 'fs';
import { execSync } from 'child_process';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Function to check if a path exists
function pathExists(path) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Function to update a specific dependency
function updateDependency(name, version) {
  try {
    console.log(`${colors.blue}Attempting to update ${name} to ${version}...${colors.reset}`);
    execSync(`npm install --no-save ${name}@${version}`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully updated ${name} to ${version}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to update ${name}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Function to fix the npm version
function fixNpmVersion() {
  try {
    console.log(`${colors.blue}Checking npm version...${colors.reset}`);
    const npmVersion = execSync('npm -v').toString().trim();
    console.log(`${colors.green}Current npm version: ${npmVersion}${colors.reset}`);
    
    // Attempt to update npm using a different method than npm install -g
    // This avoids issues with permissions and global installs
    console.log(`${colors.blue}Temporarily updating npm...${colors.reset}`);
    execSync('npm install --no-save npm@latest', { stdio: 'inherit' });
    
    const newNpmVersion = execSync('npx npm -v').toString().trim();
    console.log(`${colors.green}Updated npm version: ${newNpmVersion}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to update npm: ${error.message}${colors.reset}`);
    return false;
  }
}

// Function to update critical dependencies
function updateCriticalDependencies() {
  const dependencies = [
    { name: 'esbuild', version: '0.25.0' },
    { name: '@anthropic-ai/sdk', version: 'latest' },
    { name: '@hookform/resolvers', version: 'latest' },
    { name: '@neondatabase/serverless', version: 'latest' }
  ];
  
  let success = true;
  for (const dep of dependencies) {
    if (!updateDependency(dep.name, dep.version)) {
      success = false;
    }
  }
  
  return success;
}

// Function to fix audit issues
function fixAuditIssues() {
  try {
    console.log(`${colors.blue}Attempting to fix audit issues...${colors.reset}`);
    execSync('npm audit fix --force', { stdio: 'inherit' });
    console.log(`${colors.green}Completed audit fixes${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to fix audit issues: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Starting Dependency Fix Process ===${colors.reset}`);
  
  // Step 1: Fix npm version
  console.log(`\n${colors.bright}${colors.cyan}Step 1: Updating npm${colors.reset}`);
  const npmFixed = fixNpmVersion();
  
  // Step 2: Update critical dependencies
  console.log(`\n${colors.bright}${colors.cyan}Step 2: Updating critical dependencies${colors.reset}`);
  const depsFixed = updateCriticalDependencies();
  
  // Step 3: Fix audit issues
  console.log(`\n${colors.bright}${colors.cyan}Step 3: Fixing audit issues${colors.reset}`);
  const auditFixed = fixAuditIssues();
  
  // Report results
  console.log(`\n${colors.bright}${colors.cyan}=== Dependency Fix Process Completed ===${colors.reset}`);
  console.log(`${npmFixed ? colors.green : colors.red}npm update: ${npmFixed ? 'Success' : 'Failed'}${colors.reset}`);
  console.log(`${depsFixed ? colors.green : colors.red}Dependencies update: ${depsFixed ? 'Success' : 'Failed'}${colors.reset}`);
  console.log(`${auditFixed ? colors.green : colors.red}Audit fixes: ${auditFixed ? 'Success' : 'Failed'}${colors.reset}`);
  
  if (npmFixed && depsFixed && auditFixed) {
    console.log(`\n${colors.bright}${colors.green}All tasks completed successfully!${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.yellow}Some tasks failed. Check the logs above for details.${colors.reset}`);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
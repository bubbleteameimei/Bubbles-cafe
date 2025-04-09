/**
 * Update Radix UI Components Script
 * 
 * This script updates all installed Radix UI components to their latest version
 */

import { execSync } from 'child_process';
import fs from 'fs';

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

// Function to get all installed Radix UI components
function getRadixComponents() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    return Object.keys(dependencies).filter(dep => dep.startsWith('@radix-ui/'));
  } catch (error) {
    console.error(`${colors.red}Error reading package.json: ${error.message}${colors.reset}`);
    return [];
  }
}

// Function to update a specific dependency
function updateDependency(name) {
  try {
    console.log(`${colors.blue}Attempting to update ${name} to latest...${colors.reset}`);
    execSync(`npm install --no-save ${name}@latest`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully updated ${name} to latest${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to update ${name}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Updating Radix UI Components ===${colors.reset}`);
  
  // Get all Radix UI components
  const radixComponents = getRadixComponents();
  console.log(`${colors.bright}Found ${radixComponents.length} Radix UI components:${colors.reset}`);
  radixComponents.forEach(comp => console.log(`  - ${comp}`));
  
  // Ask for confirmation
  console.log(`\n${colors.yellow}Proceeding with updates - this may take some time...${colors.reset}`);
  
  // Update each component
  let updated = 0;
  let failed = 0;
  
  for (const component of radixComponents) {
    if (updateDependency(component)) {
      updated++;
    } else {
      failed++;
    }
    // Delay to prevent any rate limiting issues
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Report results
  console.log(`\n${colors.bright}${colors.cyan}=== Update Summary ===${colors.reset}`);
  console.log(`${colors.green}Successfully updated: ${updated} components${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}Failed to update: ${failed} components${colors.reset}`);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
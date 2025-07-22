/**
 * Fix Remaining Dependencies Script
 * 
 * This script updates the remaining critical dependencies one by one
 */

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

// Main function
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Updating Single Dependency ===${colors.reset}`);
  
  // Process command line arguments to determine which dependency to update
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(`${colors.red}Error: Please provide a dependency name to update${colors.reset}`);
    console.log(`${colors.yellow}Usage: node fix-remaining-deps.js <dependencyName> [version]${colors.reset}`);
    console.log(`${colors.yellow}Example: node fix-remaining-deps.js @hookform/resolvers latest${colors.reset}`);
    process.exit(1);
  }
  
  const name = args[0];
  const version = args.length > 1 ? args[1] : 'latest';
  
  // Update the specified dependency
  const updated = updateDependency(name, version);
  
  if (updated) {
    console.log(`\n${colors.bright}${colors.green}Successfully updated ${name} to ${version}!${colors.reset}`);
  } else {
    console.log(`\n${colors.bright}${colors.red}Failed to update ${name}.${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
/**
 * Fix Packager Tool Script
 * 
 * This script helps fix the packager tool issues by providing a safer way to install packages.
 * It avoids the issue with path aliases like @/lib, @/hooks, etc. being misinterpreted as packages.
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

// Function to install a dependency
function installDependency(name, version = 'latest') {
  try {
    console.log(`${colors.blue}Installing ${name}@${version}...${colors.reset}`);
    execSync(`npm install --no-save ${name}@${version}`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed ${name}@${version}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to install ${name}: ${error.message}${colors.reset}`);
    return false;
  }
}

// Function to uninstall a dependency
function uninstallDependency(name, options = '') {
  try {
    console.log(`${colors.blue}Uninstalling ${name}...${colors.reset}`);
    execSync(`npm uninstall ${name} ${options}`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully uninstalled ${name}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to uninstall ${name}: ${error.message}${colors.reset}`);
    if (!options.includes('--legacy-peer-deps')) {
      console.log(`${colors.yellow}Retrying with --legacy-peer-deps...${colors.reset}`);
      return uninstallDependency(name, '--legacy-peer-deps');
    }
    return false;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(`${colors.red}Error: Insufficient arguments${colors.reset}`);
    console.log(`${colors.yellow}Usage: node fix-packager-tool.js <command> <package> [version]${colors.reset}`);
    console.log(`${colors.yellow}  command: 'install' or 'uninstall'${colors.reset}`);
    console.log(`${colors.yellow}  package: the name of the package${colors.reset}`);
    console.log(`${colors.yellow}  version: (optional) the version to install, defaults to 'latest'${colors.reset}`);
    process.exit(1);
  }
  
  const command = args[0].toLowerCase();
  if (command !== 'install' && command !== 'uninstall') {
    console.error(`${colors.red}Error: Invalid command '${command}'${colors.reset}`);
    console.log(`${colors.yellow}Command must be either 'install' or 'uninstall'${colors.reset}`);
    process.exit(1);
  }
  
  const packageName = args[1];
  const version = args[2] || 'latest';
  
  return { command, packageName, version };
}

// Main function
function main() {
  console.log(`${colors.bright}${colors.cyan}=== Packager Tool Fix ===${colors.reset}`);
  
  const { command, packageName, version } = parseArgs();
  
  if (command === 'install') {
    if (installDependency(packageName, version)) {
      console.log(`\n${colors.bright}${colors.green}Successfully installed ${packageName}@${version}${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.red}Failed to install ${packageName}@${version}${colors.reset}`);
      process.exit(1);
    }
  } else {
    if (uninstallDependency(packageName)) {
      console.log(`\n${colors.bright}${colors.green}Successfully uninstalled ${packageName}${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.red}Failed to uninstall ${packageName}${colors.reset}`);
      process.exit(1);
    }
  }
}

// Run the script
main();
/**
 * Production Build Preparation Script
 * 
 * This script prepares the application for production deployment by:
 * 1. Creating a production-optimized package.json
 * 2. Setting up a production deployment folder
 * 3. Copying only the necessary files for deployment
 * 
 * IMPORTANT: This script doesn't modify your development environment.
 * It creates a separate production-ready folder.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightBlue: '\x1b[94m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m'
};

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${colors.green}Created directory: ${dirPath}${colors.reset}`);
  }
}

// Function to format file sizes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Function to create a production-optimized package.json
function createProductionPackageJson() {
  console.log(`${colors.cyan}Creating production-optimized package.json...${colors.reset}`);
  
  try {
    // Read the original package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // Create a new object with only the necessary fields for production
    const prodPackage = {
      name: packageJson.name,
      version: packageJson.version,
      type: packageJson.type,
      license: packageJson.license,
      scripts: {
        start: packageJson.scripts.start
      },
      dependencies: {...packageJson.dependencies}
    };
    
    // Remove any development-only dependencies
    const devDependencies = [
      'nodemon', 'ts-node', 'typescript', 'vite', 'vitest', '@vitest',
      'eslint', '@eslint', 'prettier', '@prettier', 'concurrently',
      'cross-env', 'npm-run-all', 'rimraf'
    ];
    
    for (const dep of devDependencies) {
      Object.keys(prodPackage.dependencies).forEach(key => {
        if (key.startsWith(dep)) {
          delete prodPackage.dependencies[key];
        }
      });
    }
    
    // Create production directory if it doesn't exist
    const productionDir = path.join(__dirname, 'production-build');
    ensureDirectoryExists(productionDir);
    
    // Write the production package.json
    fs.writeFileSync(
      path.join(productionDir, 'package.json'),
      JSON.stringify(prodPackage, null, 2),
      'utf8'
    );
    
    console.log(`${colors.green}Created production package.json${colors.reset}`);
    return productionDir;
  } catch (error) {
    console.error(`${colors.red}Error creating production package.json:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Function to copy necessary files for production
function copyProductionFiles(productionDir) {
  console.log(`${colors.cyan}Copying necessary files for production...${colors.reset}`);
  
  const filesToCopy = [
    'client',
    'server',
    'shared',
    'public',
    'dist',
    '.env.production',
    'tsconfig.json'
  ];
  
  // Create necessary subdirectories
  ensureDirectoryExists(path.join(productionDir, 'client'));
  ensureDirectoryExists(path.join(productionDir, 'server'));
  ensureDirectoryExists(path.join(productionDir, 'shared'));
  ensureDirectoryExists(path.join(productionDir, 'public'));
  
  // Copy files recursively
  filesToCopy.forEach(filePath => {
    try {
      if (fs.existsSync(path.join(__dirname, filePath))) {
        if (fs.statSync(path.join(__dirname, filePath)).isDirectory()) {
          // Create the directory structure
          ensureDirectoryExists(path.join(productionDir, filePath));
          
          // Use the cp command with the -r flag for recursive copying
          execSync(`cp -r "${path.join(__dirname, filePath)}"/* "${path.join(productionDir, filePath)}"`, {
            stdio: 'ignore'
          });
        } else {
          // For files, use simple fs.copyFileSync
          fs.copyFileSync(
            path.join(__dirname, filePath),
            path.join(productionDir, filePath)
          );
        }
        console.log(`${colors.green}Copied: ${filePath}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Warning: ${filePath} does not exist, skipping${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error copying ${filePath}:${colors.reset}`, error.message);
    }
  });
  
  // Create .env file for production if it doesn't exist
  if (!fs.existsSync(path.join(productionDir, '.env'))) {
    if (fs.existsSync(path.join(__dirname, '.env.production'))) {
      fs.copyFileSync(
        path.join(__dirname, '.env.production'),
        path.join(productionDir, '.env')
      );
      console.log(`${colors.green}Created .env from .env.production${colors.reset}`);
    } else {
      fs.writeFileSync(
        path.join(productionDir, '.env'),
        'NODE_ENV=production\n',
        'utf8'
      );
      console.log(`${colors.green}Created default .env file${colors.reset}`);
    }
  }
}

// Function to calculate the final production size
function calculateProductionSize(productionDir) {
  try {
    // Use du command to get the size
    const output = execSync(`du -sh "${productionDir}"`, { encoding: 'utf8' });
    const size = output.trim().split('\t')[0];
    return size;
  } catch (error) {
    return 'unknown';
  }
}

// Main function
async function prepareProductionBuild() {
  console.log(`\n${colors.brightBlue}PRODUCTION BUILD PREPARATION${colors.reset}\n`);
  
  // Create production-optimized package.json and get the production directory
  const productionDir = createProductionPackageJson();
  
  // Copy necessary files
  copyProductionFiles(productionDir);
  
  // Calculate production size
  const productionSize = calculateProductionSize(productionDir);
  
  // Print summary
  console.log('\n===============================================');
  console.log(`${colors.brightGreen}PRODUCTION BUILD SUMMARY${colors.reset}`);
  console.log('===============================================');
  console.log(`${colors.cyan}Production build directory:${colors.reset} ${productionDir}`);
  console.log(`${colors.cyan}Production build size:${colors.reset} ${productionSize}`);
  console.log('\nTo finalize the production build:');
  console.log(`  ${colors.green}cd ${productionDir}${colors.reset}`);
  console.log(`  ${colors.green}npm ci --production${colors.reset}`);
  console.log(`  ${colors.green}npm start${colors.reset}`);
  console.log('\n');
}

// Run the script
prepareProductionBuild().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
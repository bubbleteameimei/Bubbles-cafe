/**
 * Dependency Optimization Script
 * 
 * This script analyzes the project dependencies and creates a production-optimized
 * package.json file that can be used for deployment.
 * 
 * Features:
 * 1. Identifies potentially unused dependencies
 * 2. Creates a production-only package.json for deployment
 * 3. Provides instructions for pruning and optimizing dependencies
 * 4. Safe mode - doesn't modify any existing files directly
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m'
};

// Function to format file sizes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Read the package.json file
function readPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    return packageJson;
  } catch (error) {
    console.error(`${colors.red}Error reading package.json:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Get the size of node_modules
function getNodeModulesSize() {
  try {
    // Use du command to get the size of node_modules directory
    const output = execSync('du -s -h node_modules', { encoding: 'utf8' });
    const size = output.trim().split('\t')[0];
    return size;
  } catch (error) {
    return 'unknown';
  }
}

// Find potentially unused dependencies by analyzing import statements
function findUnusedDependencies(dependencies) {
  console.log(`${colors.cyan}Analyzing source code for unused dependencies...${colors.reset}`);
  
  const usedDependencies = new Set();
  const directories = ['client', 'server', 'shared'];
  
  // Search for import statements in JS/TS files
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    const files = findFiles(dir, ['.js', '.jsx', '.ts', '.tsx']);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for import statements
      const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^./][^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // Extract the package name (e.g., 'lodash/map' -> 'lodash')
        const packageName = importPath.split('/')[0];
        usedDependencies.add(packageName);
      }
      
      // Check for require statements
      const requireRegex = /require\s*\(\s*['"]([^./][^'"]+)['"]\s*\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        const importPath = match[1];
        const packageName = importPath.split('/')[0];
        usedDependencies.add(packageName);
      }
    });
  });
  
  // Find dependencies that are not imported in the code
  const potentiallyUnused = [];
  
  for (const dep in dependencies) {
    if (!usedDependencies.has(dep) && 
        !dep.startsWith('@types/') && // Ignore type definitions
        dep !== 'typescript') {  // Ignore typescript
      potentiallyUnused.push(dep);
    }
  }
  
  return potentiallyUnused;
}

// Find files with specific extensions in a directory (recursive)
function findFiles(directory, extensions) {
  let results = [];
  
  if (!fs.existsSync(directory)) return results;
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
      results = results.concat(findFiles(filePath, extensions));
    } else if (stat.isFile() && extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Create a production-optimized package.json
function createProductionPackageJson(packageJson, potentiallyUnused) {
  const prodPackageJson = { ...packageJson };
  
  // Move devDependencies into a backup field
  if (!prodPackageJson._devDependencies && prodPackageJson.devDependencies) {
    prodPackageJson._devDependencies = { ...prodPackageJson.devDependencies };
    delete prodPackageJson.devDependencies;
  }
  
  // Save the production package.json
  const outputPath = path.join(__dirname, 'package.production.json');
  fs.writeFileSync(outputPath, JSON.stringify(prodPackageJson, null, 2), 'utf8');
  
  console.log(`${colors.green}Production package.json created at:${colors.reset} package.production.json`);
  
  return outputPath;
}

// Generate deployment instructions
function generateDeploymentInstructions(outputPath, potentiallyUnused) {
  console.log('\n===============================================');
  console.log(`${colors.brightYellow}DEPENDENCY OPTIMIZATION INSTRUCTIONS${colors.reset}`);
  console.log('===============================================\n');
  
  console.log(`${colors.cyan}Current node_modules size:${colors.reset} ${getNodeModulesSize()}`);
  
  console.log(`\n${colors.cyan}Step 1:${colors.reset} For deployment, use the following commands:`);
  console.log(`  ${colors.green}cp package.json package.backup.json${colors.reset}`);
  console.log(`  ${colors.green}cp package.production.json package.json${colors.reset}`);
  console.log(`  ${colors.green}npm ci --production${colors.reset}`);
  
  if (potentiallyUnused.length > 0) {
    console.log(`\n${colors.yellow}Potentially unused dependencies (${potentiallyUnused.length}):${colors.reset}`);
    potentiallyUnused.forEach(dep => {
      console.log(`  - ${dep}`);
    });
    console.log(`\n${colors.cyan}Step 2 (Optional):${colors.reset} Verify and remove unused dependencies`);
    console.log(`  ${colors.green}npm uninstall ${potentiallyUnused.join(' ')}${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Step 3:${colors.reset} After deployment, restore your development environment:`);
  console.log(`  ${colors.green}cp package.backup.json package.json${colors.reset}`);
  console.log(`  ${colors.green}npm ci${colors.reset}`);
  
  console.log(`\n${colors.cyan}Additional optimizations:${colors.reset}`);
  console.log(`  • Use dynamic imports for code splitting`);
  console.log(`  • Implement proper tree-shaking in your bundler`);
  console.log(`  • Consider using smaller alternatives for large packages`);
  
  console.log('\n===============================================');
  console.log(`${colors.brightGreen}SAFETY NOTICE${colors.reset}`);
  console.log('===============================================');
  console.log(`This script doesn't modify your existing package.json.`);
  console.log(`It creates a separate production file for deployment use.`);
  console.log(`Always verify that your application works correctly after`);
  console.log(`any dependency changes.\n`);
}

// Main function
async function optimizeDependencies() {
  console.log(`\n${colors.brightBlue}DEPENDENCY OPTIMIZATION TOOL${colors.reset}\n`);
  
  // Read the package.json file
  const packageJson = readPackageJson();
  
  // Analyze dependencies
  const potentiallyUnused = findUnusedDependencies(packageJson.dependencies || {});
  
  // Create production package.json
  const outputPath = createProductionPackageJson(packageJson, potentiallyUnused);
  
  // Generate deployment instructions
  generateDeploymentInstructions(outputPath, potentiallyUnused);
}

// Run the script
optimizeDependencies().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
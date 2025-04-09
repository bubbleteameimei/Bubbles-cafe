/**
 * Dependency Optimization Script
 * 
 * This script analyzes and optimizes the project dependencies by:
 * 1. Identifying unnecessarily large packages
 * 2. Finding potentially unused dependencies
 * 3. Suggesting optimizations for reducing node_modules size
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Size display helper
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Read package.json
function readPackageJson() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading package.json:', error.message);
    return {};
  }
}

// Get size of node_modules directory or specific package
function getPackageSize(packageName = null) {
  let targetPath;
  
  if (packageName) {
    targetPath = path.join(__dirname, 'node_modules', packageName);
  } else {
    targetPath = path.join(__dirname, 'node_modules');
  }
  
  if (!fs.existsSync(targetPath)) return 0;
  
  try {
    const output = execSync(`du -sb "${targetPath}" 2>/dev/null || echo 0`).toString();
    const size = parseInt(output.split(/\s+/)[0], 10);
    return isNaN(size) ? 0 : size;
  } catch (error) {
    return 0;
  }
}

// Get packages ordered by size
function getPackagesBySize() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    return [];
  }
  
  try {
    const packages = fs.readdirSync(nodeModulesPath)
      .filter(pkg => !pkg.startsWith('.'))
      .map(pkg => {
        const size = getPackageSize(pkg);
        return { name: pkg, size };
      })
      .sort((a, b) => b.size - a.size);
    
    return packages;
  } catch (error) {
    console.error('Error getting package sizes:', error.message);
    return [];
  }
}

// Find potential optimizations
function findOptimizations() {
  // Find large packages that have lighter alternatives
  const packagesBySize = getPackagesBySize();
  const packageJson = readPackageJson();
  
  // All dependencies
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  
  // Check for large packages
  const largePackages = packagesBySize.slice(0, 20); // Top 20 largest packages
  
  // Check for duplicate packages with different versions
  const packagesByName = {};
  packagesBySize.forEach(pkg => {
    const baseName = pkg.name.split('@')[0];
    if (!packagesByName[baseName]) {
      packagesByName[baseName] = [];
    }
    packagesByName[baseName].push(pkg);
  });
  
  // Find packages with multiple versions
  const duplicatePackages = Object.entries(packagesByName)
    .filter(([_, versions]) => versions.length > 1)
    .map(([name, versions]) => ({
      name,
      versions: versions.map(v => v.name),
      totalSize: versions.reduce((sum, v) => sum + v.size, 0)
    }))
    .sort((a, b) => b.totalSize - a.totalSize);
  
  return {
    largePackages,
    duplicatePackages
  };
}

// Main function
async function main() {
  console.log('==== Dependency Optimization Analysis ====');
  
  // Get node_modules size
  const nodeModulesSize = getPackageSize();
  console.log(`node_modules size: ${formatBytes(nodeModulesSize)}`);
  
  // Find optimizations
  const { largePackages, duplicatePackages } = findOptimizations();
  
  // Report largest packages
  console.log('\n==== Largest Packages ====');
  largePackages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.name}: ${formatBytes(pkg.size)}`);
  });
  
  // Report duplicate packages
  if (duplicatePackages.length > 0) {
    console.log('\n==== Duplicate Packages ====');
    duplicatePackages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name} (${formatBytes(pkg.totalSize)})`);
      pkg.versions.forEach(v => console.log(`   - ${v}`));
    });
  }
  
  // Recommendations
  console.log('\n==== Optimization Recommendations ====');
  console.log('1. Remove duplicate packages by running: npm dedupe');
  console.log('2. Install only production dependencies for deployment:');
  console.log('   npm install --production');
  console.log('3. Consider alternatives for large packages:');
  for (const pkg of largePackages.slice(0, 5)) {
    console.log(`   - ${pkg.name} (${formatBytes(pkg.size)})`);
  }
  console.log('\n4. Run development and production builds separately:');
  console.log('   - Keep development dependencies in devDependencies');
  console.log('   - Use npm prune --production before deployment');
}

main().catch(console.error);
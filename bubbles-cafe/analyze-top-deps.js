/**
 * Quick Dependency Size Analyzer
 * 
 * This script quickly analyzes the top 20 largest direct dependencies
 * in node_modules without scanning the entire directory structure.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
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

// Main function
async function main() {
  console.log('==== Quick Node Modules Size Analysis ====');
  
  // Get list of top-level folders in node_modules
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  // Make sure node_modules exists
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('node_modules directory not found');
    return;
  }
  
  // Get top-level directories in node_modules
  const topLevelDirs = fs.readdirSync(nodeModulesPath, { withFileTypes: true })
    .filter(item => item.isDirectory() && !item.name.startsWith('.') && !item.name.startsWith('@'));
  
  // Get folder sizes
  const folderSizes = topLevelDirs.map(dir => {
    const dirPath = path.join(nodeModulesPath, dir.name);
    const output = execSync(`du -sb "${dirPath}" 2>/dev/null || echo 0`).toString();
    const size = parseInt(output.split(/\s+/)[0], 10);
    return { name: dir.name, size: isNaN(size) ? 0 : size };
  }).sort((a, b) => b.size - a.size);
  
  // Print top 20 largest dependencies
  console.log('\nTop 20 Largest Dependencies:');
  folderSizes.slice(0, 20).forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}: ${formatBytes(item.size)}`);
  });
  
  // Check for scoped packages
  const scopedPackagesPath = path.join(nodeModulesPath, '@');
  if (fs.existsSync(scopedPackagesPath)) {
    console.log('\nLarge Scoped Packages:');
    
    // Get all scopes
    const scopes = fs.readdirSync(scopedPackagesPath, { withFileTypes: true })
      .filter(item => item.isDirectory());
    
    // For each scope, get large packages
    for (const scope of scopes) {
      const scopePath = path.join(scopedPackagesPath, scope.name);
      
      // Get packages in this scope
      const packages = fs.readdirSync(scopePath, { withFileTypes: true })
        .filter(item => item.isDirectory());
      
      // Get sizes for packages in this scope
      const packageSizes = packages.map(pkg => {
        const pkgPath = path.join(scopePath, pkg.name);
        const output = execSync(`du -sb "${pkgPath}" 2>/dev/null || echo 0`).toString();
        const size = parseInt(output.split(/\s+/)[0], 10);
        return { name: `@${scope.name}/${pkg.name}`, size: isNaN(size) ? 0 : size };
      }).sort((a, b) => b.size - a.size);
      
      // Print top 5 largest packages in this scope
      packageSizes.slice(0, 5).forEach(item => {
        if (item.size > 1024 * 1024) { // Only show packages larger than 1MB
          console.log(`- ${item.name}: ${formatBytes(item.size)}`);
        }
      });
    }
  }
  
  // Print optimization recommendations
  console.log('\nOptimization Recommendations:');
  console.log('1. Consider using npm dedupe to resolve duplicate dependencies');
  console.log('2. For production, use npm prune --production to remove dev dependencies');
  console.log('3. Consider removing or replacing large dependencies');
}

main().catch(console.error);
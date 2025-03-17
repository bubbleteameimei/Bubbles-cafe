/**
 * Toggle Standardization Verification Script
 * 
 * This script checks that all toggle switches in the application match the "Remember me" toggle design.
 * It runs through all files containing the Switch component and verifies no "size" property is being used.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Directories to search
const dirsToSearch = [
  './client/src/components',
  './client/src/pages',
];

// File extensions to check
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];

// Find all files with specified extensions in the given directories
function findFiles(directories, extensions) {
  let allFiles = [];
  
  for (const dir of directories) {
    try {
      const result = execSync(`find ${dir} -type f -name "*.[tj]s*"`, { encoding: 'utf8' });
      const files = result.split('\n').filter(Boolean);
      allFiles = [...allFiles, ...files];
    } catch (error) {
      console.error(`Error searching directory ${dir}:`, error.message);
    }
  }
  
  return allFiles.filter(file => extensions.some(ext => file.endsWith(ext)));
}

// Check if a file imports the Switch component
function importsSwitch(content) {
  return content.includes('import') && 
         content.includes('Switch') && 
         content.includes('@/components/ui/switch');
}

// Check if a file uses the size property with Switch component
function usesSizeProperty(content) {
  // Regular expression to find size property in Switch component
  const sizePropertyRegex = /<Switch[^>]*size=["'][^"']*["'][^>]*>/g;
  return sizePropertyRegex.test(content);
}

// Main function to check all files
function checkToggleStandardization() {
  console.log('Checking toggle switch standardization...');
  
  // Find all relevant files
  const files = findFiles(dirsToSearch, fileExtensions);
  console.log(`Found ${files.length} files to check`);
  
  let violations = [];
  
  // Check each file
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Only check files that import the Switch component
      if (importsSwitch(content)) {
        if (usesSizeProperty(content)) {
          violations.push(file);
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  }
  
  // Report results
  if (violations.length === 0) {
    console.log('✅ All toggle switches are properly standardized!');
  } else {
    console.log('❌ Found toggle switches that still use the size property:');
    violations.forEach(file => console.log(`- ${file}`));
  }
  
  return violations.length === 0;
}

// Run the check
checkToggleStandardization();
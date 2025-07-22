/**
 * Toggle Standardization Verification Script
 * 
 * This script checks that all toggle switches in the application match the "Remember me" toggle design.
 * It runs through all files containing the Switch component and verifies no "size" property is being used.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files/directories to check
const directories = ['client/src'];

// File extensions to check
const extensions = ['.tsx', '.jsx', '.ts', '.js'];

// Files to exclude
const excludeFiles = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.cache'
];

// Find all files in the provided directories with the specified extensions
function findFiles(directories, extensions) {
  const files = [];

  for (const dir of directories) {
    try {
      const dirPath = path.resolve(dir);
      
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        // Skip excluded directories and files
        if (excludeFiles.some(exclude => itemPath.includes(exclude))) {
          continue;
        }
        
        if (item.isDirectory()) {
          // Recursively search subdirectories
          files.push(...findFiles([itemPath], extensions));
        } else if (extensions.some(ext => item.name.endsWith(ext))) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      console.error(`Error accessing directory ${dir}:`, error.message);
    }
  }
  
  return files;
}

// Check if a file imports the Switch component
function importsSwitch(content) {
  return (
    (content.includes('import') && content.includes('Switch') && 
     content.includes('@/components/ui/switch')) ||
    (content.includes('import') && content.includes('Switch') && 
     content.includes('./switch'))
  );
}

// Check if a file uses the "size" property on the Switch component
function usesSizeProperty(content) {
  // Look for Switch component with size property
  const sizePropertyMatches = content.match(/<Switch[^>]*size=["'][^"']*["'][^>]*>/g);
  const bgPropertyMatches = content.match(/<Switch[^>]*className=["'][^"']*bg-primary[^"']*["'][^>]*>/g);
  
  return {
    hasSizeProperty: sizePropertyMatches !== null && sizePropertyMatches.length > 0,
    hasCustomBackground: bgPropertyMatches !== null && bgPropertyMatches.length > 0,
    sizeUsages: sizePropertyMatches || [],
    bgUsages: bgPropertyMatches || []
  };
}

// Main function to check toggle standardization
function checkToggleStandardization() {
  console.log("Checking toggle switch standardization...");
  
  const files = findFiles(directories, extensions);
  console.log(`Found ${files.length} files to check`);
  
  let filesWithSwitch = 0;
  let filesWithSizeProperty = 0;
  let filesWithCustomBackground = 0;
  const nonStandardFiles = [];
  
  // Check each file
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      if (importsSwitch(content)) {
        filesWithSwitch++;
        
        const { hasSizeProperty, hasCustomBackground, sizeUsages, bgUsages } = usesSizeProperty(content);
        
        if (hasSizeProperty) {
          filesWithSizeProperty++;
          nonStandardFiles.push({
            file,
            issue: 'Uses "size" property',
            examples: sizeUsages
          });
        }
        
        if (hasCustomBackground) {
          filesWithCustomBackground++;
          nonStandardFiles.push({
            file,
            issue: 'Uses custom background color',
            examples: bgUsages
          });
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error.message);
    }
  }
  
  // Generate report
  console.log("\n=== Toggle Standardization Report ===");
  console.log(`Total files checked: ${files.length}`);
  console.log(`Files using Switch component: ${filesWithSwitch}`);
  console.log(`Files with non-standard size property: ${filesWithSizeProperty}`);
  console.log(`Files with custom background classes: ${filesWithCustomBackground}`);
  
  if (nonStandardFiles.length > 0) {
    console.log("\nFiles needing standardization:");
    for (const item of nonStandardFiles) {
      console.log(`\n📁 ${item.file}`);
      console.log(`   Issue: ${item.issue}`);
      console.log("   Example:");
      for (const example of item.examples.slice(0, 1)) {
        console.log(`   ${example}`);
      }
    }
  } else {
    console.log("\n✅ All toggle switches follow the standard implementation!");
  }
}

// Run the check
checkToggleStandardization();
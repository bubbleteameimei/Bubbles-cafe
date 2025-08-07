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

// Directories & extensions to check
const directories = ['client/src'];
const extensions = ['.tsx', '.jsx', '.ts', '.js'];

// Directories we never want to crawl
const excludeDirs = new Set(['node_modules', 'dist', 'build', '.git', '.cache']);

/**
 * Recursively walk directories using async fs APIs so we don't block the event-loop.
 */
async function findFiles(dirs, exts) {
  const results = [];

  for (const dir of dirs) {
    let entries;
    try {
      entries = await fs.promises.readdir(path.resolve(dir), { withFileTypes: true });
    } catch (err) {
      console.error(`Error accessing directory ${dir}:`, err instanceof Error ? err.message : err);
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if ([...excludeDirs].some(ex => entryPath.includes(ex))) continue;

      if (entry.isDirectory()) {
        results.push(...await findFiles([entryPath], exts));
      } else if (exts.some(ext => entry.name.endsWith(ext))) {
        results.push(entryPath);
      }
    }
  }

  return results;
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
  // The /s flag makes . match across newlines so multi-line JSX is handled
  const sizePropertyMatches = content.match(/<Switch[^>]*?\s+size=["'][^"']+["'][^>]*?>/gis);
  const bgPropertyMatches   = content.match(/<Switch[^>]*?className=["'][^"']*bg-primary[^"']*["'][^>]*?>/gis);
  
  return {
    hasSizeProperty: sizePropertyMatches !== null && sizePropertyMatches.length > 0,
    hasCustomBackground: bgPropertyMatches !== null && bgPropertyMatches.length > 0,
    sizeUsages: sizePropertyMatches || [],
    bgUsages: bgPropertyMatches || []
  };
}

// Main function to check toggle standardization
async function checkToggleStandardization() {
  console.log("Checking toggle switch standardization...");
  
  const files = await findFiles(directories, extensions);
  console.log(`Found ${files.length} files to check`);
  
  let filesWithSwitch = 0;
  let filesWithSizeProperty = 0;
  let filesWithCustomBackground = 0;
  const nonStandardFiles = [];
  
  // Check each file
  for (const file of files) {
    try {
      const content = await fs.promises.readFile(file, 'utf8');
      
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
    // Non-zero exit so CI fails
    process.exitCode = 1;
  } else {
    console.log("\n✅ All toggle switches follow the standard implementation!");
    process.exitCode = 0;
  }
}

// Run the check
checkToggleStandardization().catch(err => {
  console.error('Error during toggle verification:', err);
  process.exitCode = 1;
});
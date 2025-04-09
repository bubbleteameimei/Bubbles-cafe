/**
 * Test File Organization Script
 * 
 * This script organizes all test files scattered at the root level into a structured test directory.
 * It helps reduce clutter in the root directory while preserving test functionality.
 * 
 * Usage:
 *   node organize-tests.js         # Organize all test files
 *   node organize-tests.js --dry   # Show what would be moved without making changes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TEST_FILE_PATTERNS = [
  /^check-.*\.js$/,
  /^check_.*\.js$/,
  /^capture-.*\.js$/,
  /^screenshot.*\.js$/,
  /^test-.*\.js$/,
  /^verify-.*\.js$/,
];

const TEST_DIRECTORY = path.join(__dirname, 'tests');
const TEST_SUBDIRECTORIES = {
  'ui': ['screenshot', 'capture'],
  'functional': ['check', 'verify'],
  'integration': ['test'],
  'utils': ['utils'],
};

// Command line args
const isDryRun = process.argv.includes('--dry');

// Size display helper
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to determine which category a file belongs to
function getCategoryForFile(filename) {
  const lowercaseFilename = filename.toLowerCase();
  
  for (const [category, prefixes] of Object.entries(TEST_SUBDIRECTORIES)) {
    for (const prefix of prefixes) {
      if (lowercaseFilename.includes(prefix)) {
        return category;
      }
    }
  }
  
  return 'misc'; // Default category
}

// Main function
async function organizeTestFiles() {
  console.log(`==== Test File Organization ${isDryRun ? '(DRY RUN)' : ''} ====`);
  
  // Create test directory structure
  if (!isDryRun) {
    if (!fs.existsSync(TEST_DIRECTORY)) {
      fs.mkdirSync(TEST_DIRECTORY);
    }
    
    for (const dir of [...Object.keys(TEST_SUBDIRECTORIES), 'misc']) {
      const subDir = path.join(TEST_DIRECTORY, dir);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir);
      }
    }
  }
  
  // Get all files in the root directory
  const rootFiles = fs.readdirSync(__dirname)
    .filter(file => {
      const isFile = fs.statSync(path.join(__dirname, file)).isFile();
      const isTestFile = TEST_FILE_PATTERNS.some(pattern => pattern.test(file));
      return isFile && isTestFile;
    });
  
  // Organize by category
  const filesByCategory = {};
  let totalFiles = 0;
  let totalSize = 0;
  
  for (const file of rootFiles) {
    const filePath = path.join(__dirname, file);
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    const category = getCategoryForFile(file);
    
    if (!filesByCategory[category]) {
      filesByCategory[category] = [];
    }
    
    filesByCategory[category].push({ name: file, size: fileSize });
    totalFiles++;
    totalSize += fileSize;
  }
  
  // Move files if not a dry run
  if (!isDryRun) {
    for (const [category, files] of Object.entries(filesByCategory)) {
      const targetDir = path.join(TEST_DIRECTORY, category);
      
      for (const file of files) {
        const source = path.join(__dirname, file.name);
        const target = path.join(targetDir, file.name);
        
        fs.copyFileSync(source, target);
        fs.unlinkSync(source);
        
        console.log(`Moved: ${file.name} -> tests/${category}/ (${formatBytes(file.size)})`);
      }
    }
  } else {
    // Just display what would happen in a dry run
    for (const [category, files] of Object.entries(filesByCategory)) {
      console.log(`\n==== Category: ${category} ====`);
      
      for (const file of files) {
        console.log(`Would move: ${file.name} -> tests/${category}/ (${formatBytes(file.size)})`);
      }
    }
  }
  
  // Summary
  console.log(`\n==== Organization Summary ====`);
  console.log(`Total files: ${totalFiles}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  
  // Create an index.js file with imports for each category
  if (!isDryRun) {
    for (const category of Object.keys(filesByCategory)) {
      const indexPath = path.join(TEST_DIRECTORY, category, 'index.js');
      let indexContent = '/**\n';
      indexContent += ` * Test Index for ${category}\n`;
      indexContent += ' */\n\n';
      
      for (const file of filesByCategory[category]) {
        const importName = file.name
          .replace(/\.js$/, '')
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^[a-z]/, letter => letter.toUpperCase());
        
        indexContent += `import ${importName} from './${file.name}';\n`;
      }
      
      indexContent += '\nexport {\n';
      
      for (const file of filesByCategory[category]) {
        const importName = file.name
          .replace(/\.js$/, '')
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^[a-z]/, letter => letter.toUpperCase());
        
        indexContent += `  ${importName},\n`;
      }
      
      indexContent += '};\n';
      
      fs.writeFileSync(indexPath, indexContent);
      console.log(`Created index file: tests/${category}/index.js`);
    }
  }
  
  return { totalFiles, totalSize };
}

// Run the script
organizeTestFiles().catch(console.error);
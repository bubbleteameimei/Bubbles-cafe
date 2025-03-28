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
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if dry run mode is enabled
const isDryRun = process.argv.includes('--dry');
console.log(isDryRun ? '🔍 DRY RUN MODE (No files will be modified)' : '⚠️ LIVE MODE (Files will be moved)');

// Function to format bytes to human-readable form
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Organize test files into categories
function getCategoryForFile(filename) {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('screenshot') || lowerName.includes('capture')) {
    return 'visual';
  } else if (lowerName.includes('comment')) {
    return 'comments';
  } else if (lowerName.includes('reader') || lowerName.includes('tooltip')) {
    return 'reader';
  } else if (lowerName.includes('admin') || lowerName.includes('auth')) {
    return 'admin';
  } else if (lowerName.includes('wordpress') || lowerName.includes('wp-api')) {
    return 'wordpress';
  } else if (lowerName.includes('feedback')) {
    return 'feedback';
  } else if (lowerName.includes('csrf') || lowerName.includes('security')) {
    return 'security';
  } else if (lowerName.includes('excerpt')) {
    return 'content';
  } else {
    return 'general';
  }
}

// Main function to organize test files
async function organizeTestFiles() {
  console.log('\n🚀 Starting test file organization...');
  
  try {
    // Find test files that aren't part of regular test structure but were created for one-off testing
    const { stdout: testFiles } = await execAsync('find . -maxdepth 1 -type f \\( -name "test-*.js" -o -name "*-test.js" -o -name "*-test.html" -o -name "check-*.js" -o -name "simple-*.js" -o -name "*-screenshot.js" \\) | grep -v "node_modules" 2>/dev/null || echo ""');
    const oneOffTestList = testFiles.trim().split('\n').filter(file => file);
    
    if (oneOffTestList.length === 0) {
      console.log('No test files found at root level.');
      return;
    }
    
    console.log(`Found ${oneOffTestList.length} test files to organize.`);
    
    // Create tests directory and category subdirectories
    if (!isDryRun) {
      if (!fs.existsSync('./tests')) {
        console.log('Creating tests directory structure...');
        fs.mkdirSync('./tests', { recursive: true });
        fs.mkdirSync('./tests/visual', { recursive: true });
        fs.mkdirSync('./tests/comments', { recursive: true });
        fs.mkdirSync('./tests/reader', { recursive: true });
        fs.mkdirSync('./tests/admin', { recursive: true });
        fs.mkdirSync('./tests/wordpress', { recursive: true });
        fs.mkdirSync('./tests/feedback', { recursive: true });
        fs.mkdirSync('./tests/security', { recursive: true });
        fs.mkdirSync('./tests/content', { recursive: true });
        fs.mkdirSync('./tests/general', { recursive: true });
        
        // Create README file explaining the test directory structure
        const readmeContent = `# Test Directory

This directory contains organized test files for the project.

## Organization

Tests are organized into the following categories:

- **admin/** - Tests for admin panel, authentication, and user management
- **comments/** - Tests for the comment system functionality
- **content/** - Tests for content handling, excerpts, and text processing
- **feedback/** - Tests for the user feedback system
- **general/** - General tests that don't fit other categories
- **reader/** - Tests for the reader experience, reading modes, and related features
- **security/** - Tests for CSRF protection, authentication security, and related features
- **visual/** - Screenshot tests and visual verification tests
- **wordpress/** - Tests for WordPress API integration and related functionality

## Running Tests

Most tests can be run using:

\`\`\`
node tests/[category]/[test-file].js
\`\`\`

HTML test files can be opened in the browser directly.

## Test Migration

These tests were automatically migrated from the project root to reduce clutter
while preserving test functionality.
`;

        fs.writeFileSync('./tests/README.md', readmeContent);
      }
    }
    
    // Track files by category for summary
    const categoryCounts = {
      visual: 0,
      comments: 0,
      reader: 0,
      admin: 0,
      wordpress: 0,
      feedback: 0,
      security: 0,
      content: 0,
      general: 0
    };
    
    // Move files into appropriate subdirectories
    for (const filePath of oneOffTestList) {
      try {
        const fileName = path.basename(filePath);
        const category = getCategoryForFile(fileName);
        const targetDir = `./tests/${category}`;
        const targetPath = path.join(targetDir, fileName);
        
        categoryCounts[category]++;
        
        console.log(`${isDryRun ? 'Would move' : 'Moving'} "${filePath}" to "${targetPath}"`);
        
        if (!isDryRun) {
          fs.copyFileSync(filePath, targetPath);
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
      }
    }
    
    // Print summary
    console.log('\n--- 📊 ORGANIZATION SUMMARY ---');
    console.log('Files organized by category:');
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > 0) {
        console.log(`- ${category}: ${count} files`);
      }
    }
    
    if (isDryRun) {
      console.log(`\n🔍 DRY RUN COMPLETE! No files were moved.`);
      console.log(`To perform the actual organization, run: node organize-tests.js`);
    } else {
      console.log(`\n✅ ORGANIZATION COMPLETE!`);
      console.log(`Tests have been organized into the ./tests directory with appropriate categorization.`);
    }
  } catch (error) {
    console.error('Error organizing test files:', error);
  }
}

// Run the organization
organizeTestFiles();
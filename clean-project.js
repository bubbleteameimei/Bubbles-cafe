/**
 * Project Optimization Script
 * 
 * This script combines all optimization strategies to reduce the overall project size:
 * 1. Removes duplicate image files
 * 2. Removes duplicate audio files
 * 3. Manages large log files
 * 4. Cleans up backup directories
 * 5. Removes temporary and backup files
 * 6. Identifies old test files for potential organization
 * 7. Analyzes disk space usage and provides recommendations
 * 8. Provides detailed reporting on space savings
 * 
 * Usage:
 *   node clean-project.js         # Run optimization
 *   node clean-project.js --dry   # Show what would be removed without making changes
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if dry run mode is enabled
const isDryRun = process.argv.includes('--dry');
console.log(isDryRun ? '🔍 DRY RUN MODE (No files will be modified)' : '⚠️ LIVE MODE (Files will be modified)');

// Function to format bytes to human-readable form
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Function to run all optimizations
async function optimizeProject() {
  console.log('\n🚀 Starting project optimization...');
  
  try {
    // Get initial project size for comparison
    const { stdout: beforeSize } = await execAsync('du -sb .');
    const initialBytes = parseInt(beforeSize.trim().split('\t')[0]);
    console.log(`📊 Initial project size: ${formatBytes(initialBytes)}`);
  } catch (error) {
    console.error('Error calculating initial project size:', error);
  }
  
  // Track space savings
  let totalBytesSaved = 0;
  
  // 1. Identify duplicate images
  console.log('\n--- 📷 OPTIMIZING IMAGES ---');
  try {
    // Find duplicate images
    const duplicateImages = [
      './client/public/assets/IMG_4918.jpeg',
      './client/public/attached_assets/IMG_4918.jpeg', 
      './client/public/IMG_4918.jpeg',
      './client/public/img/IMG_4918.jpeg'
    ];
    
    const mainImagePath = './client/public/attached_assets/IMG_4918.jpeg';
    let imageBytesSaved = 0;
    
    for (const imagePath of duplicateImages) {
      if (imagePath !== mainImagePath && fs.existsSync(imagePath)) {
        const stats = fs.statSync(imagePath);
        imageBytesSaved += stats.size;
        
        console.log(`Found duplicate: ${imagePath} (${formatBytes(stats.size)})`);
        
        if (!isDryRun) {
          console.log(`Removing duplicate: ${imagePath}`);
          fs.unlinkSync(imagePath);
        }
      }
    }
    
    totalBytesSaved += imageBytesSaved;
    console.log(`Image optimization ${isDryRun ? 'would save' : 'saved'}: ${formatBytes(imageBytesSaved)}`);
  } catch (error) {
    console.error('Error during image optimization:', error);
  }
  
  // 2. Identify duplicate audio files
  console.log('\n--- 🔊 OPTIMIZING AUDIO ---');
  try {
    // Find duplicate audio files
    const duplicateAudio = [
      './client/public/assets/ambient.mp3',
      './server/public/audio/ambient.mp3',
      './dist/public/assets/ambient.mp3'
    ];
    
    const mainAudioPath = './server/public/audio/ambient.mp3';
    let audioBytesSaved = 0;
    
    for (const audioPath of duplicateAudio) {
      if (audioPath !== mainAudioPath && fs.existsSync(audioPath)) {
        const stats = fs.statSync(audioPath);
        audioBytesSaved += stats.size;
        
        console.log(`Found duplicate: ${audioPath} (${formatBytes(stats.size)})`);
        
        if (!isDryRun) {
          console.log(`Removing duplicate: ${audioPath}`);
          fs.unlinkSync(audioPath);
        }
      }
    }
    
    totalBytesSaved += audioBytesSaved;
    console.log(`Audio optimization ${isDryRun ? 'would save' : 'saved'}: ${formatBytes(audioBytesSaved)}`);
  } catch (error) {
    console.error('Error during audio optimization:', error);
  }
  
  // 3. Identify large log files
  console.log('\n--- 📝 MANAGING LOG FILES ---');
  try {
    // Get large log files (>5MB)
    const logDirectories = [];
    
    // Only add directories that exist
    if (fs.existsSync('./logs/')) {
      logDirectories.push('./logs/');
    }
    if (fs.existsSync('./logs-backup/')) {
      logDirectories.push('./logs-backup/');
    }
    
    const { stdout } = await execAsync('find ' + logDirectories.join(' ') + ' -type f -name "*.log" -size +5M');
    const largeLogFiles = stdout.trim().split('\n').filter(file => file);
    
    let logBytesSaved = 0;
    
    if (largeLogFiles.length === 0) {
      console.log('No large log files found.');
    } else {
      console.log(`Found ${largeLogFiles.length} large log files:`);
      
      for (const logFile of largeLogFiles) {
        if (!logFile) continue;
        
        // Get file info
        const stats = fs.statSync(logFile);
        const beforeSize = stats.size;
        console.log(`Large log file: ${logFile} (${formatBytes(beforeSize)})`);
        
        if (!isDryRun) {
          // For debug.log, trim to last 1000 lines (keeping recent logs)
          if (path.basename(logFile) === 'debug.log') {
            const tempFile = `${logFile}.temp`;
            await execAsync(`tail -n 1000 "${logFile}" > "${tempFile}"`);
            await execAsync(`mv "${tempFile}" "${logFile}"`);
            
            const afterStats = fs.statSync(logFile);
            const savedBytes = beforeSize - afterStats.size;
            logBytesSaved += savedBytes;
            
            console.log(`Trimmed ${logFile} to last 1000 lines, saved ${formatBytes(savedBytes)}`);
          } else {
            // For other large logs, compress them
            await execAsync(`gzip -9 "${logFile}"`);
            
            if (fs.existsSync(`${logFile}.gz`)) {
              const compressedStats = fs.statSync(`${logFile}.gz`);
              const savedBytes = beforeSize - compressedStats.size;
              logBytesSaved += savedBytes;
              
              console.log(`Compressed ${logFile}, saved ${formatBytes(savedBytes)}`);
            }
          }
        } else {
          // Estimate savings (typical compression ratio)
          const estimatedSavings = Math.floor(beforeSize * 0.8);
          logBytesSaved += estimatedSavings;
          console.log(`Would save approximately ${formatBytes(estimatedSavings)} by compressing/trimming`);
        }
      }
    }
    
    totalBytesSaved += logBytesSaved;
    console.log(`Log optimization ${isDryRun ? 'would save' : 'saved'}: ${formatBytes(logBytesSaved)}`);
  } catch (error) {
    console.error('Error during log management:', error);
  }
  
  // 4. Clean backup directories
  console.log('\n--- 📦 CLEANING BACKUP DIRECTORIES ---');
  try {
    // List all backup directories
    const { stdout: backupDirs } = await execAsync('find . -maxdepth 2 -type d \\( -name "backup*" -o -name "*-backup" -o -name "*_backup" \\) | grep -v "node_modules"');
    const directories = backupDirs.trim().split('\n').filter(dir => dir);
    
    let backupBytesSaved = 0;
    
    if (directories.length === 0) {
      console.log('No backup directories found.');
    } else {
      console.log(`Found ${directories.length} backup directories.`);
      
      for (const dir of directories) {
        // Keep the most recent backup only (backup-latest)
        if (dir === './backup-latest') {
          console.log(`Keeping most recent backup: ${dir}`);
          continue;
        }
        
        // Calculate size of backup directory
        const { stdout: sizeOutput } = await execAsync(`du -sb "${dir}"`);
        const dirSize = parseInt(sizeOutput.trim().split('\t')[0]);
        
        console.log(`Backup directory: ${dir} (${formatBytes(dirSize)})`);
        backupBytesSaved += dirSize;
        
        if (!isDryRun) {
          // Remove the backup directory
          console.log(`Removing backup directory: ${dir}`);
          await execAsync(`rm -rf "${dir}"`);
        }
      }
    }
    
    totalBytesSaved += backupBytesSaved;
    console.log(`Backup cleanup ${isDryRun ? 'would save' : 'saved'}: ${formatBytes(backupBytesSaved)}`);
  } catch (error) {
    console.error('Error during backup cleanup:', error);
  }
  
  // 5. Clean up temporary and backup files
  console.log('\n--- 🗑️ CLEANING TEMPORARY FILES ---');
  try {
    // Find all temporary and backup files
    // We need to use a different command since the previous one might fail if no files are found
    const { stdout: tempFiles } = await execAsync('find . \\( -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.bak" \\) -not -path "*/node_modules/*" -not -path "*/backup-latest/*" 2>/dev/null || echo ""');
    const fileList = tempFiles.trim().split('\n').filter(file => file);
    
    let tempBytesSaved = 0;
    
    if (fileList.length === 0) {
      console.log('No temporary or backup files found.');
    } else {
      console.log(`Found ${fileList.length} temporary/backup files:`);
      
      for (const filePath of fileList) {
        try {
          const stats = fs.statSync(filePath);
          console.log(`Temporary file: ${filePath} (${formatBytes(stats.size)})`);
          tempBytesSaved += stats.size;
          
          if (!isDryRun) {
            console.log(`Removing file: ${filePath}`);
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err);
        }
      }
    }
    
    totalBytesSaved += tempBytesSaved;
    console.log(`Temporary file cleanup ${isDryRun ? 'would save' : 'saved'}: ${formatBytes(tempBytesSaved)}`);
  } catch (error) {
    console.error('Error during temporary file cleanup:', error);
  }
  
  // 6. Clean up old test files (that are not part of automated tests)
  console.log('\n--- 🧪 CLEANING TEST FILES ---');
  try {
    // Find test files that aren't part of regular test structure but were created for one-off testing
    const { stdout: testFiles } = await execAsync('find . -maxdepth 1 -type f -name "test-*.js" -o -name "*-test.js" -o -name "*-test.html" -o -name "check-*.js" -o -name "simple-*.js" -o -name "*-screenshot.js" | grep -v "node_modules" 2>/dev/null || echo ""');
    const oneOffTestList = testFiles.trim().split('\n').filter(file => file);
    
    let testBytesSaved = 0;
    
    if (oneOffTestList.length === 0) {
      console.log('No old test files found.');
    } else {
      console.log(`Found ${oneOffTestList.length} old test files that could be moved to a test directory:`);
      
      for (const filePath of oneOffTestList) {
        try {
          const stats = fs.statSync(filePath);
          console.log(`Test file: ${filePath} (${formatBytes(stats.size)})`);
          
          // Don't delete test files by default, just report them
          if (!isDryRun && false) {  // Set to 'true' to enable deletion in live mode
            console.log(`Moving test file to tests/ directory: ${filePath}`);
            // Ensure tests directory exists
            if (!fs.existsSync('./tests')) {
              fs.mkdirSync('./tests', { recursive: true });
            }
            const filename = path.basename(filePath);
            fs.copyFileSync(filePath, `./tests/${filename}`);
            fs.unlinkSync(filePath);
            testBytesSaved += stats.size;
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err);
        }
      }
    }
    
    // We're not adding to totalBytesSaved since we're not actually removing these files
    console.log(`Note: Test files are not deleted automatically. Consider organizing them into a test directory.`);
  } catch (error) {
    console.error('Error during test file analysis:', error);
  }
  
  // 7. Calculate space savings and analyze disk usage
  console.log('\n--- 📊 OPTIMIZATION RESULTS ---');
  try {
    // Get project size after optimization
    const { stdout: afterSize } = await execAsync('du -sb .');
    const finalBytes = parseInt(afterSize.trim().split('\t')[0]);
    
    console.log(`Current project size: ${formatBytes(finalBytes)}`);
    console.log(`Total space ${isDryRun ? 'that would be saved' : 'saved'}: ${formatBytes(totalBytesSaved)}`);
    
    // Get breakdown of largest directories
    console.log('\n--- 📂 DISK SPACE BREAKDOWN ---');
    console.log('Analyzing largest directories...');
    
    // Find largest directories
    const { stdout: largestDirs } = await execAsync(`find . -maxdepth 1 -type d | grep -v "^\\.$" | xargs du -sh | sort -hr | head -10`);
    const dirBreakdown = largestDirs.split('\n').filter(dir => dir);
    
    console.log('Largest directories:');
    dirBreakdown.forEach(dir => {
      const [size, dirPath] = dir.trim().split('\t');
      const cleanPath = dirPath.replace('./', '');
      // Color code the output based on size (Green for small, Yellow for medium, Red for large)
      let colorStart = '';
      let colorEnd = '';
      
      // Use colorization only in live mode
      if (!isDryRun) {
        if (size.includes('G')) {
          colorStart = '\x1b[31m'; // Red for GB
          colorEnd = '\x1b[0m';
        } else if (size.includes('M') && parseInt(size) > 100) {
          colorStart = '\x1b[33m'; // Yellow for MB > 100
          colorEnd = '\x1b[0m';
        } else {
          colorStart = '\x1b[32m'; // Green for smaller sizes
          colorEnd = '\x1b[0m';
        }
      }
      
      console.log(`${colorStart}${size.padEnd(8)}${cleanPath}${colorEnd}`);
    });
    
    console.log('\nRecommendations:');
    console.log('- For node_modules: Use --production flag when deploying to eliminate dev dependencies');
    console.log('- For .git: Consider using a shallow clone or remove .git directory in production');
    console.log('- For build artifacts: Add build directories to .gitignore and clean before deployment');
    console.log('- For logs: Use a centralized logging service instead of file-based logging');
    
    if (isDryRun) {
      console.log(`\n🔍 DRY RUN COMPLETE! No files were modified.`);
      console.log(`To perform the actual cleanup, run: node clean-project.js`);
    } else {
      console.log(`\n✅ OPTIMIZATION COMPLETE!`);
    }
  } catch (error) {
    console.error('Error calculating project size:', error);
  }
}

// Run all optimizations
optimizeProject();
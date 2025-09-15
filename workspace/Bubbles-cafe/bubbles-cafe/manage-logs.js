/**
 * Log Management Script
 * 
 * This script compresses or trims large log files to reduce disk space usage.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define log directories to scan
const logDirectories = [
  './logs/',
  './logs-backup/'
];

// Function to handle log file management
async function manageLogFiles() {
  try {
    // Get large log files (>10MB)
    const { stdout } = await execAsync('find ' + logDirectories.join(' ') + ' -type f -name "*.log" -size +10M');
    const largeLogFiles = stdout.trim().split('\n').filter(file => file);
    
    if (largeLogFiles.length === 0) {
      console.log('No large log files found.');
      return;
    }
    
    console.log(`Found ${largeLogFiles.length} large log files:`);
    
    for (const logFile of largeLogFiles) {
      if (!logFile) continue;
      
      // Get file info
      const stats = fs.statSync(logFile);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`Processing ${logFile} (${sizeMB} MB)`);
      
      // For debug.log, trim to last 1000 lines (keeping recent logs)
      if (path.basename(logFile) === 'debug.log') {
        const tempFile = `${logFile}.temp`;
        await execAsync(`tail -n 1000 "${logFile}" > "${tempFile}"`);
        await execAsync(`mv "${tempFile}" "${logFile}"`);
        console.log(`Trimmed ${logFile} to last 1000 lines`);
      } else {
        // For other large logs, compress them
        await execAsync(`gzip -9 "${logFile}"`);
        console.log(`Compressed ${logFile} to ${logFile}.gz`);
      }
    }
    
    console.log('Log management complete!');
  } catch (error) {
    console.error('Error managing logs:', error);
  }
}

// Run log management
manageLogFiles();
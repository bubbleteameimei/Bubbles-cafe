/**
 * Database Restore Utility
 * 
 * This script restores a PostgreSQL database backup to a new database.
 * Useful for restoring a Replit database backup to Render.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import readline from 'readline';

const execPromise = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise-based readline question
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function restoreBackup() {
  console.log('Database Restore Utility');
  console.log('------------------------');
  console.log('This utility helps you restore a database backup to a new database.');
  console.log('It is useful for migrating your database from Replit to Render.\n');

  try {
    // Get backup file path
    let backupFilePath = await question('Enter path to backup file (default: ./backup.sql): ');
    backupFilePath = backupFilePath || './backup.sql';
    
    // Make path absolute if it's relative
    if (!path.isAbsolute(backupFilePath)) {
      backupFilePath = path.resolve(projectRoot, backupFilePath);
    }
    
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error(`Error: Backup file not found at ${backupFilePath}`);
      process.exit(1);
    }
    
    const fileExtension = path.extname(backupFilePath).toLowerCase();
    const isBinary = fileExtension === '.dump';
    
    // Get target database connection details
    console.log('\nEnter target database connection details:');
    const targetHost = await question('Host (e.g., dpg-xxxx.render.com): ');
    const targetPort = await question('Port (default: 5432): ') || '5432';
    const targetUser = await question('Username: ');
    const targetDatabase = await question('Database name: ');
    
    // Warning about password exposure
    console.log('\n⚠️  WARNING: The password will be visible in the command.');
    console.log('    This is not ideal for security but necessary for the script to work.');
    console.log('    If you prefer, you can cancel and run the restore command manually.\n');
    
    const proceed = await question('Do you want to proceed? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('\nOperation cancelled. You can restore manually using:');
      
      if (isBinary) {
        console.log(`pg_restore -h ${targetHost} -p ${targetPort} -U ${targetUser} -d ${targetDatabase} -v ${backupFilePath}`);
      } else {
        console.log(`psql -h ${targetHost} -p ${targetPort} -U ${targetUser} -d ${targetDatabase} -f ${backupFilePath}`);
      }
      
      rl.close();
      return;
    }
    
    const targetPassword = await question('Password: ');
    
    console.log('\nReady to restore database:');
    console.log(`- Source: ${backupFilePath}`);
    console.log(`- Target: ${targetUser}@${targetHost}:${targetPort}/${targetDatabase}`);
    console.log(`- Backup type: ${isBinary ? 'Binary dump' : 'SQL dump'}`);
    
    const confirm = await question('\nConfirm restore operation? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled');
      rl.close();
      return;
    }
    
    console.log('\nStarting database restore...');
    
    // Set password for the command
    process.env.PGPASSWORD = targetPassword;
    
    // Execute the appropriate restore command
    if (isBinary) {
      const restoreCmd = `pg_restore -h ${targetHost} -p ${targetPort} -U ${targetUser} -d ${targetDatabase} -v ${backupFilePath}`;
      console.log('Running: pg_restore...');
      
      const { stdout, stderr } = await execPromise(restoreCmd);
      
      if (stderr && !stderr.includes('creating')) {
        console.error('Errors during restore:');
        console.error(stderr);
      }
      
      console.log(stdout);
    } else {
      const restoreCmd = `psql -h ${targetHost} -p ${targetPort} -U ${targetUser} -d ${targetDatabase} -f ${backupFilePath}`;
      console.log('Running: psql...');
      
      const { stdout, stderr } = await execPromise(restoreCmd);
      
      if (stderr && !stderr.includes('creating')) {
        console.error('Errors during restore:');
        console.error(stderr);
      }
      
      console.log(stdout);
    }
    
    console.log('\n✅ Database restore completed!');
    console.log('Note: Some constraint warnings are normal during restore.\n');
    
    // Clean up
    delete process.env.PGPASSWORD;
    
    // Update application environment variables reminder
    console.log('Next steps:');
    console.log('1. Update your application environment variables to use the new database');
    console.log('2. Test your application with the restored database');
    console.log('3. See DATABASE_MIGRATION_GUIDE.md for more information');
    
  } catch (error) {
    console.error('Error during database restore:', error);
  } finally {
    rl.close();
  }
}

restoreBackup().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
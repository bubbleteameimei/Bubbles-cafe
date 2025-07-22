/**
 * Full Website Backup Utility
 * 
 * This script creates a complete backup of the website including:
 * 1. Database (SQL & binary dumps)
 * 2. Configuration files
 * 3. Client source code
 * 4. Server source code
 * 5. Shared code
 * 6. Scripts
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Import the database backup function
async function createDatabaseBackup() {
  try {
    // Execute the full-backup.ts script for database backup
    console.log('Creating database backup using existing script...');
    const { stdout, stderr } = await execAsync('npx tsx scripts/full-backup.ts');
    
    if (stderr && !stderr.includes('Backup Summary')) {
      console.warn('Warnings during database backup:', stderr);
    }
    
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('Error creating database backup:', error);
    return false;
  }
}

async function createFullWebsiteBackup() {
  try {
    console.log('Starting full website backup...');
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(projectRoot, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Generate timestamp for backup files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 1. Create database backup (using existing function)
    console.log('\n--- DATABASE BACKUP ---');
    const dbBackupSuccess = await createDatabaseBackup();
    if (!dbBackupSuccess) {
      console.warn('⚠️ Database backup had issues, but continuing with website backup');
    }
    
    // 2. Backup important configuration files
    console.log('\n--- CONFIGURATION FILES BACKUP ---');
    const configBackupDir = path.join(backupDir, `config-backup-${timestamp}`);
    await fs.mkdir(configBackupDir, { recursive: true });
    
    // List of important config files to backup
    const configFiles = [
      '.replit',
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'vite.config.ts',
      'drizzle.config.ts',
      'theme.json',
      '.env.development',
      '.env.production',
      '.env.local',
      'tsconfig.server.json',
      'workflows.json'
    ];
    
    let configBackupCount = 0;
    for (const file of configFiles) {
      try {
        // Check if file exists before trying to read
        await fs.access(path.join(projectRoot, file));
        const content = await fs.readFile(path.join(projectRoot, file), 'utf-8');
        await fs.writeFile(path.join(configBackupDir, file), content);
        configBackupCount++;
      } catch (err) {
        console.warn(`Couldn't backup ${file}: File may not exist`);
      }
    }
    console.log(`✅ Backed up ${configBackupCount} configuration files`);
    
    // 3. Backup client source code
    console.log('\n--- CLIENT SOURCE CODE BACKUP ---');
    const clientSrcBackupDir = path.join(backupDir, `client-src-backup-${timestamp}`);
    await fs.mkdir(clientSrcBackupDir, { recursive: true });
    
    try {
      await execAsync(`cp -r ${path.join(projectRoot, 'client')} ${clientSrcBackupDir}`);
      console.log(`✅ Client source code backed up to ${clientSrcBackupDir}`);
    } catch (err) {
      console.error(`Failed to backup client source code:`, err);
    }
    
    // 4. Backup server source code
    console.log('\n--- SERVER SOURCE CODE BACKUP ---');
    const serverBackupDir = path.join(backupDir, `server-backup-${timestamp}`);
    await fs.mkdir(serverBackupDir, { recursive: true });
    
    try {
      await execAsync(`cp -r ${path.join(projectRoot, 'server')} ${serverBackupDir}`);
      console.log(`✅ Server source code backed up to ${serverBackupDir}`);
    } catch (err) {
      console.error(`Failed to backup server source code:`, err);
    }
    
    // 5. Backup shared code
    console.log('\n--- SHARED CODE BACKUP ---');
    const sharedBackupDir = path.join(backupDir, `shared-backup-${timestamp}`);
    await fs.mkdir(sharedBackupDir, { recursive: true });
    
    try {
      await execAsync(`cp -r ${path.join(projectRoot, 'shared')} ${sharedBackupDir}`);
      console.log(`✅ Shared code backed up to ${sharedBackupDir}`);
    } catch (err) {
      console.error(`Failed to backup shared code:`, err);
    }
    
    // 6. Backup scripts
    console.log('\n--- SCRIPTS BACKUP ---');
    const scriptsBackupDir = path.join(backupDir, `scripts-backup-${timestamp}`);
    await fs.mkdir(scriptsBackupDir, { recursive: true });
    
    try {
      await execAsync(`cp -r ${path.join(projectRoot, 'scripts')} ${scriptsBackupDir}`);
      console.log(`✅ Scripts backed up to ${scriptsBackupDir}`);
    } catch (err) {
      console.error(`Failed to backup scripts:`, err);
    }
    
    // 7. Backup public files
    console.log('\n--- PUBLIC FILES BACKUP ---');
    const publicBackupDir = path.join(backupDir, `public-backup-${timestamp}`);
    await fs.mkdir(publicBackupDir, { recursive: true });
    
    try {
      await execAsync(`cp -r ${path.join(projectRoot, 'public')} ${publicBackupDir}`);
      console.log(`✅ Public files backed up to ${publicBackupDir}`);
    } catch (err) {
      console.error(`Failed to backup public files:`, err);
    }
    
    // Create a manifest file with backup information
    const manifest = {
      timestamp,
      components: [
        'Database (SQL & binary dumps)',
        'Configuration files',
        'Client source code',
        'Server source code',
        'Shared code',
        'Scripts',
        'Public files'
      ],
      createdAt: new Date().toISOString(),
      databaseBackupStatus: dbBackupSuccess ? 'success' : 'issues detected'
    };
    
    await fs.writeFile(
      path.join(backupDir, `backup-manifest-${timestamp}.json`),
      JSON.stringify(manifest, null, 2)
    );
    
    // Calculate the total backup size
    try {
      const { stdout: backupSizeOutput } = await execAsync(`du -sh ${backupDir}`);
      console.log('\n--- BACKUP SUMMARY ---');
      console.log(`Total backup size: ${backupSizeOutput.split('\t')[0]}`);
    } catch (err) {
      console.warn('Could not calculate backup size:', err);
    }
    
    console.log(`\n✅ Website backup completed successfully`);
    console.log(`Backup created at: ${backupDir}`);
    console.log(`Manifest file: ${path.join(backupDir, `backup-manifest-${timestamp}.json`)}`);
    console.log('\nTo restore or migrate your website:');
    console.log('1. Use database restore script to restore the database');
    console.log('2. Copy the source code files to your new environment');
    console.log('3. See DEPLOYMENT_GUIDE.md for detailed migration instructions');
    
  } catch (error) {
    console.error('Error creating website backup:', error);
    process.exit(1);
  }
}

createFullWebsiteBackup().catch(err => {
  console.error('Unhandled error during backup:', err);
  process.exit(1);
});
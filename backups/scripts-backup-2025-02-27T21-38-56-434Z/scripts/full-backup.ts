
import { createBackup } from './backup';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function createFullBackup() {
  try {
    console.log('Starting full website backup...');
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Generate timestamp for backup files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 1. Create database backup (using existing function)
    console.log('Creating database backup...');
    await createBackup();
    
    // 2. Backup important configuration files
    console.log('Backing up configuration files...');
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
      'theme.json'
    ];
    
    for (const file of configFiles) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), 'utf-8');
        await fs.writeFile(path.join(configBackupDir, file), content);
      } catch (err) {
        console.warn(`Couldn't backup ${file}:`, err);
      }
    }
    
    // 3. Backup client source code
    console.log('Backing up client source code...');
    const clientSrcBackupDir = path.join(backupDir, `client-src-backup-${timestamp}`);
    await fs.mkdir(clientSrcBackupDir, { recursive: true });
    
    await execAsync(`cp -r ${path.join(process.cwd(), 'client/src')} ${clientSrcBackupDir}`);
    
    // 4. Backup server source code
    console.log('Backing up server source code...');
    const serverBackupDir = path.join(backupDir, `server-backup-${timestamp}`);
    await fs.mkdir(serverBackupDir, { recursive: true });
    
    await execAsync(`cp -r ${path.join(process.cwd(), 'server')} ${serverBackupDir}`);
    
    // 5. Backup shared code
    console.log('Backing up shared code...');
    const sharedBackupDir = path.join(backupDir, `shared-backup-${timestamp}`);
    await fs.mkdir(sharedBackupDir, { recursive: true });
    
    await execAsync(`cp -r ${path.join(process.cwd(), 'shared')} ${sharedBackupDir}`);
    
    // 6. Backup scripts
    console.log('Backing up scripts...');
    const scriptsBackupDir = path.join(backupDir, `scripts-backup-${timestamp}`);
    await fs.mkdir(scriptsBackupDir, { recursive: true });
    
    await execAsync(`cp -r ${path.join(process.cwd(), 'scripts')} ${scriptsBackupDir}`);
    
    // Create a manifest file with backup information
    const manifest = {
      timestamp,
      components: [
        'Database (SQL dump)',
        'Configuration files',
        'Client source code',
        'Server source code',
        'Shared code',
        'Scripts'
      ],
      createdAt: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(backupDir, `backup-manifest-${timestamp}.json`),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('Full backup completed successfully!');
    console.log(`Backup files are located in the 'backups' directory with timestamp: ${timestamp}`);
    
    return {
      success: true,
      timestamp,
      backupLocation: backupDir
    };
  } catch (error) {
    console.error('Backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  createFullBackup();
}

export { createFullBackup };

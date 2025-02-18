import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function createBackup() {
  try {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

    // Execute pg_dump
    const { stdout, stderr } = await execAsync(
      `pg_dump "${process.env.DATABASE_URL}" --clean --if-exists > "${backupFile}"`
    );

    if (stderr) {
      console.error('Backup warning:', stderr);
    }

    console.log(`Backup created successfully at ${backupFile}`);

    // Create a restore script
    const restoreScript = `#!/bin/bash
# Restore script for backup-${timestamp}.sql
echo "Restoring database from backup-${timestamp}.sql..."
psql "${process.env.DATABASE_URL}" < "${backupFile}"
echo "Restore complete!"`;

    await fs.writeFile(
      path.join(backupDir, `restore-${timestamp}.sh`),
      restoreScript,
      { mode: 0o755 }
    );

    console.log(`Restore script created at backups/restore-${timestamp}.sh`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  createBackup();
}

export { createBackup };
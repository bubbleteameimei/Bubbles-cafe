/**
 * Database Backup Utility
 * 
 * This script creates a complete backup of the PostgreSQL database
 * that can be used for migration to external hosting like Render.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function createFullBackup() {
  console.log('Starting full database backup...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create backups directory if it doesn't exist
  const backupDir = path.join(projectRoot, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get database connection details from environment variables
  const {
    PGHOST = 'localhost',
    PGPORT = '5432',
    PGUSER = 'postgres',
    PGDATABASE = 'postgres',
    PGPASSWORD
  } = process.env;

  if (!PGPASSWORD) {
    console.error('Error: PGPASSWORD environment variable is required for database backup');
    process.exit(1);
  }

  try {
    // Create binary dump file (recommended for complete backups)
    const binaryBackupPath = path.join(backupDir, `backup-${timestamp}.dump`);
    const pgDumpBinaryCmd = `pg_dump -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -F c -f ${binaryBackupPath}`;
    
    console.log('Creating binary backup...');
    await execPromise(pgDumpBinaryCmd);
    console.log(`✅ Binary backup created: ${binaryBackupPath}`);
    
    // Create SQL dump as alternative (for easier inspection)
    const sqlBackupPath = path.join(projectRoot, 'backup.sql');
    const pgDumpSqlCmd = `pg_dump -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} > ${sqlBackupPath}`;
    
    console.log('Creating SQL backup...');
    await execPromise(pgDumpSqlCmd);
    console.log(`✅ SQL backup created: ${sqlBackupPath}`);
    
    // Create a copy in backups directory too
    fs.copyFileSync(sqlBackupPath, path.join(backupDir, `backup-${timestamp}.sql`));
    
    console.log('\nBackup Summary:');
    console.log('---------------');
    console.log(`Binary backup: ${binaryBackupPath}`);
    console.log(`SQL backup: ${sqlBackupPath}`);
    console.log(`SQL backup copy: ${path.join(backupDir, `backup-${timestamp}.sql`)}`);
    
    // Print file sizes
    const binarySize = (fs.statSync(binaryBackupPath).size / (1024 * 1024)).toFixed(2);
    const sqlSize = (fs.statSync(sqlBackupPath).size / (1024 * 1024)).toFixed(2);
    console.log(`\nBinary backup size: ${binarySize} MB`);
    console.log(`SQL backup size: ${sqlSize} MB`);
    
    console.log('\n✅ Database backup completed successfully');
    console.log('\nTo restore this backup on Render:');
    console.log('1. Download the backup file');
    console.log('2. Create a new PostgreSQL database on Render');
    console.log('3. Use pg_restore to restore the binary backup:');
    console.log('   pg_restore -h <RENDER_HOST> -p <RENDER_PORT> -U <RENDER_USER> -d <RENDER_DATABASE> -v backup.dump');
    console.log('\nSee DATABASE_MIGRATION_GUIDE.md for detailed migration instructions');

  } catch (error) {
    console.error('Error creating database backup:', error);
    process.exit(1);
  }
}

createFullBackup().catch(err => {
  console.error('Unhandled error during backup:', err);
  process.exit(1);
});
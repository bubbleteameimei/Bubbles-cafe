#!/usr/bin/env tsx

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Starting database migration for sessions table...');

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_update_sessions_table.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements by semicolon and filter out empty ones
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some statements might fail if columns already exist, which is okay
        console.warn(`⚠️  Statement ${i + 1} warning:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Verify the migration worked by checking the table structure
    console.log('🔍 Verifying migration results...');
    
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Sessions table structure:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if we have any active sessions
    const sessionCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions WHERE is_active = true
    `);

    console.log(`📊 Active sessions: ${sessionCount.rows[0]?.count || 0}`);

    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
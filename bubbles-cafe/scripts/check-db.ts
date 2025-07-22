/**
 * Database Verification Script
 * 
 * This script checks the current database state, lists all tables,
 * and provides row counts to verify the database is properly set up.
 */

import { initializeDatabaseConnection } from './connect-db';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Initialize database connection
    const { db } = await initializeDatabaseConnection();
    
    // List all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Database Tables:');
    
    // Check each table for row count
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const countResult = await db.execute(sql`
        SELECT COUNT(*) FROM ${sql.identifier(tableName)}
      `);
      const count = countResult.rows[0].count;
      console.log(`- ${tableName}: ${count} rows`);
    }
    
    console.log('\n✅ Database verification completed successfully!');
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the check
checkDatabase();
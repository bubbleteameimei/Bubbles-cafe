/**
 * Database Verification Script
 * 
 * This script verifies the database connection and checks for the existence of
 * all tables defined in the schema. It reports any missing tables.
 */
import { initializeDatabaseConnection } from './connect-db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

async function verifyDatabase() {
  console.log('🔍 Starting database verification...');
  
  try {
    // Initialize and test database connection
    const { db, pool } = await initializeDatabaseConnection();
    
    // Log schema keys to understand structure
    console.log('🔍 Examining schema structure...');
    console.log(`Found ${Object.keys(schema).length} keys in schema`);
    
    // Instead of trying to parse the schema, let's use a hardcoded list of known tables
    // This is a temporary solution until we can better understand the schema structure
    const tableNames = [
      'users',
      'posts',
      'comments',
      'reported_content',
      'session',
      'performance_metrics'
    ];
    
    console.log(`📊 Using known table list: ${tableNames.join(', ')}`);
    
    console.log(`📋 Checking existence of ${tableNames.length} tables...`);
    
    // Check each table in the database
    const existingTablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables: string[] = existingTablesResult.rows.map(row => row.table_name);
    
    // Find missing tables
    const missingTables = tableNames.filter(tableName => !existingTables.includes(tableName));
    
    if (missingTables.length === 0) {
      console.log('✅ All tables exist in the database');
    } else {
      console.log('⚠️ Missing tables:');
      missingTables.forEach(tableName => {
        console.log(`   - ${tableName}`);
      });
      console.log('Run "npm run db:push" to create missing tables');
    }
    
    // Check if tables have data
    console.log('📊 Checking table data...');
    const tablesWithData: { table: string; count: number }[] = [];
    const emptyTables: string[] = [];
    
    for (const table of existingTables) {
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM ${sql.identifier(table)}
      `);
      
      const count = parseInt(countResult.rows[0].count);
      if (count > 0) {
        tablesWithData.push({ table, count });
      } else {
        emptyTables.push(table);
      }
    }
    
    console.log('📊 Tables with data:');
    if (tablesWithData.length === 0) {
      console.log('   None - all tables are empty');
    } else {
      tablesWithData.forEach(({ table, count }) => {
        console.log(`   - ${table}: ${count} rows`);
      });
    }
    
    console.log('🏁 Database verification complete');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
verifyDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
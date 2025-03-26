/**
 * Database Table Check Script
 * 
 * This script connects to the PostgreSQL database and lists tables and their row counts
 */
import pg from 'pg';
import * as dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function checkTables() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    
    // List all tables in the public schema
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\nFound ${tablesResult.rows.length} tables in database:\n`);
    
    // For each table, get the row count
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      const countResult = await pool.query(`
        SELECT COUNT(*) as row_count FROM "${tableName}"
      `);
      const rowCount = countResult.rows[0].row_count;
      console.log(`Table: ${tableName.padEnd(25)} | Rows: ${rowCount}`);
    }
    
    console.log('\nDatabase check complete!');
  } catch (error) {
    console.error('Error checking database tables:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
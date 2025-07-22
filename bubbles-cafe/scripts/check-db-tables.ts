/**
 * Database Table Inspection Script
 * 
 * This script connects to the database and lists all tables,
 * along with their column information to verify the schema.
 */
import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';
import config from '../server/config';

// Make sure environment variables are loaded
console.log('Checking database tables with connection URL:', 
            config.DATABASE_URL ? 'Database URL is set' : 'Database URL is NOT set');

async function checkDatabaseTables() {
  try {
    console.log('Connecting to database...');
    
    // Get all tables in the public schema using raw query
    const client = await pool.connect();
    try {
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log(`Found ${tablesResult.rows.length} tables:`);
      
      // List all tables
      for (let i = 0; i < tablesResult.rows.length; i++) {
        const row = tablesResult.rows[i];
        console.log(`- ${row.table_name}`);
        
        // Get columns for each table
        const columnsResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [row.table_name]);
        
        // Print column details
        for (let j = 0; j < columnsResult.rows.length; j++) {
          const column = columnsResult.rows[j];
          console.log(`  • ${column.column_name} (${column.data_type})${column.is_nullable === 'NO' ? ' NOT NULL' : ''}${column.column_default ? ` DEFAULT ${column.column_default}` : ''}`);
        }
        
        console.log(''); // Empty line for readability
      }
    } finally {
      client.release();
    }
    
    console.log('Database inspection complete');
  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the function
checkDatabaseTables();
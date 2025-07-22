// A simple script to check database tables
import { db, pool } from '../server/db-connect';
import { sql } from 'drizzle-orm';

async function checkTables() {
  console.log('Checking database tables...');
  
  try {
    // Connect to the database
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      // List tables
      console.log('Querying database tables...');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nDatabase tables found:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
      
      // Check row counts for important tables
      console.log('\nRow counts:');
      
      const userCountResult = await client.query('SELECT COUNT(*) FROM users;');
      console.log('Users:', userCountResult.rows[0].count);
      
      const postCountResult = await client.query('SELECT COUNT(*) FROM posts;');
      console.log('Posts:', postCountResult.rows[0].count);
      
      const commentCountResult = await client.query('SELECT COUNT(*) FROM comments;');
      console.log('Comments:', commentCountResult.rows[0].count);
      
      console.log('\nDatabase check completed successfully');
    } finally {
      // Release the client back to the pool
      client.release();
      console.log('Database client released');
    }
  } catch (error) {
    console.error('Error checking database tables:', error);
  }
}

// Run the check
checkTables();
// A simple script to test database connection with Node.js pg module directly
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

async function testDatabase() {
  console.log('Testing database connection directly...');
  
  try {
    // Get DATABASE_URL from .env file
    let databaseUrl;
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('Reading DATABASE_URL from .env file...');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
      
      if (dbUrlMatch && dbUrlMatch[1]) {
        databaseUrl = dbUrlMatch[1];
        console.log('✅ Found DATABASE_URL in .env file');
      }
    }
    
    if (!databaseUrl) {
      console.error('Could not find DATABASE_URL');
      return;
    }
    
    // Create a new pool
    console.log('Creating connection pool...');
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
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
      
      try {
        const userCountResult = await client.query('SELECT COUNT(*) FROM users;');
        console.log('Users:', userCountResult.rows[0].count);
      } catch (error) {
        console.log('Error counting users:', error.message);
      }
      
      try {
        const postCountResult = await client.query('SELECT COUNT(*) FROM posts;');
        console.log('Posts:', postCountResult.rows[0].count);
      } catch (error) {
        console.log('Error counting posts:', error.message);
      }
      
      try {
        const commentCountResult = await client.query('SELECT COUNT(*) FROM comments;');
        console.log('Comments:', commentCountResult.rows[0].count);
      } catch (error) {
        console.log('Error counting comments:', error.message);
      }
      
      console.log('\nDatabase check completed successfully');
    } finally {
      // Release the client back to the pool
      client.release();
      console.log('Database client released');
    }
    
    // Close the pool
    await pool.end();
    console.log('Connection pool closed');
    
  } catch (error) {
    console.error('Error testing database:', error);
  }
}

// Run the test
testDatabase();
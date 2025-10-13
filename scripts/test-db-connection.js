/**
 * Simple script to test database connectivity
 */
const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
  console.log('PGHOST:', process.env.PGHOST);
  console.log('PGPORT:', process.env.PGPORT);
  console.log('PGDATABASE:', process.env.PGDATABASE);
  console.log('PGUSER:', process.env.PGUSER ? 'Set (hidden for security)' : 'Not set');
  console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set');
  
  try {
    // Try to connect using the Pool
    const useSSL = (() => {
      try {
        const u = new URL(process.env.DATABASE_URL || '');
        return u.hostname.endsWith('supabase.co') || (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require');
      } catch {
        return (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require');
      }
    })();

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined
    });
    
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    
    console.log('Successfully connected to the database!');
    
    // Execute a simple query
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log('Query result:', res.rows[0]);
    
    // Release the client back to the pool
    client.release();
    
    // Close the pool
    await pool.end();
    
    console.log('Database connection test completed successfully.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testDatabaseConnection();
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
    // Try to connect using individual parameters instead of connection string
    const useSSL = (() => {
      try {
        const dbUrl = process.env.DATABASE_URL || '';
        if (dbUrl) {
          const u = new URL(dbUrl);
          if (u.hostname.endsWith('supabase.co')) return true;
          if (dbUrl.toLowerCase().includes('sslmode=require')) return true;
        }
      } catch {}
      const host = (process.env.PGHOST || '').toLowerCase();
      return host.endsWith('supabase.co');
    })();

    const pool = new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
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
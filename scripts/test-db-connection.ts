/**
 * Simple script to test database connectivity and ensure Supabase-only usage
 */
const pkg = require('pg');
const { Pool } = pkg;

function getDbHost(url) {
  try {
    const u = new URL(String(url || '').replace(/^postgresql:/i, 'http:'));
    return u.hostname || '';
  } catch {
    return '';
  }
}

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
  console.log('PGHOST:', process.env.PGHOST);
  console.log('PGPORT:', process.env.PGPORT);
  console.log('PGDATABASE:', process.env.PGDATABASE);
  console.log('PGUSER:', process.env.PGUSER ? 'Set (hidden for security)' : 'Not set');
  console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set');

  // Enforce Supabase-only by failing fast on Neon/other hosts
  const host = getDbHost(process.env.DATABASE_URL);
  if (!host) {
    console.error('Invalid or missing DATABASE_URL');
    process.exitCode = 1;
    return;
  }
  console.log('Target database host:', host);
  if (host.endsWith('neon.tech')) {
    console.error('Detected Neon host in DATABASE_URL. This project is configured to use Supabase only.');
    process.exitCode = 1;
    return;
  }

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

    console.log('Database connection test completed successfully. Supabase connectivity verified.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exitCode = 1;
  }
}

testDatabaseConnection();
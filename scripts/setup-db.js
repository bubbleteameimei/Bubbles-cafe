// setup-db.js
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
const { hash } = bcrypt;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Admin creation removed
async function createAdminUser() {
  console.log('Skipping admin user creation. No admin users will be created by setup scripts.');
}

async function verifyTables() {
  try {
    console.log('Verifying database tables...');
    
    const tables = [
      'users',
      'posts', 
      'user_feedback'
    ];
    
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ Table ${table} exists`);
      } catch (error) {
        console.error(`❌ Table ${table} does not exist or has issues:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error verifying tables:', error);
  }
}

async function main() {
  try {
    console.log('Running database setup...');
    
    // Run setup steps
    await verifyTables();
    // Admin creation removed
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main();
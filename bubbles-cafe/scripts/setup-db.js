// setup-db.js
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
const { hash } = bcrypt;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin user already exists
    const checkResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    console.log('Creating admin user...');
    
    // Hash the password
    const passwordHash = await hash('adminpassword', 10);
    
    // Insert admin user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, is_admin, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['admin', 'admin@example.com', passwordHash, true, 'Admin User']
    );
    
    console.log('Admin user created with ID:', result.rows[0].id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
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
    await createAdminUser();
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

main();
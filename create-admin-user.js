/**
 * Create Admin User Script
 * 
 * This script creates an admin user in the database for testing purposes.
 */

// We'll use bcrypt to hash the password
import bcrypt from 'bcryptjs';
import pg from 'pg';
const { Pool } = pg;

async function createAdminUser() {
  console.log('Starting admin user creation...');
  
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for connecting to Neon DB on Replit
    }
  });
  
  try {
    // Admin user data
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'password123';
    const isAdmin = true;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Password hashed successfully');
    
    // First check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists:', checkResult.rows[0]);
      // Update the existing user instead
      const updateResult = await pool.query(
        'UPDATE users SET username = $1, password_hash = $2, is_admin = $3, metadata = $4 WHERE email = $5 RETURNING *',
        [username, hashedPassword, isAdmin, JSON.stringify({
          displayName: 'Admin User',
          photoURL: null,
          bio: 'This is a test admin user'
        }), email]
      );
      
      console.log('Admin user updated successfully:', updateResult.rows[0]);
    } else {
      // Insert new admin user
      const insertResult = await pool.query(
        'INSERT INTO users (username, email, password_hash, is_admin, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [username, email, hashedPassword, isAdmin, JSON.stringify({
          displayName: 'Admin User',
          photoURL: null,
          bio: 'This is a test admin user'
        }), new Date()]
      );
      
      console.log('Admin user created successfully:', insertResult.rows[0]);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
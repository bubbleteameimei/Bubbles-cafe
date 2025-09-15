/**
 * Admin Password Fix Script
 * 
 * This script updates the admin user's password hash using bcryptjs.
 */
import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const SALT_ROUNDS = 10;
const ADMIN_PASSWORD = 'powerPUFF7';

async function fixAdminPassword() {
  try {
    console.log('Starting admin password fix script...');
    
    // Connect to the database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    console.log('Connected to database');
    
    // Generate new password hash using bcryptjs
    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    console.log('Generated new password hash with bcryptjs');
    
    // Find the admin user
    const findResult = await pool.query(
      "SELECT id, username, email FROM users WHERE username = 'admin' OR email = 'admin@bubblescafe.com' OR email = 'vantalison@gmail.com'"
    );
    
    if (findResult.rows.length === 0) {
      console.log('No admin user found. Creating new admin user...');
      
      // Create admin user if not exists
      const insertResult = await pool.query(
        `INSERT INTO users (username, email, password_hash, is_admin, created_at) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email`,
        ['admin', 'admin@bubblescafe.com', hashedPassword, true, new Date()]
      );
      
      console.log('Created new admin user:', insertResult.rows[0]);
    } else {
      // Update existing admin user password
      const adminUser = findResult.rows[0];
      console.log('Found admin user:', adminUser);
      
      const updateResult = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, username, email',
        [hashedPassword, adminUser.id]
      );
      
      console.log('Updated admin user password:', updateResult.rows[0]);
    }
    
    console.log('✅ Admin password fix completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('Error fixing admin password:', error);
  }
}

fixAdminPassword();
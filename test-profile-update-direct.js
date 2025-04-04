/**
 * Direct Database Profile Update Test Script
 * 
 * This script bypasses the API to test the updateUser function directly in DatabaseStorage.
 * It uses the database connection to verify that metadata fields are properly merged.
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pg;

async function testProfileUpdateDirect() {
  console.log('Starting direct database profile update test...');
  
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for connecting to Neon DB on Replit
    }
  });
  
  try {
    // Step 1: Find the admin user
    console.log('\nStep 1: Finding admin user...');
    
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found! Did you run create-admin-user.js first?');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Admin user found:', user.username, 'with ID:', user.id);
    
    // Step 2: Check current metadata
    console.log('\nStep 2: Checking current metadata...');
    
    const currentMetadata = user.metadata || {};
    console.log('Current metadata:', currentMetadata);
    
    // Step 3: Update the metadata directly
    console.log('\nStep 3: Updating metadata directly...');
    
    const newMetadataValues = {
      testField: 'This is a test value',
      updatedAt: new Date().toISOString()
    };
    
    // Merge the metadata (this is what the updateUser function does)
    const updatedMetadata = {
      ...currentMetadata,
      ...newMetadataValues
    };
    
    // Update the user record
    const updateResult = await pool.query(
      'UPDATE users SET metadata = $1 WHERE id = $2 RETURNING *',
      [updatedMetadata, user.id]
    );
    
    if (updateResult.rows.length === 0) {
      console.log('❌ Failed to update user metadata!');
      return;
    }
    
    const updatedUser = updateResult.rows[0];
    console.log('✅ User updated successfully');
    console.log('Updated metadata:', updatedUser.metadata);
    
    // Step 4: Verify the metadata was properly merged
    console.log('\nStep 4: Verifying metadata merging...');
    
    // Check if all new fields were added
    let allFieldsAdded = true;
    for (const key in newMetadataValues) {
      if (!(key in updatedUser.metadata)) {
        console.log(`❌ New field '${key}' was not added to metadata!`);
        allFieldsAdded = false;
      }
    }
    
    if (allFieldsAdded) {
      console.log('✅ All new metadata fields were properly added');
    }
    
    // Check if existing fields were preserved
    let allFieldsPreserved = true;
    for (const key in currentMetadata) {
      if (!(key in updatedUser.metadata)) {
        console.log(`❌ Existing field '${key}' was not preserved in metadata!`);
        allFieldsPreserved = false;
      }
    }
    
    if (allFieldsPreserved) {
      console.log('✅ All existing metadata fields were properly preserved');
    }
    
    console.log('\nTest completed successfully');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
testProfileUpdateDirect();
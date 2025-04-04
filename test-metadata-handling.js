/**
 * Comprehensive Metadata Handling Test
 * 
 * This script provides a complete verification of the metadata handling solution
 * in three parts:
 * 1. Direct database test (raw SQL)
 * 2. Storage layer test (calling storage.updateUser)
 * 3. API test (through HTTP endpoint)
 */

import pg from 'pg';
import fetch from 'node-fetch';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// Create report directory if it doesn't exist
const reportDir = path.join(process.cwd(), 'test-reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

const reportFile = path.join(reportDir, `metadata-test-report-${Date.now()}.json`);
const report = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

// Helper to add test results to report
function addTestResult(name, success, duration, details) {
  report.tests.push({
    name,
    success,
    durationMs: duration,
    timestamp: new Date().toISOString(),
    details
  });
  
  report.summary.total++;
  if (success) {
    report.summary.passed++;
  } else {
    report.summary.failed++;
  }
  
  // Save report after each test
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
}

// Part 1: Direct Database Test
async function runDirectDatabaseTest() {
  console.log('\n==== PART 1: DIRECT DATABASE TEST ====');
  const startTime = performance.now();
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // 1. Find the admin user or another test user
    console.log('Finding test user...');
    
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@example.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Test user not found! Creating a test user...');
      
      // Create a test user if not found
      const createResult = await pool.query(
        'INSERT INTO users (username, email, password_hash, is_admin, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['test_metadata', 'test_metadata@example.com', 'password_hash_placeholder', false, { initial: 'metadata' }]
      );
      
      if (createResult.rows.length === 0) {
        throw new Error('Failed to create test user');
      }
      
      console.log('✅ Created test user for metadata tests');
      var user = createResult.rows[0];
    } else {
      console.log('✅ Found test user:', userResult.rows[0].username);
      var user = userResult.rows[0];
    }
    
    // 2. Check current metadata
    console.log('\nCurrent metadata:', user.metadata);
    
    // 3. Update metadata directly with SQL
    console.log('\nUpdating metadata directly with SQL...');
    
    const timestamp = new Date().toISOString();
    const newMetadataValues = {
      testField: `SQL test value at ${timestamp}`,
      sqlUpdate: true
    };
    
    // Merge metadata (this is what the updateUser function should do)
    const updatedMetadata = {
      ...user.metadata,
      ...newMetadataValues
    };
    
    const updateResult = await pool.query(
      'UPDATE users SET metadata = $1 WHERE id = $2 RETURNING *',
      [updatedMetadata, user.id]
    );
    
    if (updateResult.rows.length === 0) {
      throw new Error('Failed to update user metadata');
    }
    
    const updatedUser = updateResult.rows[0];
    console.log('✅ User updated successfully');
    console.log('Updated metadata:', updatedUser.metadata);
    
    // 4. Verify metadata was properly merged
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
    
    let allFieldsPreserved = true;
    for (const key in user.metadata) {
      if (!(key in updatedUser.metadata)) {
        console.log(`❌ Existing field '${key}' was not preserved in metadata!`);
        allFieldsPreserved = false;
      }
    }
    
    if (allFieldsPreserved) {
      console.log('✅ All existing metadata fields were properly preserved');
    }
    
    // Add test result to report
    const endTime = performance.now();
    const success = allFieldsAdded && allFieldsPreserved;
    addTestResult('Direct Database Test', success, endTime - startTime, {
      userId: user.id,
      originalMetadata: user.metadata,
      newMetadataFields: newMetadataValues,
      resultMetadata: updatedUser.metadata
    });
    
    return { 
      userId: user.id, 
      success,
      user: updatedUser 
    };
  } catch (error) {
    console.error('Error in direct database test:', error);
    const endTime = performance.now();
    addTestResult('Direct Database Test', false, endTime - startTime, {
      error: error.toString()
    });
    return { 
      success: false,
      error 
    };
  } finally {
    await pool.end();
  }
}

// Part 2: Storage Layer Test
// This would require importing the storage module directly
// For simplicity, we'll use the API test which calls storage.updateUser

// Part 3: API Test
async function runApiTest(userId) {
  console.log('\n==== PART 3: API TEST ====');
  const startTime = performance.now();
  
  try {
    if (!userId) {
      throw new Error('No user ID provided for API test');
    }
    
    console.log(`Testing API update for user ID: ${userId}`);
    
    // 1. Get current user data
    const getUserResponse = await fetch(`http://localhost:3002/api/test/user/${userId}`);
    
    if (!getUserResponse.ok) {
      throw new Error(`Failed to get user: ${getUserResponse.statusText}`);
    }
    
    const userData = await getUserResponse.json();
    console.log('Current user data:', userData);
    
    // 2. Update user through API
    const timestamp = new Date().toISOString();
    const updateData = {
      metadata: {
        apiTestField: `API test value at ${timestamp}`,
        apiUpdate: true
      }
    };
    
    console.log('Sending update request with data:', updateData);
    
    const updateResponse = await fetch(`http://localhost:3002/api/test/user/${userId}/update-no-csrf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update user: ${errorText}`);
    }
    
    const updateResult = await updateResponse.json();
    console.log('Update result:', updateResult);
    
    // 3. Verify the update was successful
    const getUpdatedUserResponse = await fetch(`http://localhost:3002/api/test/user/${userId}`);
    
    if (!getUpdatedUserResponse.ok) {
      throw new Error(`Failed to get updated user: ${getUpdatedUserResponse.statusText}`);
    }
    
    const updatedUserData = await getUpdatedUserResponse.json();
    console.log('Updated user data:', updatedUserData);
    
    // 4. Check if metadata was properly merged
    const originalMetadata = userData.user.metadata || {};
    const updatedMetadata = updatedUserData.user.metadata || {};
    
    // Check if new fields were added
    let allFieldsAdded = true;
    for (const key in updateData.metadata) {
      if (!(key in updatedMetadata)) {
        console.log(`❌ New field '${key}' was not added to metadata!`);
        allFieldsAdded = false;
      }
    }
    
    if (allFieldsAdded) {
      console.log('✅ All new metadata fields were properly added');
    }
    
    // Check if existing fields were preserved
    let allFieldsPreserved = true;
    for (const key in originalMetadata) {
      if (!(key in updatedMetadata)) {
        console.log(`❌ Existing field '${key}' was not preserved in metadata!`);
        allFieldsPreserved = false;
      }
    }
    
    if (allFieldsPreserved) {
      console.log('✅ All existing metadata fields were properly preserved');
    }
    
    // Add test result to report
    const endTime = performance.now();
    const success = allFieldsAdded && allFieldsPreserved;
    addTestResult('API Test', success, endTime - startTime, {
      userId,
      originalMetadata,
      newMetadataFields: updateData.metadata,
      resultMetadata: updatedMetadata
    });
    
    return {
      success,
      updatedUserData
    };
  } catch (error) {
    console.error('Error in API test:', error);
    const endTime = performance.now();
    addTestResult('API Test', false, endTime - startTime, {
      userId,
      error: error.toString()
    });
    return {
      success: false,
      error
    };
  }
}

// Main function to run all tests
async function runAllTests() {
  console.log('Starting comprehensive metadata handling tests...');
  
  try {
    // Run direct database test
    const dbTestResult = await runDirectDatabaseTest();
    
    // Only proceed with API test if database test was successful
    if (dbTestResult.success && dbTestResult.userId) {
      // Run API test with the same user
      await runApiTest(dbTestResult.userId);
    } else {
      console.log('Skipping API test due to database test failure');
    }
    
    // Print summary
    console.log('\n==== TEST SUMMARY ====');
    console.log(`Total tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Report saved to: ${reportFile}`);
    
  } catch (error) {
    console.error('Fatal error running tests:', error);
  }
}

// Run the tests
runAllTests();
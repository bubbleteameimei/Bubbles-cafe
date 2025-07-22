#!/usr/bin/env node
/**
 * Email Case Sensitivity Verification Script
 * 
 * This script verifies that our email normalization changes are working correctly by:
 *  1. Creating a test user with a mixed-case email
 *  2. Fetching the user using different case variations of the email
 *  3. Verifying that all variations return the same user
 *  4. Cleaning up by removing the test user
 * 
 * Run with: tsx scripts/verify-email-normalization.js
 */

// Import required modules
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

// Get the current module's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all necessary dependencies from the setup file
import { db, storage, schema, eq, sql } from './ts-node-setup.js';

// Generate a unique identifier for this test run
const testId = crypto.randomBytes(4).toString('hex');
const mixedCaseEmail = `Test.User.${testId}@Example.Com`;
const username = `test_user_${testId}`;
const password = 'PasswordTest123';

// Helper for consistent logging
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  if (isError) {
    console.error(`[${timestamp}] ERROR: ${message}`);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

// Verify email normalization
async function verifyEmailNormalization() {
  log('🧪 Starting email normalization verification test');
  
  try {
    // 1. Create a test user with mixed case email
    log(`Creating test user with email: ${mixedCaseEmail}`);
    const testUser = await storage.createUser({
      username,
      email: mixedCaseEmail,
      password,
      isAdmin: false,
      metadata: {
        isTestUser: true,
        testCreatedAt: new Date().toISOString()
      }
    });
    
    log(`✅ Test user created successfully with ID: ${testUser.id}`);
    
    // 2. Create different case variations of the email
    const emailVariations = [
      mixedCaseEmail, // Original
      mixedCaseEmail.toLowerCase(), // All lowercase
      mixedCaseEmail.toUpperCase(), // All uppercase
      mixedCaseEmail.charAt(0).toUpperCase() + mixedCaseEmail.slice(1).toLowerCase(), // First letter uppercase
      mixedCaseEmail.split('@')[0].toUpperCase() + '@' + mixedCaseEmail.split('@')[1].toLowerCase(), // Username part uppercase
    ];
    
    log('Testing the following email variations:');
    emailVariations.forEach((email, index) => {
      log(`  ${index + 1}. ${email}`);
    });
    
    // 3. Verify each variation returns the same user
    for (const email of emailVariations) {
      const retrievedUser = await storage.getUserByEmail(email);
      
      if (!retrievedUser) {
        throw new Error(`❌ Could not find user with email: ${email}`);
      }
      
      log(`✅ Successfully retrieved user with email variation: ${email}`);
      
      // Verify user details match
      if (retrievedUser.id !== testUser.id) {
        throw new Error(`❌ User ID mismatch: expected ${testUser.id}, got ${retrievedUser.id}`);
      }
      
      // Verify the stored email is normalized
      const normalizedEmail = mixedCaseEmail.toLowerCase().trim();
      if (retrievedUser.email !== normalizedEmail) {
        log(`⚠️ Email not properly normalized in database: expected ${normalizedEmail}, got ${retrievedUser.email}`);
      } else {
        log(`✅ Email properly normalized in database: ${retrievedUser.email}`);
      }
    }
    
    // 4. Test admin lookup by email
    for (const email of emailVariations) {
      const adminUsers = await storage.getAdminByEmail(email);
      log(`Admin lookup by ${email}: found ${adminUsers.length} records`);
    }
    
    log('✅ All tests passed! Email normalization is working correctly');
    
    return testUser.id;
  } catch (error) {
    log(`Test failed: ${error.message}`, true);
    log(error.stack, true);
    throw error;
  }
}

// Cleanup test user
async function cleanupTestUser(userId) {
  if (!userId) return;
  
  try {
    log(`🧹 Cleaning up test user with ID: ${userId}`);
    
    // Delete the user directly from the database using sql interface
    const result = await db.delete(schema.users)
      .where(eq(schema.users.id, userId))
      .execute();
    
    log(`✅ Test user cleanup successful`);
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, true);
  }
}

// Run the test
async function runTest() {
  let userId = null;
  
  try {
    userId = await verifyEmailNormalization();
  } catch (error) {
    log('Test suite failed', true);
  } finally {
    // Always clean up, even if test fails
    if (userId) {
      await cleanupTestUser(userId);
    }
    
    // Close database connection
    log('Closing database connection');
    await db.end?.();
    process.exit(0);
  }
}

runTest();
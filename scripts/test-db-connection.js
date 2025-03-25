// Database Connection Test Script
import { pool, db } from '../server/db-connect.ts';
import * as schema from '../shared/schema.ts';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test database connection
    console.log('📊 Testing connection pool...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    console.log('📊 Testing simple query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Database query successful. Current time: ${result.rows[0].current_time}`);
    
    // Test tables existence
    console.log('📊 Testing tables existence...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables in the database:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    // Test users table data (if exists)
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      console.log('📊 Testing users table data...');
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table contains ${usersResult.rows[0].count} records`);
      
      if (usersResult.rows[0].count > 0) {
        const adminResult = await client.query('SELECT COUNT(*) as count FROM users WHERE is_admin = true');
        console.log(`✅ Found ${adminResult.rows[0].count} admin users`);
      }
    }
    
    // Test posts table data (if exists)
    if (tablesResult.rows.some(row => row.table_name === 'posts')) {
      console.log('📊 Testing posts table data...');
      const postsResult = await client.query('SELECT COUNT(*) as count FROM posts');
      console.log(`✅ Posts table contains ${postsResult.rows[0].count} records`);
    }
    
    // Release the client back to the pool
    client.release();
    console.log('👋 Database connection released');
    
    // Test Drizzle ORM
    console.log('📊 Testing Drizzle ORM...');
    if (db && typeof db.query === 'function') {
      try {
        const drizzleResult = await db.query.users.findMany({
          limit: 5,
          columns: {
            id: true,
            username: true,
            email: true,
            isAdmin: true
          }
        });
        
        console.log(`✅ Drizzle ORM query successful. Found ${drizzleResult.length} users`);
        if (drizzleResult.length > 0) {
          console.log('   Sample user data:');
          console.log(`   - ID: ${drizzleResult[0].id}`);
          console.log(`   - Username: ${drizzleResult[0].username}`);
          console.log(`   - Email: ${drizzleResult[0].email}`);
          console.log(`   - Is Admin: ${drizzleResult[0].isAdmin}`);
        }
      } catch (drizzleError) {
        console.error('❌ Drizzle ORM query failed:', drizzleError.message);
      }
    } else {
      console.warn('⚠️ Drizzle ORM instance not available or properly initialized');
    }
    
    console.log('✅ Database connection test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}

// Run the test function
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('🎉 Database is properly configured and connected!');
    } else {
      console.error('❌ Database connection verification failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Unexpected error during database verification:', err);
    process.exit(1);
  })
  .finally(() => {
    // Close the pool to end the process
    pool.end().then(() => {
      console.log('🔒 Connection pool closed');
      process.exit(0);
    });
  });
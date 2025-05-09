/**
 * Database Connection Validator
 * 
 * This script tests the database connection and environment variables.
 * It can be used to diagnose database connection issues.
 */
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

async function validateDatabase() {
  console.log("🔍 DATABASE CONNECTION VALIDATOR");
  console.log("=================================");
  console.log("\n1. Checking environment variables...");
  
  // Check environment variables
  const envVariables = [
    'DATABASE_URL',
    'PGHOST',
    'PGPORT',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE'
  ];
  
  let missingVars = 0;
  
  envVariables.forEach(varName => {
    if (process.env[varName]) {
      if (varName === 'DATABASE_URL' || varName === 'PGPASSWORD') {
        console.log(`✅ ${varName}: Set (value hidden)`);
      } else {
        console.log(`✅ ${varName}: ${process.env[varName]}`);
      }
    } else {
      console.log(`❌ ${varName}: Not set`);
      missingVars++;
    }
  });
  
  if (missingVars > 0) {
    console.log(`\n⚠️ Found ${missingVars} missing environment variables.`);
  } else {
    console.log("\n✅ All required environment variables are set.");
  }
  
  // Attempt to connect to the database
  console.log("\n2. Attempting to connect to the database...");
  
  // If DATABASE_URL is available, use it
  let connectionConfig: any = {};
  let usingDatabaseUrl = false;
  
  if (process.env.DATABASE_URL) {
    connectionConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };
    usingDatabaseUrl = true;
    console.log("   Using DATABASE_URL for connection");
  } else {
    // Otherwise, use individual connection parameters
    connectionConfig = {
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };
    console.log("   Using individual connection parameters (PGHOST, etc.)");
  }
  
  // Create a connection pool
  const pool = new Pool({
    ...connectionConfig,
    max: 1, // Just need one connection for the test
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000 // 30 seconds
  });
  
  try {
    // Try to connect and run a simple query
    console.log("   Connecting to PostgreSQL server...");
    const client = await pool.connect();
    console.log("   Connection established successfully!");
    
    console.log("   Running test query: SELECT version()...");
    const result = await client.query('SELECT version()');
    console.log(`   ✅ Database version: ${result.rows[0].version}`);
    
    console.log("   Running test query: SELECT current_database()...");
    const dbResult = await client.query('SELECT current_database()');
    console.log(`   ✅ Connected to database: ${dbResult.rows[0].current_database}`);
    
    // Release the client back to the pool
    client.release();
    
    // Close the pool
    await pool.end();
    
    console.log("\n✅ DATABASE CONNECTION SUCCESSFUL");
    return true;
  } catch (error) {
    console.error("\n❌ DATABASE CONNECTION FAILED");
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'XX000' && error.message.includes('endpoint is disabled')) {
      console.error("\n⚠️ The database endpoint appears to be disabled.");
      console.error("   This could be because:");
      console.error("   - The database has been paused or suspended");
      console.error("   - The database requires a billing update");
      console.error("   - The database service is experiencing issues");
      console.error("\n   To fix this:");
      console.error("   1. Check your Neon dashboard to ensure the database is running");
      console.error("   2. Verify your billing status if applicable");
      console.error("   3. Generate a new connection string if needed");
    } else if (error.code === 'ENOTFOUND') {
      console.error("\n⚠️ The database host could not be found.");
      console.error("   This could be because:");
      console.error("   - The host name is incorrect");
      console.error("   - There are network connectivity issues");
      console.error("   - DNS resolution problems");
    } else if (error.code === 'ECONNREFUSED') {
      console.error("\n⚠️ Connection refused by the database server.");
      console.error("   This could be because:");
      console.error("   - The port number is incorrect");
      console.error("   - The database server is not running");
      console.error("   - A firewall is blocking the connection");
    } else if (error.code === '28P01') {
      console.error("\n⚠️ Authentication failed.");
      console.error("   This could be because:");
      console.error("   - The username or password is incorrect");
      console.error("   - The user does not have access to the specified database");
    } else if (error.code === '3D000') {
      console.error("\n⚠️ Database does not exist.");
      console.error("   This could be because:");
      console.error("   - The database name is incorrect");
      console.error("   - The database has been deleted");
    }
    
    // Provide connection details for debugging (but hide sensitive data)
    console.log("\n3. Connection details used:");
    if (usingDatabaseUrl) {
      const url = new URL(process.env.DATABASE_URL!);
      console.log(`   Protocol: ${url.protocol}`);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Port: ${url.port}`);
      console.log(`   Username: ${url.username}`);
      console.log(`   Password: ********`);
      console.log(`   Path (database): ${url.pathname.substring(1)}`);
    } else {
      console.log(`   Host: ${connectionConfig.host}`);
      console.log(`   Port: ${connectionConfig.port}`);
      console.log(`   User: ${connectionConfig.user}`);
      console.log(`   Password: ********`);
      console.log(`   Database: ${connectionConfig.database}`);
    }
    
    // Try to close the pool
    try {
      await pool.end();
    } catch (endError) {
      // Ignore errors when closing the pool
    }
    
    return false;
  }
}

// Run the validation
validateDatabase()
  .then(success => {
    console.log("\nValidation completed.");
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Unexpected error during validation:", error);
    process.exit(1);
  });
// Create Reported Content Table Script

import pg from 'pg';
const { Pool } = pg;

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

console.log('🔄 Starting creation of reported_content table...');

try {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  // Connect to the database
  console.log('🔌 Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('📊 Creating reported_content table...');
    
    // SQL to create the reported_content table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS reported_content (
        id SERIAL PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        reporter_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        CONSTRAINT fk_reporter
          FOREIGN KEY(reporter_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ reported_content table created successfully!');
    
  } finally {
    // Release the client back to the pool
    client.release();
  }

  await pool.end();
  console.log('🎉 Operation completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error creating reported_content table:', error);
  process.exit(1);
}
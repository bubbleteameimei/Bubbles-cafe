// Neon Database Configuration
// This file ensures your Neon database is always used as the primary database

// Function to get the proper database URL from environment variables
export function getDatabaseURL(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
  }
  return databaseUrl;
}

// Set environment variables to ensure consistency
export function setNeonAsDefault() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
  }
  
  // Parse the database URL to extract components
  try {
    const url = new URL(databaseUrl);
    process.env.PGHOST = url.hostname;
    process.env.PGUSER = url.username;
    process.env.PGPASSWORD = url.password;
    process.env.PGDATABASE = url.pathname.slice(1); // Remove leading slash
    process.env.PGPORT = url.port || "5432";
    
    
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error);
    throw new Error('Invalid DATABASE_URL format in environment variables');
  }
}
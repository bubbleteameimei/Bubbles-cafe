// Neon Database Configuration
// This file ensures your Neon database is always used as the primary database

export const NEON_DATABASE_CONFIG = {
  url: "postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  host: "ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech",
  user: "neondb_owner",
  password: "npg_P6ghCZR2BASQ",
  database: "neondb",
  ssl: true
};

// Function to get the proper database URL
export function getDatabaseURL(): string {
  // Always prioritize your Neon database
  return NEON_DATABASE_CONFIG.url;
}

// Set environment variables to ensure consistency
export function setNeonAsDefault() {
  process.env.DATABASE_URL = NEON_DATABASE_CONFIG.url;
  process.env.PGHOST = NEON_DATABASE_CONFIG.host;
  process.env.PGUSER = NEON_DATABASE_CONFIG.user;
  process.env.PGPASSWORD = NEON_DATABASE_CONFIG.password;
  process.env.PGDATABASE = NEON_DATABASE_CONFIG.database;
  process.env.PGPORT = "5432";
  
  console.log('✅ Neon database set as default for all connections');
}
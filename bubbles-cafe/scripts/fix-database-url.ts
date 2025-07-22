import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function fixDatabaseUrl() {
  try {
    console.log('🔧 Fixing DATABASE_URL...');
    
    // Get all environment variables
    const env = process.env;
    
    // Check if DATABASE_URL is set
    if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
      console.log('✅ DATABASE_URL is already set');
      return;
    }
    
    // Try to construct DATABASE_URL from individual components
    const pgHost = env.PGHOST || 'localhost';
    const pgPort = env.PGPORT || '5432';
    const pgUser = env.PGUSER || 'postgres';
    const pgPassword = env.PGPASSWORD || '';
    const pgDatabase = env.PGDATABASE || 'postgres';
    
    if (!pgHost || !pgPort || !pgUser || !pgDatabase) {
      console.log('❌ Required PostgreSQL environment variables are not set');
      console.log('Available vars:', {
        PGHOST: env.PGHOST ? 'set' : 'not set',
        PGPORT: env.PGPORT ? 'set' : 'not set',
        PGUSER: env.PGUSER ? 'set' : 'not set',
        PGPASSWORD: env.PGPASSWORD ? 'set' : 'not set',
        PGDATABASE: env.PGDATABASE ? 'set' : 'not set'
      });
      return;
    }
    
    // Construct DATABASE_URL
    const databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
    
    console.log('✅ Constructed DATABASE_URL from individual components');
    console.log('Database connection string created');
    
    // Set the environment variable for this session
    process.env.DATABASE_URL = databaseUrl;
    
  } catch (error) {
    console.error('❌ Error fixing DATABASE_URL:', error);
  }
}

// Run the fix
fixDatabaseUrl().catch(console.error);
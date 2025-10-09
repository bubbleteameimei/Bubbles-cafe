import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';


const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Skip admin user creation. Verify presence only.
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.isAdmin, true))
      .limit(1);

    if (existingAdmin.length === 0) {
      console.log('⚠️ No admin user found. Please create one securely via a controlled process.');
    } else {
      console.log('✅ Admin user exists');
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

setupDatabase()
  .then(() => {
    console.log('Database is ready');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
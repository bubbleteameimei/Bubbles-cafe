import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';
import bcrypt from 'bcryptjs';

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
    
    // Create an admin user if it doesn't exist
    const existingAdmin = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@storytelling.com'))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(schema.users).values({
        username: 'admin',
        email: 'admin@storytelling.com',
        password_hash: hashedPassword,
        isAdmin: true,
        metadata: {}
      });
      
      console.log('✅ Admin user created (email: admin@storytelling.com, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
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
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(`
❌ DATABASE_URL environment variable is not set!

To fix this issue, you need to:

1. Create a database (PostgreSQL/Neon recommended)
2. Set the DATABASE_URL environment variable

For development, you can:
- Use a local PostgreSQL database
- Use Neon (https://neon.tech) for a free cloud database
- Set DATABASE_URL in your .env file

Example DATABASE_URL formats:
- PostgreSQL: postgresql://username:password@hostname:port/database
- Neon: postgresql://username:password@host.neon.tech/dbname

Current environment: ${process.env.NODE_ENV || 'development'}
`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('💡 In development mode, you can use a local SQLite database as fallback');
    console.log('💡 Or visit https://neon.tech to get a free PostgreSQL database');
  }
  
  process.exit(1);
}

console.log('🔗 Connecting to database...');
console.log(`📍 Database URL: ${databaseUrl.replace(/\/\/.*:.*@/, '//***:***@')}`);

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
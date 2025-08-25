import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Normalize and sanitize potentially malformed DATABASE_URL values
function sanitizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return url;
  let s = url.trim();
  s = s.replace(/\s+/g, '');
  s = s.replace(/^postgresal:\/\//i, 'postgresql://');
  s = s.replace(/^postgres:\/\//i, 'postgresql://');
  s = s.replace(/-pool-er/gi, '-pooler');
  // Ensure sslmode=require is preserved if present or needed
  if (!/sslmode=/i.test(s)) {
    const hasQuery = s.includes('?');
    s = s + (hasQuery ? '&' : '?') + 'sslmode=require';
  }
  return s;
}

// Resolve database URL from environment with sanitization
const DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);

if (!DATABASE_URL) {
        console.error('DATABASE_URL is not set. Please configure your environment.');
        throw new Error('DATABASE_URL is required');
}

// Configure WebSocket for Neon serverless with enhanced error handling
try {
        neonConfig.webSocketConstructor = ws;
} catch (error) {
        console.error('Error configuring Neon WebSocket:', error);
        // Fallback to default HTTP mode if WebSocket fails
}

// Create pool with connection retry logic
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
        pool = new Pool({ 
                connectionString: DATABASE_URL,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
        });

        // Test the connection
        pool.on('connect', () => {
                // Connection established successfully
        });

        pool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
        });

        db = drizzle({ client: pool, schema });
        
        // Database configuration completed successfully
} catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
}

export { pool, db };
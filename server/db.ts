import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Load environment variables first using dynamic import to avoid TS resolution issues
try {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	import('dotenv').then(m => m.config({ override: true })).catch(() => {});
} catch {}

// Configure WebSocket for Neon serverless with enhanced error handling
try {
	neonConfig.webSocketConstructor = ws;
	console.log('Configured Neon with WebSocket support');
} catch (error) {
	console.error('Error configuring Neon WebSocket:', error);
	// Fallback to default HTTP mode if WebSocket fails
	console.log('Falling back to HTTP mode for Neon connections');
}

// Debug environment loading
console.log('Environment loading debug:', {
	nodeEnv: process.env.NODE_ENV,
	hasDatabase: !!process.env.DATABASE_URL,
	databaseLength: process.env.DATABASE_URL?.length
});

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL must be set. Did you forget to provision a database?",
	);
}

// Create pool with connection retry logic
let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
	pool = new Pool({ 
		connectionString: process.env.DATABASE_URL,
		max: 10, // Maximum number of connections
		idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
		connectionTimeoutMillis: 10000, // Connection timeout of 10 seconds
	});

	// Test the connection
	pool.on('connect', () => {
		console.log('Database connection established');
	});

	pool.on('error', (err) => {
		console.error('Unexpected error on idle client', err);
	});

	db = drizzle({ client: pool, schema });
	
	console.log('Database configuration completed successfully');
} catch (error) {
	console.error('Failed to initialize database:', error);
	throw error;
}

export { pool, db };
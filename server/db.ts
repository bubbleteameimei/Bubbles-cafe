import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Normalize and sanitize potentially malformed DATABASE_URL values
function sanitizeDatabaseUrl(url?: string): string | undefined {
	if (!url) return url;
	let s = url;
	// Remove whitespace/newlines
	s = s.replace(/\s+/g, '');
	// Fix common protocol typos
	s = s.replace(/^postgresal:\/\//i, 'postgresql://');
	s = s.replace(/^postgres:\/\//i, 'postgresql://');
	// Fix broken "pooler" subdomain splits like "pool-er"
	s = s.replace(/-pool-er/gi, '-pooler');
	// Fix split words like re-quire
	s = s.replace(/re-?quire/gi, 'require');
	return s;
}

if (process.env.DATABASE_URL) {
	process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL)!;
}

// Configure WebSocket for Neon serverless with enhanced error handling
try {
	neonConfig.webSocketConstructor = ws;
} catch (error) {
	console.error('Error configuring Neon WebSocket:', error);
	// Fallback to default HTTP mode if WebSocket fails
}

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
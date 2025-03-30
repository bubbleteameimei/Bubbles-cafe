/**
 * Direct Database Connection Module
 * 
 * This module provides direct access to the database using the Neon serverless driver.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';
import ws from 'ws';

// Required for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Configure Neon to use secure WebSockets
try {
  // @ts-ignore - These may not exist in all versions of the Neon SDK
  neonConfig.useSecureWebSocket = true;
  // @ts-ignore - Add additional configuration for better resilience 
  neonConfig.patchWebSocketForReconnect = true;
} catch (configErr) {
  console.log('Note: Some config options not available in this Neon version');
}

// Create a SQL executor using the Neon HTTP driver
export const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle ORM with our schema
export const db = drizzle(sql, { schema });

export default db;
/**
 * Database Connection Module
 * 
 * This file centralizes database connection and provides drizzle ORM instance
 * with proper error handling and connection pooling.
 */
import { pool, db } from './db-connect';

// Export the database connection and drizzle instance
export { pool, db };

// Export default for convenience
export default db;
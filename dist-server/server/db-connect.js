/**
 * Database Connection Module for Server
 *
 * This module initializes the database connection for the server using the
 * shared connection module. It ensures proper error handling and reports
 * connection status.
 */
import { initializeDatabaseConnection } from '../scripts/connect-db';
// Create a placeholder for the pool and db
export let pool = {
    connect: async () => { throw new Error('Pool not yet initialized'); }
};
export let db = {};
// Flag to track initialization status
let isInitialized = false;
let initializationPromise;
// Function to wait for initialization to complete
export async function waitForPoolInitialization(timeoutMs = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        try {
            // Try to get a connection to test if pool is ready
            const client = await pool.connect();
            client.release();
            return true;
        }
        catch (error) {
            // Wait a bit before trying again
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return false;
}
// Self-executing async function to initialize the database connection
initializationPromise = (async () => {
    try {
        console.log('Initializing database connection for server...');
        // Initialize the database connection using the shared module
        const connection = await initializeDatabaseConnection();
        // Assign the real pool and db to our exported variables
        pool = connection.pool;
        db = connection.db;
        // Set up event handlers
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', {
                message: err.message,
                stack: err.stack
            });
        });
        pool.on('connect', () => {
            console.log('New client connected to database');
        });
        pool.on('remove', () => {
            console.log('Client connection removed from pool');
        });
        console.log('Database connection initialized successfully');
        isInitialized = true;
    }
    catch (err) {
        console.error('Critical error during database initialization:', err);
        console.error('Database operations will fail until connection is established');
        // Attempt to recover and reconnect periodically
        setTimeout(() => {
            console.log('Attempting to reconnect to database...');
            // The module will be reloaded on next import
        }, 30000); // Try again in 30 seconds
    }
})();
// Note: pool and db are exported at the top of this file

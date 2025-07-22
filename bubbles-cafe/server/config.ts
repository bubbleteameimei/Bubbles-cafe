/**
 * Environment Configuration Module
 * 
 * This module loads environment variables from .env file and validates them
 * before they're used in the application.
 */
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      for (const line of envLines) {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || line.trim() === '') continue;
        
        // Parse key=value pairs
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          
          // Remove quotes if present
          if (value.length > 0 && (value.startsWith('"') && value.endsWith('"')) 
              || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          
          // Only set if not already defined
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      console.log('[Config] Environment variables loaded from .env file');
      return true;
    }
    console.warn('[Config] .env file not found, using existing environment variables');
    return false;
  } catch (error) {
    console.error(`[Config] Error loading .env file:`, error);
    return false;
  }
}

// Load environment variables before validation
loadEnvFile();

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string({
    required_error: "DATABASE_URL is required. Make sure the database is provisioned."
  }),
});

// Export validated config
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL,
};

// Validate config
try {
  envSchema.parse(config);
  console.log('[Config] Environment configuration validated successfully');
} catch (error) {
  console.error('[Config] Environment validation failed:', error);
  throw new Error('Invalid environment configuration');
}

export default config;
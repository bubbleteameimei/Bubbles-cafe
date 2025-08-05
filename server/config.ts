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
  // Check for environment-specific files first
  const envFiles = ['.env.local', '.env.development', '.env'];
  
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    
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
        console.log(`[Config] Environment variables loaded from ${envFile}`);
        return true;
      }
    } catch (error) {
      console.error(`[Config] Error loading ${envFile}:`, error);
    }
  }
  
  console.warn('[Config] No .env files found, using existing environment variables');
  return false;
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
  // Payment processing
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  // Session and security
  SESSION_SECRET: z.string().min(32).optional().default('development_session_secret_at_least_32_characters_long_for_security'),
  // Email configuration
  GMAIL_USER: z.string().email().optional().or(z.literal('')),
  GMAIL_APP_PASSWORD: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  // Firebase configuration
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional().or(z.literal('')),
  // URLs
  FRONTEND_URL: z.string().url().optional().default('http://localhost:3000'),
  CLIENT_URL: z.string().url().optional().default('http://localhost:3000'),
  // WordPress sync
  WORDPRESS_API_URL: z.string().url().optional().or(z.literal('')),
  WORDPRESS_USERNAME: z.string().optional(),
  WORDPRESS_APP_PASSWORD: z.string().optional(),
});

// Export validated config
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  // Payment processing
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
  // Session and security
  SESSION_SECRET: process.env.SESSION_SECRET || 'development_session_secret_at_least_32_characters_long_for_security',
  // Email configuration
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  // Firebase configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  // WordPress sync
  WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME,
  WORDPRESS_APP_PASSWORD: process.env.WORDPRESS_APP_PASSWORD,
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
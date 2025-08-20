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

// Environment variable validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(64, 'SESSION_SECRET must be at least 64 characters for production security').default('horror-stories-session-secret-development-only-change-this-in-production-environment'),
  FRONTEND_URL: z.string().url().optional(),
  WORDPRESS_API_URL: z.string().url().optional(),
  WORDPRESS_API: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  MAILERSEND_API_KEY: z.string().optional(),
  VITE_ENABLE_ERROR_REPORTING: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Please check your environment variables and try again.');
      process.exit(1);
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Configuration object
export const config = {
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  database: {
    url: env.DATABASE_URL,
  },
  session: {
    secret: env.SESSION_SECRET,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  },
  cors: {
    origin: env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  wordpress: {
    apiUrl: env.WORDPRESS_API_URL || env.WORDPRESS_API || 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts',
  },
  auth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  email: {
    gmail: {
      appPassword: env.GMAIL_APP_PASSWORD,
    },
    sendgrid: {
      apiKey: env.SENDGRID_API_KEY,
    },
    mailersend: {
      apiKey: env.MAILERSEND_API_KEY,
    },
  },
  features: {
    errorReporting: env.VITE_ENABLE_ERROR_REPORTING === 'true',
  },
} as const;

// Type for the config object
export type Config = typeof config;
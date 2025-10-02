/**
 * Environment Configuration Module
 * 
 * This module loads environment variables from .env file and validates them
 * before they're used in the application.
 */
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env files
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  let loaded = false;

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
            if (value.length > 0 && (value.startsWith('\"') && value.endsWith('\"')) 
                || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1);
            }

            // Set the value, with .env.local taking priority over .env
            if (!process.env[key] || envFile === '.env.local') {
              process.env[key] = value;
            }
          }
        }
        // Avoid console.* in production builds that drop logs
        try { process.stderr.write(`[Config] Environment variables loaded from ${envFile}\n`); } catch {}
        loaded = true;
      }
    } catch (error) {
      try { process.stderr.write(`[Config] Error loading ${envFile}: ${error instanceof Error ? error.message : String(error)}\n`); } catch {}
    }
  }

  if (!loaded) {
    try { process.stderr.write('[Config] No .env files found, using existing environment variables\n'); } catch {}
  }

  return loaded;
}

// Load environment variables before validation
loadEnvFile();

// Environment variable validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().default('horror-stories-session-secret-development-only-change-this-in-production-environment'),
  FRONTEND_URL: z.string().url().optional(),
  WORDPRESS_API_URL: z.string().url().optional(),
  WORDPRESS_API: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  MAILERSEND_API_KEY: z.string().optional(),
  VITE_ENABLE_ERROR_REPORTING: z.string().optional(),
  ENABLE_API_CACHE: z.string().optional(),
  ENABLE_BROWSER_CACHE: z.string().optional(),
  DEV_REQUEST_LOGGING: z.string().optional(),
  API_CACHE_TTL_MS: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      try {
        process.stderr.write('Environment validation failed:\n');
        error.errors.forEach((err) => {
          process.stderr.write(`  - ${err.path.join('.')}: ${err.message}\n`);
        });
        process.stderr.write('\nPlease check your environment variables and try again.\n');
      } catch {}
      // Do not exit; allow the app to start with best-effort defaults
      // Missing critical vars (like DATABASE_URL) will be handled by downstream code
      return process.env as any;
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
  port: env.PORT || 5000,
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
  cache: {
    api: (env.ENABLE_API_CACHE ?? (env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true',
    browser: (env.ENABLE_BROWSER_CACHE ?? (env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true',
    ttlMs: env.API_CACHE_TTL_MS ? Number(env.API_CACHE_TTL_MS) : 5 * 60 * 1000,
  },
  dev: {
    requestLogging: (env.DEV_REQUEST_LOGGING ?? (env.NODE_ENV === 'development' ? 'true' : 'false')) === 'true',
  },
} as const;

// Type for the config object
export type Config = typeof config;

// Warn (do not exit) on weak session secret in production
if (config.isProd) {
  const weakDefaults = new Set([
    'horror-stories-session-secret-development-only-change-this-in-production-environment'
  ]);
  const secret = config.session.secret || '';
  if (secret.length < 64 || weakDefaults.has(secret)) {
    try {
      process.stderr.write('WARNING: SESSION_SECRET is weak or using a development default.\n');
      process.stderr.write('Provide a strong random SESSION_SECRET (>= 64 chars) in the environment.\n');
    } catch {}
    // Continue without exiting to avoid early termination on platforms that inject env later
  }
}
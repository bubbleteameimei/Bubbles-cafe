import { z } from 'zod';

// Define environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters for security")
    .default(process.env.NODE_ENV === 'production' ? '' : 'development_secret_min_32_chars_long'),
  CACHE_ENABLED: z.boolean().default(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
  // Payment service configurations
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  // Email service configurations
  MAILERSEND_API_TOKEN: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM: z.string().optional(),
  MAILERSEND_FROM: z.string().optional(),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  // Frontend configuration
  FRONTEND_URL: z.string().optional(),
  CLIENT_URL: z.string().optional(),
});

// Type inference
export type EnvConfig = z.infer<typeof envSchema>;

// Load and validate environment variables
const loadEnvConfig = (): EnvConfig => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
      HOST: process.env.HOST || '0.0.0.0',
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET || process.env.REPL_ID,
      CACHE_ENABLED: process.env.NODE_ENV === 'production',
      LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
      RATE_LIMIT_MAX_REQUESTS: process.env.NODE_ENV === 'production' ? 100 : 1000,
      // Payment service configurations
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
      PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
      // Email service configurations
      MAILERSEND_API_TOKEN: process.env.MAILERSEND_API_TOKEN,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      SENDGRID_FROM: process.env.SENDGRID_FROM,
      MAILERSEND_FROM: process.env.MAILERSEND_FROM,
      GMAIL_USER: process.env.GMAIL_USER,
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
      // Frontend configuration
      FRONTEND_URL: process.env.FRONTEND_URL,
      CLIENT_URL: process.env.CLIENT_URL,
    });
  } catch (error) {
    console.error('Environment validation failed:', error);
    console.error('Current environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
    });
    throw new Error('Invalid environment configuration');
  }
};

// Export configuration
export const config = loadEnvConfig();

// Helper functions for environment checks
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';

// Export individual config values with proper typing
export const {
  NODE_ENV,
  PORT,
  HOST,
  DATABASE_URL,
  SESSION_SECRET,
  CACHE_ENABLED,
  LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_WEBHOOK_SECRET,
  MAILERSEND_API_TOKEN,
  SENDGRID_API_KEY,
  SENDGRID_FROM,
  MAILERSEND_FROM,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  FRONTEND_URL,
  CLIENT_URL,
} = config;
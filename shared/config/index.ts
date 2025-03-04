import { z } from 'zod';

// Define environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().default('development_secret'),
  CACHE_ENABLED: z.boolean().default(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.number().default(100),
});

// Type inference
export type EnvConfig = z.infer<typeof envSchema>;

// Load and validate environment variables
const loadEnvConfig = (): EnvConfig => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET || process.env.REPL_ID,
      CACHE_ENABLED: process.env.NODE_ENV === 'production',
      LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
      RATE_LIMIT_MAX_REQUESTS: process.env.NODE_ENV === 'production' ? 100 : 1000,
    });
  } catch (error) {
    console.error('Environment validation failed:', error);
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
} = config;

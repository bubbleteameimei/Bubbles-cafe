import { z } from 'zod';

// Environment variable schema for the frontend
const envSchema = z.object({
  MODE: z.enum(['development', 'production']).default('development'),
  BASE_URL: z.string().default('http://localhost:5000'),
  API_TIMEOUT: z.number().default(30000),
  ENABLE_ANALYTICS: z.boolean().default(false),
  DEBUG_ENABLED: z.boolean().default(false),
  CACHE_DURATION: z.number().default(0), // in seconds
});

// Type inference
export type EnvConfig = z.infer<typeof envSchema>;

// Load and validate environment variables
const loadEnvConfig = (): EnvConfig => {
  try {
    return envSchema.parse({
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.VITE_BASE_URL,
      API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 30000,
      ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      DEBUG_ENABLED: import.meta.env.VITE_DEBUG_ENABLED === 'true',
      CACHE_DURATION: import.meta.env.VITE_CACHE_DURATION ? parseInt(import.meta.env.VITE_CACHE_DURATION) : 0,
    });
  } catch (error) {
    console.error('Frontend environment validation failed:', error);
    throw new Error('Invalid frontend environment configuration');
  }
};

// Export configuration
export const config = loadEnvConfig();

// Helper functions
export const isDevelopment = () => config.MODE === 'development';
export const isProduction = () => config.MODE === 'production';

// Export individual config values
export const {
  MODE,
  BASE_URL,
  API_TIMEOUT,
  ENABLE_ANALYTICS,
  DEBUG_ENABLED,
  CACHE_DURATION,
} = config;

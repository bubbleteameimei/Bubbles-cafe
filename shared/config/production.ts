import { config as baseConfig } from './index';

export const productionConfig = {
  ...baseConfig,
  // Production-specific overrides
  CORS_ORIGIN: process.env.ALLOWED_ORIGINS?.split(',') || [],
  CACHE_ENABLED: true,
  LOG_LEVEL: 'info',
  RATE_LIMIT_MAX_REQUESTS: 100,
  // Production-specific settings
  VITE_DEV_SERVER_ENABLED: false,
  HOT_RELOAD_ENABLED: false,
  API_TIMEOUT: 10000, // 10 seconds
  ERROR_STACK_ENABLED: false,
  DETAILED_LOGGING: false,
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },
};

export default productionConfig;

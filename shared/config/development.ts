import { config as baseConfig } from './index';

export const developmentConfig = {
  ...baseConfig,
  // Development-specific overrides
  CORS_ORIGIN: '*',
  CACHE_ENABLED: false,
  LOG_LEVEL: 'debug',
  RATE_LIMIT_MAX_REQUESTS: 1000,
  // Development-specific settings
  VITE_DEV_SERVER_ENABLED: true,
  HOT_RELOAD_ENABLED: true,
  API_TIMEOUT: 30000, // 30 seconds
  ERROR_STACK_ENABLED: true,
  DETAILED_LOGGING: true,
};

export default developmentConfig;

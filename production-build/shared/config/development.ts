import { config as baseConfig } from './index';
import { getSecurityConfig, getApiConfig } from './utils';

const { helmetOptions, corsOrigin } = getSecurityConfig();
const { timeoutMs, retryAttempts, rateLimitMax } = getApiConfig();

export const developmentConfig = {
  ...baseConfig,
  // Environment-specific overrides
  CORS_ORIGIN: corsOrigin,
  HELMET_OPTIONS: helmetOptions,
  // Development settings
  CACHE_ENABLED: false,
  LOG_LEVEL: 'debug',
  RATE_LIMIT_MAX_REQUESTS: rateLimitMax,
  API_TIMEOUT: timeoutMs,
  API_RETRY_ATTEMPTS: retryAttempts,
  // Development features
  VITE_DEV_SERVER_ENABLED: true,
  HOT_RELOAD_ENABLED: true,
  ERROR_STACK_ENABLED: true,
  DETAILED_LOGGING: true,
};

export default developmentConfig;
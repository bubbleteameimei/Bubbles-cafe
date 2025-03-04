import { config as baseConfig } from './index';
import { getSecurityConfig, getApiConfig } from './utils';

const { helmetOptions, corsOrigin } = getSecurityConfig();
const { timeoutMs, retryAttempts, rateLimitMax } = getApiConfig();

export const productionConfig = {
  ...baseConfig,
  // Environment-specific overrides
  CORS_ORIGIN: corsOrigin,
  HELMET_OPTIONS: helmetOptions,
  // Production settings
  CACHE_ENABLED: true,
  LOG_LEVEL: 'info',
  RATE_LIMIT_MAX_REQUESTS: rateLimitMax,
  API_TIMEOUT: timeoutMs,
  API_RETRY_ATTEMPTS: retryAttempts,
  // Production features
  VITE_DEV_SERVER_ENABLED: false,
  HOT_RELOAD_ENABLED: false,
  ERROR_STACK_ENABLED: false,
  DETAILED_LOGGING: false,
};

export default productionConfig;
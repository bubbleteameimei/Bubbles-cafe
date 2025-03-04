import { config } from './index';

/**
 * Environment utility functions for consistent environment checking
 */

export const getEnvironment = () => {
  return {
    isDevelopment: config.NODE_ENV === 'development',
    isProduction: config.NODE_ENV === 'production',
  };
};

export const getFeatureFlags = () => {
  const { isDevelopment } = getEnvironment();

  return {
    enableDebugLogging: isDevelopment || config.LOG_LEVEL === 'debug',
    enableDetailedErrors: isDevelopment,
    enableHotReload: isDevelopment,
    enableCache: config.CACHE_ENABLED,
    securityHeadersEnabled: !isDevelopment,
  };
};

export const getApiConfig = () => {
  const { isDevelopment } = getEnvironment();

  return {
    timeoutMs: isDevelopment ? 30000 : 10000,
    retryAttempts: isDevelopment ? 3 : 1,
    baseUrl: isDevelopment ? 'http://localhost:5000' : '/api',
    rateLimitMax: isDevelopment ? 1000 : 100,
    cacheEnabled: !isDevelopment,
  };
};

export const getSecurityConfig = () => {
  const { isDevelopment } = getEnvironment();

  return {
    corsOrigin: isDevelopment ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || [],
    helmetOptions: {
      contentSecurityPolicy: isDevelopment ? false : {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: "same-site" as const,
    },
  };
};

export const logEnvironmentConfig = () => {
  const { isDevelopment } = getEnvironment();
  const features = getFeatureFlags();
  const apiConfig = getApiConfig();
  const securityConfig = getSecurityConfig();

  console.log('\n=== Environment Configuration ===');
  console.log(`Mode: ${isDevelopment ? 'Development' : 'Production'}`);
  console.log('\n=== Feature Flags ===');
  Object.entries(features).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('\n=== API Configuration ===');
  Object.entries(apiConfig).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('\n=== Security Configuration ===');
  console.log('CORS Origin:', securityConfig.corsOrigin);
  console.log('Content Security Policy:', !isDevelopment);
  console.log('\n=============================\n');
};
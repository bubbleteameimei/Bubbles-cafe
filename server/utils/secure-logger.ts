import { createLogger } from './debug-logger';

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session'
];

// Fields to filter in production only
const PRODUCTION_FILTERED_FIELDS = [
  'email',
  'username',
  'ip',
  'userAgent'
];

export function createSecureLogger(moduleName: string) {
  const logger = createLogger(moduleName);
  const isProduction = process.env.NODE_ENV === 'production';

  const filterSensitiveData = (data: any): any => {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(filterSensitiveData);
    }

    const filtered = { ...data };
    const fieldsToFilter = isProduction 
      ? [...SENSITIVE_FIELDS, ...PRODUCTION_FILTERED_FIELDS]
      : SENSITIVE_FIELDS;

    fieldsToFilter.forEach(field => {
      if (field in filtered) {
        if (isProduction) {
          delete filtered[field];
        } else {
          filtered[field] = '[FILTERED]';
        }
      }
    });

    // Recursively filter nested objects
    Object.keys(filtered).forEach(key => {
      if (typeof filtered[key] === 'object' && filtered[key] !== null) {
        filtered[key] = filterSensitiveData(filtered[key]);
      }
    });

    return filtered;
  };

  return {
    debug: (message: string, data?: any) => logger.debug(message, filterSensitiveData(data)),
    info: (message: string, data?: any) => logger.info(message, filterSensitiveData(data)),
    warn: (message: string, data?: any) => logger.warn(message, filterSensitiveData(data)),
    error: (message: string, data?: any) => logger.error(message, filterSensitiveData(data))
  };
}
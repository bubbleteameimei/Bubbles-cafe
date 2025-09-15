// Client-side secure logger with conditional logging
const isDev = import.meta.env.DEV;
const isDebugMode = (typeof localStorage !== 'undefined' && localStorage.getItem('debug') === 'true') || isDev;

// Sensitive fields that should never be logged on client
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'email', // More restrictive on client
  'username'
];

const filterSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(filterSensitiveData);
  }

  const filtered = { ...data };
  SENSITIVE_FIELDS.forEach(field => {
    if (field in filtered) {
      filtered[field] = '[FILTERED]';
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

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDebugMode) {
      console.log(`[DEBUG] ${message}`, data ? filterSensitiveData(data) : '');
    }
  },
  info: (message: string, data?: any) => {
    if (isDev || isDebugMode) {
      console.info(`[INFO] ${message}`, data ? filterSensitiveData(data) : '');
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? filterSensitiveData(data) : '');
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data ? filterSensitiveData(data) : '');
  }
};

// Performance-optimized no-op logger for production
export const prodLogger = {
  debug: () => {},
  info: () => {},
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data ? filterSensitiveData(data) : '')
};

// Export the appropriate logger based on environment
export default isDev ? logger : prodLogger;
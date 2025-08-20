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
export function createSecureLogger(moduleName) {
    const logger = createLogger(moduleName);
    const isProduction = process.env.NODE_ENV === 'production';
    const filterSensitiveData = (data) => {
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
                }
                else {
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
        debug: (message, data) => logger.debug(message, filterSensitiveData(data)),
        info: (message, data) => logger.info(message, filterSensitiveData(data)),
        warn: (message, data) => logger.warn(message, filterSensitiveData(data)),
        error: (message, data) => logger.error(message, filterSensitiveData(data))
    };
}

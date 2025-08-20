/**
 * Logger Utility
 *
 * Provides a consistent logging interface for the application.
 */
/**
 * Simple logger interface with standard log levels
 */
const logger = {
    /**
     * Log an informational message
     *
     * @param message Log message
     * @param meta Optional metadata to include in the log
     */
    info: (message, meta) => {
        console.log(`[INFO] ${message}`, meta ? meta : '');
    },
    /**
     * Log a debug message (only in development)
     *
     * @param message Log message
     * @param meta Optional metadata to include in the log
     */
    debug: (message, meta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${message}`, meta ? meta : '');
        }
    },
    /**
     * Log a warning message
     *
     * @param message Log message
     * @param meta Optional metadata to include in the log
     */
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta ? meta : '');
    },
    /**
     * Log an error message
     *
     * @param message Log message
     * @param meta Optional metadata to include in the log
     */
    error: (message, meta) => {
        console.error(`[ERROR] ${message}`, meta ? meta : '');
    }
};
export default logger;

import { createSecureLogger } from './secure-logger';

// Default logger used across legacy modules. Provides .debug/.info/.warn/.error
// Exports an instance named for 'App' and also the factory to create named loggers.
const defaultLogger = createSecureLogger('App');

export default defaultLogger;
export { createSecureLogger };
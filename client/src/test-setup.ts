import { vi } from 'vitest';

// Basic test setup for Node environment
// No DOM APIs needed since tests don't use rendering

console.log('[test-setup] Initializing Node environment test setup');

// Only add minimal mocks if needed by tests
// Tests are now DOM-free so most browser mocks are unnecessary

// Global test utilities
(global as any).vi = vi;

console.log('[test-setup] Node environment test setup complete');
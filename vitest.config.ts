import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Early polyfills for jsdom/webidl-conversions compatibility
// Must be applied before any jsdom initialization occurs
console.log('[vitest-config] Applying early polyfills for webidl-conversions compatibility');

// Critical: SharedArrayBuffer polyfill
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  console.log('[vitest-config] Adding SharedArrayBuffer polyfill');
  (globalThis as any).SharedArrayBuffer = ArrayBuffer;
}

// Stream APIs polyfills
if (typeof globalThis.ReadableStream === 'undefined') {
  console.log('[vitest-config] Adding ReadableStream polyfill');
  (globalThis as any).ReadableStream = class ReadableStream {
    constructor() {}
    cancel() { return Promise.resolve(); }
    getReader() { return { read: () => Promise.resolve({ done: true, value: undefined }) }; }
  };
}

if (typeof globalThis.WritableStream === 'undefined') {
  console.log('[vitest-config] Adding WritableStream polyfill');
  (globalThis as any).WritableStream = class WritableStream {
    constructor() {}
    abort() { return Promise.resolve(); }
    getWriter() { return { write: () => Promise.resolve(), close: () => Promise.resolve() }; }
  };
}

if (typeof globalThis.TransformStream === 'undefined') {
  console.log('[vitest-config] Adding TransformStream polyfill');
  (globalThis as any).TransformStream = class TransformStream {
    constructor() {}
    get readable() { return new globalThis.ReadableStream(); }
    get writable() { return new globalThis.WritableStream(); }
  };
}

// Symbol polyfills
if (typeof globalThis.Symbol === 'object') {
  if (!Symbol.dispose) {
    console.log('[vitest-config] Adding Symbol.dispose polyfill');
    (Symbol as any).dispose = Symbol('Symbol.dispose');
  }
  if (!Symbol.asyncDispose) {
    console.log('[vitest-config] Adding Symbol.asyncDispose polyfill');
    (Symbol as any).asyncDispose = Symbol('Symbol.asyncDispose');
  }
}

// Additional critical globals that webidl-conversions might expect
if (typeof globalThis.AbortController === 'undefined') {
  console.log('[vitest-config] Adding AbortController polyfill');
  (globalThis as any).AbortController = class AbortController {
    signal = { aborted: false, addEventListener() {}, removeEventListener() {} };
    abort() { this.signal.aborted = true; }
  };
}

if (typeof globalThis.AbortSignal === 'undefined') {
  console.log('[vitest-config] Adding AbortSignal polyfill');
  (globalThis as any).AbortSignal = class AbortSignal {
    aborted = false;
    addEventListener() {}
    removeEventListener() {}
  };
}

console.log('[vitest-config] Polyfills applied successfully');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Temporarily disable setup files to eliminate any potential jsdom triggers
    // setupFiles: './client/src/test-setup.ts',
    include: ['client/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/backups/**', '**/Bubbles-cafe/**', '**/bubbles-cafe/**', '**/workspace/**', '**/*.bak.*', '**/*.old', '**/*.backup.*'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@shared': resolve(__dirname, './shared'),
    },
  },
});


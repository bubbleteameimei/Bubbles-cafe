import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Fix for webidl-conversions SharedArrayBuffer issue
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  (globalThis as any).SharedArrayBuffer = ArrayBuffer;
}

// Additional polyfills for jsdom/webidl-conversions compatibility
if (typeof globalThis.ReadableStream === 'undefined') {
  (globalThis as any).ReadableStream = class ReadableStream {};
}

if (typeof globalThis.WritableStream === 'undefined') {
  (globalThis as any).WritableStream = class WritableStream {};
}

if (typeof globalThis.TransformStream === 'undefined') {
  (globalThis as any).TransformStream = class TransformStream {};
}

// Fix for Symbol.dispose if not available
if (typeof globalThis.Symbol === 'object' && !Symbol.dispose) {
  (Symbol as any).dispose = Symbol('Symbol.dispose');
}

// Fix for Symbol.asyncDispose if not available
if (typeof globalThis.Symbol === 'object' && !Symbol.asyncDispose) {
  (Symbol as any).asyncDispose = Symbol('Symbol.asyncDispose');
}

// Only mock browser APIs if window is available (jsdom environment)
if (typeof window !== 'undefined') {
  // Mock window.matchMedia since it's not available in jsdom
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver for both Node and jsdom environments
if (typeof IntersectionObserver === 'undefined') {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Mock ResizeObserver for both Node and jsdom environments
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}
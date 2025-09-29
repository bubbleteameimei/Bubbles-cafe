
import { beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock window globals that might be undefined
beforeAll(() => {
  // Mock fetch if not available
  if (!global.fetch) {
    global.fetch = vi.fn()
  }

  // Mock URL if not available
  if (!global.URL) {
    global.URL = class URL {
      constructor(url: string, base?: string) {
        // Basic URL implementation for tests
      }
      toString() {
        return ''
      }
    } as any
  }

  // Mock URLSearchParams if not available
  if (!global.URLSearchParams) {
    global.URLSearchParams = class URLSearchParams {
      constructor(init?: string | string[][] | Record<string, string>) {}
      append(name: string, value: string) {}
      delete(name: string) {}
      get(name: string): string | null { return null }
      getAll(name: string): string[] { return [] }
      has(name: string): boolean { return false }
      set(name: string, value: string) {}
      toString(): string { return '' }
      forEach(callback: (value: string, key: string, parent: URLSearchParams) => void) {}
      keys(): IterableIterator<string> { return [][Symbol.iterator]() }
      values(): IterableIterator<string> { return [][Symbol.iterator]() }
      entries(): IterableIterator<[string, string]> { return [][Symbol.iterator]() }
      [Symbol.iterator](): IterableIterator<[string, string]> { return [][Symbol.iterator]() }
    } as any
  }

  // Mock crypto.randomUUID if not available
  if (!global.crypto) {
    global.crypto = {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    } as any
  }

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock scrollTo
  window.scrollTo = vi.fn()
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
  })
})

// Suppress console errors during tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

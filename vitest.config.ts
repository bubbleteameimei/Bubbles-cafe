
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./client/src/test-setup.ts'],
    include: ['client/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test-setup.ts'
      ]
    },
    // Fix JSDOM environment issues
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Prevent unhandled errors from causing test failures
    dangerouslyIgnoreUnhandledErrors: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  // Ensure proper environment variables
  define: {
    'process.env.NODE_ENV': '"test"'
  }
})

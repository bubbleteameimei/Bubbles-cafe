import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './client/src/test-setup.ts',
    include: ['client/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/backups/**', '**/Bubbles-cafe/**', '**/bubbles-cafe/**', '**/workspace/**', '**/*.bak.*', '**/*.old', '**/*.backup.*'],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
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


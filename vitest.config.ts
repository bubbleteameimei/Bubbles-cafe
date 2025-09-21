import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['client/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/backups/**', '**/Bubbles-cafe/**', '**/bubbles-cafe/**', '**/workspace/**', '**/*.bak.*', '**/*.old', '**/*.backup.*'],
  },
});


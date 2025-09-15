// Setup TypeScript interop for testing
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Allow importing TypeScript files directly
try {
  register('ts-node/esm', pathToFileURL('./'));
} catch (e) {
  console.error('Failed to register ts-node/esm', e);
}

export { db, sql } from '../server/db.js';
export { storage } from '../server/storage.js';
export * as schema from '../shared/schema.js';
export { eq } from 'drizzle-orm';
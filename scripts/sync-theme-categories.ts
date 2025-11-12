/**
 * Sync theme categories into the database so Supabase/DB reflect the themes
 * used by the website on the reader and index pages.
 *
 * Usage:
 *   tsx scripts/sync-theme-categories.ts
 */

import { initializeDatabaseConnection } from './connect-db';
import { THEME_CATEGORIES } from '../shared/theme-categories';

async function run() {
  const { pool } = await initializeDatabaseConnection();

  // Ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS theme_categories (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      icon TEXT,
      is_active BOOLEAN DEFAULT true NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Upsert categories from shared definitions
  const entries = Object.entries(THEME_CATEGORIES);
  for (let i = 0; i < entries.length; i++) {
    const [key, info] = entries[i];
    const label = String((info as any)?.label || key);
    const icon = String((info as any)?.icon || 'ghost');
    const sortOrder = i;

    await pool.query(
      `
      INSERT INTO theme_categories (key, label, icon, is_active, sort_order, updated_at)
      VALUES ($1, $2, $3, true, $4, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        label = EXCLUDED.label,
        icon = EXCLUDED.icon,
        is_active = true,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW();
      `,
      [key, label, icon, sortOrder]
    );
  }

  // Deactivate any categories not present in shared definitions
  const keys = entries.map(([k]) => k);
  await pool.query(
    `
    UPDATE theme_categories
    SET is_active = false, updated_at = NOW()
    WHERE key NOT IN (${keys.map((_, i) => `$${i + 1}`).join(', ')});
    `,
    keys
  );

  // Analyze for planner statistics
  try {
    await pool.query(`ANALYZE theme_categories;`);
  } catch {}

  console.log(`[Sync] Theme categories synchronized: ${entries.length} active, others deactivated`);
  process.exit(0);
}

run().catch(err => {
  console.error('[Sync] Failed to synchronize theme categories', err);
  process.exit(1);
});
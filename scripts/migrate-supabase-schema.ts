/**
 * Supabase schema migration helper.
 *
 * This script is designed to be safe to run multiple times. It focuses on:
 *   - Converting legacy JSON columns to JSONB where the current schema expects JSONB
 *   - Normalising monetary columns to NUMERIC with appropriate precision/scale
 *   - Aligning bookmarks.last_position with the Worker/client expectations (TEXT)
 *   - Tightening reading_progress so there is at most one row per (user_id, post_id)
 *     and foreign keys use ON DELETE CASCADE in line with the shared schema
 *   - Optionally adding a UNIQUE constraint for analytics.post_id when safe
 *
 * Usage:
 *   tsx scripts/migrate-supabase-schema.ts
 */

import { initializeDatabaseConnection } from './connect-db';

type ColumnInfo = {
  data_type: string | null;
  udt_name: string | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
};

/**
 * Check whether a table exists in the public schema.
 */
async function tableExists(client: any, tableName: string): Promise<boolean> {
  const res = await client.query(
    `
    SELECT to_regclass($1) AS oid
  `,
    [`public.${tableName}`],
  );
  return !!res.rows?.[0]?.oid;
}

/**
 * Fetch basic column metadata from information_schema.
 */
async function getColumnInfo(client: any, tableName: string, columnName: string): Promise<ColumnInfo | null> {
  const res = await client.query(
    `
    SELECT data_type, udt_name, numeric_precision, numeric_scale
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
      AND column_name = $2
  `,
    [tableName, columnName],
  );
  if (!res.rows.length) return null;
  const row = res.rows[0];
  return {
    data_type: row.data_type ?? null,
    udt_name: row.udt_name ?? null,
    numeric_precision: row.numeric_precision ?? null,
    numeric_scale: row.numeric_scale ?? null,
  };
}

/**
 * Convert legacy JSON columns to JSONB where appropriate.
 */
async function convertJsonColumns(client: any): Promise<void> {
  console.log('🔧 Converting legacy JSON columns to JSONB where needed...');

  const targets: Array<{ table: string; column: string }> = [
    { table: 'posts', column: 'metadata' },
    { table: 'comments', column: 'metadata' },
    { table: 'contact_messages', column: 'metadata' },
    { table: 'newsletter_subscriptions', column: 'metadata' },
    { table: 'user_feedback', column: 'metadata' },
    { table: 'analytics', column: 'device_stats' },
    { table: 'site_analytics', column: 'device_stats' },
    { table: 'activity_logs', column: 'details' },
    { table: 'users', column: 'metadata' },
  ];

  for (const target of targets) {
    const { table, column } = target;

    if (!(await tableExists(client, table))) {
      console.log(`  • Skipping ${table}.${column}: table does not exist`);
      continue;
    }

    const info = await getColumnInfo(client, table, column);
    if (!info) {
      console.log(`  • Skipping ${table}.${column}: column does not exist`);
      continue;
    }

    const dataType = (info.data_type || '').toLowerCase();
    const udtName = (info.udt_name || '').toLowerCase();

    if (dataType === 'jsonb' || udtName === 'jsonb') {
      console.log(`  • ${table}.${column} is already JSONB`);
      continue;
    }

    if (dataType !== 'json' && udtName !== 'json') {
      console.log(`  • Skipping ${table}.${column}: type is ${dataType || udtName}, not JSON/JSONB`);
      continue;
    }

    const identTable = `"${table}"`;
    const identColumn = `"${column}"`;

    console.log(`  → Converting ${table}.${column} from JSON to JSONB...`);
    try {
      await client.query(`
        ALTER TABLE ${identTable}
        ALTER COLUMN ${identColumn}
        TYPE JSONB
        USING ${identColumn}::jsonb
      `);
      console.log(`    ✓ Converted ${table}.${column} to JSONB`);
    } catch (err: any) {
      console.warn(
        `    ⚠️ Failed to convert ${table}.${column} to JSONB: ${err?.message || String(err)}`,
      );
    }
  }
}

/**
 * Normalise monetary columns to NUMERIC with fixed precision/scale.
 */
async function migrateMonetaryColumns(client: any): Promise<void> {
  console.log('🔧 Normalising monetary columns...');

  const patternLiteral = `'^[0-9]+(\\\\.[0-9]+)?$'`;

  const targets: Array<{
    table: string;
    column: string;
    precision: number;
    scale: number;
    setDefaultZero: boolean;
  }> = [
    {
      table: 'author_stats',
      column: 'total_tips',
      precision: 14,
      scale: 2,
      setDefaultZero: true,
    },
    {
      table: 'author_tips',
      column: 'amount',
      precision: 12,
      scale: 2,
      setDefaultZero: false,
    },
  ];

  for (const target of targets) {
    const { table, column, precision, scale, setDefaultZero } = target;

    if (!(await tableExists(client, table))) {
      console.log(`  • Skipping ${table}.${column}: table does not exist`);
      continue;
    }

    const info = await getColumnInfo(client, table, column);
    if (!info) {
      console.log(`  • Skipping ${table}.${column}: column does not exist`);
      continue;
    }

    const dataType = (info.data_type || '').toLowerCase();

    if (dataType === 'numeric') {
      console.log(`  • ${table}.${column} is already NUMERIC (${info.numeric_precision ?? '??'},${info.numeric_scale ?? '??'})`);
      continue;
    }

    const identTable = `"${table}"`;
    const identColumn = `"${column}"`;

    console.log(`  → Converting ${table}.${column} (${dataType || 'unknown'}) to NUMERIC(${precision},${scale})...`);
    try {
      await client.query(`
        ALTER TABLE ${identTable}
        ALTER COLUMN ${identColumn}
        TYPE NUMERIC(${precision}, ${scale})
        USING (
          CASE
            WHEN trim(${identColumn}::text) ~ ${patternLiteral}
            THEN ${identColumn}::numeric(${precision}, ${scale})
            ELSE 0
          END
        )
      `);

      if (setDefaultZero) {
        await client.query(`
          ALTER TABLE ${identTable}
          ALTER COLUMN ${identColumn}
          SET DEFAULT 0
        `);
      }

      console.log(`    ✓ Converted ${table}.${column} to NUMERIC(${precision},${scale})`);
    } catch (err: any) {
      console.warn(
        `    ⚠️ Failed to convert ${table}.${column} to NUMERIC: ${err?.message || String(err)}`,
      );
    }
  }
}

/**
 * Ensure bookmarks.last_position is stored as TEXT (string cursor), not DECIMAL.
 */
async function adjustBookmarksLastPosition(client: any): Promise<void> {
  console.log('🔧 Ensuring bookmarks.last_position is TEXT...');

  if (!(await tableExists(client, 'bookmarks'))) {
    console.log('  • Skipping bookmarks.last_position: bookmarks table does not exist');
    return;
  }

  const info = await getColumnInfo(client, 'bookmarks', 'last_position');
  if (!info) {
    console.log('  • Skipping bookmarks.last_position: column does not exist');
    return;
  }

  const dataType = (info.data_type || '').toLowerCase();

  if (dataType === 'text' || dataType === 'character varying' || dataType === 'varchar') {
    console.log('  • bookmarks.last_position is already a text type');
    return;
  }

  console.log(`  → Converting bookmarks.last_position from ${dataType || 'unknown'} to TEXT...`);
  try {
    await client.query(`
      ALTER TABLE "bookmarks"
      ALTER COLUMN "last_position"
      TYPE TEXT
      USING "last_position"::text
    `);

    await client.query(`
      ALTER TABLE "bookmarks"
      ALTER COLUMN "last_position"
      SET DEFAULT '0'
    `);

    console.log('    ✓ bookmarks.last_position converted to TEXT with default \'0\'');
  } catch (err: any) {
    console.warn(
      `    ⚠️ Failed to convert bookmarks.last_position to TEXT: ${err?.message || String(err)}`,
    );
  }
}

/**
 * Remove duplicate reading_progress rows so we can safely add a UNIQUE constraint.
 */
async function deduplicateReadingProgress(client: any): Promise<void> {
  console.log('🔧 Deduplicating reading_progress rows (by user_id, post_id)...');

  try {
    await client.query(`
      DELETE FROM reading_progress rp
      USING (
        SELECT id,
               row_number() OVER (
                 PARTITION BY user_id, post_id
                 ORDER BY last_read_at DESC, id DESC
               ) AS rn
        FROM reading_progress
      ) dup
      WHERE rp.id = dup.id
        AND dup.rn > 1
    `);
    console.log('  ✓ Duplicate reading_progress rows (if any) have been removed');
  } catch (err: any) {
    console.warn(
      `  ⚠️ Failed to deduplicate reading_progress: ${err?.message || String(err)}`,
    );
  }
}

/**
 * Ensure there is at most one reading_progress row per (user_id, post_id).
 */
async function addReadingProgressUniqueConstraint(client: any): Promise<void> {
  console.log('🔧 Ensuring UNIQUE(user_id, post_id) on reading_progress...');

  const res = await client.query(
    `
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'reading_progress'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'reading_progress_user_post_unique'
  `,
  );

  if (res.rows.length > 0) {
    console.log('  • UNIQUE constraint reading_progress_user_post_unique already exists');
    return;
  }

  try {
    await client.query(`
      ALTER TABLE reading_progress
      ADD CONSTRAINT reading_progress_user_post_unique
      UNIQUE (user_id, post_id)
    `);
    console.log('  ✓ Added UNIQUE(user_id, post_id) on reading_progress');
  } catch (err: any) {
    console.warn(
      `  ⚠️ Failed to add UNIQUE(user_id, post_id) on reading_progress: ${err?.message || String(err)}`,
    );
  }
}

/**
 * Ensure reading_progress foreign keys use ON DELETE CASCADE for post_id and user_id.
 */
async function ensureReadingProgressForeignKeys(client: any): Promise<void> {
  console.log('🔧 Ensuring reading_progress foreign keys use ON DELETE CASCADE...');

  type FKRow = {
    constraint_name: string;
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
    delete_rule: string;
    update_rule: string;
  };

  let rows: FKRow[] = [];
  try {
    const res = await client.query(
      `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
       AND tc.table_schema = rc.constraint_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'reading_progress'
    `,
    );
    rows = res.rows as FKRow[];
  } catch (err: any) {
    console.warn(
      `  ⚠️ Failed to inspect reading_progress foreign keys: ${err?.message || String(err)}`,
    );
    return;
  }

  const byColumn = (column: string) =>
    rows.filter((fk) => fk.column_name === column);

  async function ensureCascadeForColumn(
    column: 'post_id' | 'user_id',
    refTable: 'posts' | 'users',
  ) {
    const fks = byColumn(column);

    const hasCascade = fks.some(
      (fk) =>
        fk.foreign_table_name === refTable &&
        fk.delete_rule.toUpperCase() === 'CASCADE',
    );

    if (hasCascade) {
      console.log(`  • reading_progress.${column} already has ON DELETE CASCADE`);
      return;
    }

    // Drop existing FKs on this column (if any)
    for (const fk of fks) {
      try {
        console.log(
          `  → Dropping FK ${fk.constraint_name} on reading_progress.${column}`,
        );
        await client.query(
          `ALTER TABLE reading_progress DROP CONSTRAINT "${fk.constraint_name}"`,
        );
      } catch (err: any) {
        console.warn(
          `    ⚠️ Failed to drop constraint ${fk.constraint_name}: ${err?.message || String(err)}`,
        );
      }
    }

    // Add the desired FK
    const newName =
      column === 'post_id'
        ? 'reading_progress_post_id_fkey'
        : 'reading_progress_user_id_fkey';

    try {
      console.log(
        `  → Adding FK ${newName} ON DELETE CASCADE for reading_progress.${column} → ${refTable}.id`,
      );
      await client.query(`
        ALTER TABLE reading_progress
        ADD CONSTRAINT ${newName}
        FOREIGN KEY (${column})
        REFERENCES ${refTable}(id)
        ON DELETE CASCADE
      `);
      console.log(`    ✓ Added ${newName}`);
    } catch (err: any) {
      console.warn(
        `    ⚠️ Failed to add ${newName}: ${err?.message || String(err)}`,
      );
    }
  }

  await ensureCascadeForColumn('post_id', 'posts');
  await ensureCascadeForColumn('user_id', 'users');
}

/**
 * Optionally enforce UNIQUE(post_id) on analytics when safe.
 */
async function ensureAnalyticsUnique(client: any): Promise<void> {
  console.log('🔧 Checking analytics.post_id uniqueness...');

  if (!(await tableExists(client, 'analytics'))) {
    console.log('  • Skipping analytics uniqueness: analytics table does not exist');
    return;
  }

  // If there are duplicates, we log and skip creating the constraint.
  try {
    const dupRes = await client.query(`
      SELECT post_id, COUNT(*) AS c
      FROM analytics
      GROUP BY post_id
      HAVING COUNT(*) > 1
    `);

    if (dupRes.rows.length > 0) {
      console.warn(
        `  ⚠️ analytics has ${dupRes.rows.length} post_id value(s) with more than one row; skipping UNIQUE(post_id) constraint`,
      );
      return;
    }
  } catch (err: any) {
    console.warn(
      `  ⚠️ Failed to check analytics duplicates: ${err?.message || String(err)}`,
    );
    return;
  }

  // Check if the unique constraint already exists
  const res = await client.query(
    `
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'analytics'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'analytics_post_id_unique'
  `,
  );

  if (res.rows.length > 0) {
    console.log('  • UNIQUE constraint analytics_post_id_unique already exists');
    return;
  }

  try {
    await client.query(`
      ALTER TABLE analytics
      ADD CONSTRAINT analytics_post_id_unique
      UNIQUE (post_id)
    `);
    console.log('  ✓ Added UNIQUE(post_id) on analytics');
  } catch (err: any) {
    console.warn(
      `  ⚠️ Failed to add UNIQUE(post_id) on analytics: ${err?.message || String(err)}`,
    );
  }
}

async function migrateSupabaseSchema(): Promise<void> {
  console.log('🚀 Starting Supabase-compatible schema migration...');

  const { pool } = await initializeDatabaseConnection();
  const client = await pool.connect();

  try {
    await convertJsonColumns(client);
    await migrateMonetaryColumns(client);
    await adjustBookmarksLastPosition(client);

    if (await tableExists(client, 'reading_progress')) {
      await deduplicateReadingProgress(client);
      await addReadingProgressUniqueConstraint(client);
      await ensureReadingProgressForeignKeys(client);
    } else {
      console.log('ℹ️ reading_progress table not found, skipping reading progress fixes');
    }

    await ensureAnalyticsUnique(client);

    console.log('✅ Supabase schema migration completed');
  } catch (err: any) {
    console.error('❌ Supabase schema migration failed:', err);
    throw err;
  } finally {
    try {
      client.release();
    } catch {
      // ignore
    }
    try {
      await pool.end();
    } catch {
      // ignore
    }
  }
}

// Execute when run directly
if (require.main === module) {
  migrateSupabaseSchema().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { migrateSupabaseSchema };
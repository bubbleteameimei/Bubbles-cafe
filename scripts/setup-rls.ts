/**
 * Setup Supabase Row Level Security (RLS) policies for user-scoped tables.
 * This script enables RLS and creates conservative policies that allow users
 * to access only their own rows based on the mapping:
 *   users.metadata->>'supabaseUserId' = auth.uid()
 *
 * It also adds a public read policy for non-secret posts.
 *
 * Usage:
 *   tsx scripts/setup-rls.ts
 */

import { initializeDatabaseConnection } from './connect-db';

async function run() {
  const { pool } = await initializeDatabaseConnection();

  // Helper to execute SQL with logging
  async function execSQL(label: string, sql: string) {
    try {
      await pool.query(sql);
      console.log(`[RLS] ${label} - applied`);
    } catch (err: any) {
      console.warn(`[RLS] ${label} - ${err?.message || err}`);
    }
  }

  // Enable RLS on target tables
  const enableRlsTables = [
    'users',
    'posts',
    'reading_progress',
    'bookmarks',
    'comment_votes',
    'comment_reactions'
  ];

  for (const tbl of enableRlsTables) {
    await execSQL(`Enable RLS on ${tbl}`, `ALTER TABLE "${tbl}" ENABLE ROW LEVEL SECURITY;`);
  }

  // Users: allow user to read their own row (by supabase uid mapping or email)
  await execSQL(
    'Policy users_select_self',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_select_self'
  ) THEN
    CREATE POLICY users_select_self ON users
      FOR SELECT
      USING (
        (metadata ->> 'supabaseUserId') = auth.uid()
        OR lower(email) = lower(auth.email())
      );
  END IF;
END$$;
`
  );

  // Posts: public read of non-secret posts
  await execSQL(
    'Policy posts_public_read_non_secret',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'posts_public_read_non_secret'
  ) THEN
    CREATE POLICY posts_public_read_non_secret ON posts
      FOR SELECT
      USING (is_secret = false);
  END IF;
END$$;
`
  );

  // reading_progress: user can read/insert/update their own rows where users.metadata->>supabaseUserId = auth.uid()
  for (const kind of ['SELECT', 'UPDATE']) {
    await execSQL(
      `Policy reading_progress_${kind.toLowerCase()}_own`,
      `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reading_progress'
      AND policyname = 'reading_progress_${kind.toLowerCase()}_own'
  ) THEN
    CREATE POLICY reading_progress_${kind.toLowerCase()}_own ON reading_progress
      FOR ${kind}
      USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = reading_progress.user_id
            AND (u.metadata ->> 'supabaseUserId') = auth.uid()
        )
      );
  END IF;
END$$;
`
    );
  }
  await execSQL(
    'Policy reading_progress_insert_own',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reading_progress'
      AND policyname = 'reading_progress_insert_own'
  ) THEN
    CREATE POLICY reading_progress_insert_own ON reading_progress
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = reading_progress.user_id
            AND (u.metadata ->> 'supabaseUserId') = auth.uid()
        )
      );
  END IF;
END$$;
`
  );

  // bookmarks: user can read/insert/update/delete their own rows
  for (const kind of ['SELECT', 'UPDATE', 'DELETE']) {
    await execSQL(
      `Policy bookmarks_${kind.toLowerCase()}_own`,
      `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookmarks'
      AND policyname = 'bookmarks_${kind.toLowerCase()}_own'
  ) THEN
    CREATE POLICY bookmarks_${kind.toLowerCase()}_own ON bookmarks
      FOR ${kind}
      USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = bookmarks.user_id
            AND (u.metadata ->> 'supabaseUserId') = auth.uid()
        )
      );
  END IF;
END$$;
`
    );
  }
  await execSQL(
    'Policy bookmarks_insert_own',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookmarks'
      AND policyname = 'bookmarks_insert_own'
  ) THEN
    CREATE POLICY bookmarks_insert_own ON bookmarks
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = bookmarks.user_id
            AND (u.metadata ->> 'supabaseUserId') = auth.uid()
        )
      );
  END IF;
END$$;
`
  );

  // comment_votes: auth users can manage their own votes (user_id text = auth.uid())
  for (const kind of ['SELECT', 'UPDATE', 'DELETE']) {
    await execSQL(
      `Policy comment_votes_${kind.toLowerCase()}_own`,
      `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comment_votes'
      AND policyname = 'comment_votes_${kind.toLowerCase()}_own'
  ) THEN
    CREATE POLICY comment_votes_${kind.toLowerCase()}_own ON comment_votes
      FOR ${kind}
      USING (user_id = auth.uid());
  END IF;
END$$;
`
    );
  }
  await execSQL(
    'Policy comment_votes_insert_own',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comment_votes'
      AND policyname = 'comment_votes_insert_own'
  ) THEN
    CREATE POLICY comment_votes_insert_own ON comment_votes
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;
`
  );

  // comment_reactions: auth users can manage their own reactions (user_id text = auth.uid())
  for (const kind of ['SELECT', 'UPDATE', 'DELETE']) {
    await execSQL(
      `Policy comment_reactions_${kind.toLowerCase()}_own`,
      `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comment_reactions'
      AND policyname = 'comment_reactions_${kind.toLowerCase()}_own'
  ) THEN
    CREATE POLICY comment_reactions_${kind.toLowerCase()}_own ON comment_reactions
      FOR ${kind}
      USING (user_id = auth.uid());
  END IF;
END$$;
`
    );
  }
  await execSQL(
    'Policy comment_reactions_insert_own',
    `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comment_reactions'
      AND policyname = 'comment_reactions_insert_own'
  ) THEN
    CREATE POLICY comment_reactions_insert_own ON comment_reactions
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;
`
  );

  console.log('[RLS] Setup completed');
  process.exit(0);
}

run().catch(err => {
  console.error('[RLS] Setup failed', err);
  process.exit(1);
});
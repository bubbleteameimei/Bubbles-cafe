#!/usr/bin/env tsx

/**
 * Supabase Row Level Security (RLS) setup script.
 *
 * This script enables RLS on key tables and creates sane default policies
 * to allow public read where appropriate and enforce per-user access for
 * user-owned resources when accessed via Supabase (auth.uid()).
 *
 * Notes:
 * - Policies are idempotent: creation is wrapped in DO $ ... EXCEPTION WHEN duplicate_object THEN NULL; END $;
 * - This does not change server-side behavior where we connect as a privileged role.
 *   RLS policies will apply to requests made via Supabase (anon/authenticated roles),
 *   e.g., when using supabase-js in the client.
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function setupRLS() {
  try {
    console.log('🔐 Enabling Row Level Security (RLS) and creating policies...');

    // Helper to run blocks safely
    const run = async (label: string, block: string) => {
      try {
        await db.execute(sql.raw(block));
        console.log(`✅ ${label}`);
      } catch (e: any) {
        console.error(`❌ ${label} failed:`, e?.message || String(e));
        throw e;
      }
    };

    // Posts: public read of non-secret & not hidden posts
    await run('Enable RLS on posts', `ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`);
    await run('Posts select policy (public)', `
      DO $
      BEGIN
        CREATE POLICY posts_public_select ON posts
        FOR SELECT
        TO anon, authenticated
        USING ((is_secret = FALSE OR is_secret IS NULL) AND COALESCE((metadata->>'isHidden')::boolean, FALSE) = FALSE);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant read on posts to anon/authenticated', `GRANT SELECT ON posts TO anon, authenticated;`);

    // Comments: public read of approved comments
    await run('Enable RLS on comments', `ALTER TABLE comments ENABLE ROW LEVEL SECURITY;`);
    await run('Comments select policy (public)', `
      DO $
      BEGIN
        CREATE POLICY comments_public_select ON comments
        FOR SELECT
        TO anon, authenticated
        USING (is_approved = TRUE);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant read on comments to anon/authenticated', `GRANT SELECT ON comments TO anon, authenticated;`);

    // Comment Votes: authenticated users may manage their votes
    await run('Enable RLS on comment_votes', `ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;`);
    await run('Comment votes select policy (own)', `
      DO $
      BEGIN
        CREATE POLICY comment_votes_select_own ON comment_votes
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Comment votes insert policy (own)', `
      DO $
      BEGIN
        CREATE POLICY comment_votes_insert_own ON comment_votes
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant on comment_votes', `GRANT SELECT, INSERT, UPDATE, DELETE ON comment_votes TO authenticated;`);

    // Comment Reactions: authenticated users may create their reactions
    await run('Enable RLS on comment_reactions', `ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;`);
    await run('Comment reactions select policy (own)', `
      DO $
      BEGIN
        CREATE POLICY comment_reactions_select_own ON comment_reactions
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Comment reactions insert policy (own)', `
      DO $
      BEGIN
        CREATE POLICY comment_reactions_insert_own ON comment_reactions
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant on comment_reactions', `GRANT SELECT, INSERT, UPDATE, DELETE ON comment_reactions TO authenticated;`);

    // Post Likes: authenticated users may create/manage own likes
    await run('Enable RLS on post_likes', `ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;`);
    await run('Post likes select policy (own)', `
      DO $
      BEGIN
        CREATE POLICY post_likes_select_own ON post_likes
        FOR SELECT
        TO authenticated
        USING (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Post likes insert policy (own)', `
      DO $
      BEGIN
        CREATE POLICY post_likes_insert_own ON post_likes
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant on post_likes', `GRANT SELECT, INSERT, UPDATE, DELETE ON post_likes TO authenticated;`);

    // Reading Progress: authenticated users may read/write their own progress
    await run('Enable RLS on reading_progress', `ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;`);
    await run('Reading progress select policy (own)', `
      DO $
      BEGIN
        CREATE POLICY reading_progress_select_own ON reading_progress
        FOR SELECT
        TO authenticated
        USING (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Reading progress insert policy (own)', `
      DO $
      BEGIN
        CREATE POLICY reading_progress_insert_own ON reading_progress
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant on reading_progress', `GRANT SELECT, INSERT, UPDATE, DELETE ON reading_progress TO authenticated;`);

    // Bookmarks: authenticated users may read/write their own bookmarks
    await run('Enable RLS on bookmarks', `ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;`);
    await run('Bookmarks select policy (own)', `
      DO $
      BEGIN
        CREATE POLICY bookmarks_select_own ON bookmarks
        FOR SELECT
        TO authenticated
        USING (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Bookmarks insert policy (own)', `
      DO $
      BEGIN
        CREATE POLICY bookmarks_insert_own ON bookmarks
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id IN (SELECT id FROM users WHERE metadata->>'supabaseUserId' = auth.uid()));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant on bookmarks', `GRANT SELECT, INSERT, UPDATE, DELETE ON bookmarks TO authenticated;`);

    // Newsletter subscriptions: allow read of own email by authenticated users (optional)
    await run('Enable RLS on newsletter_subscriptions', `ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;`);
    await run('Newsletter select policy (own email)', `
      DO $
      BEGIN
        CREATE POLICY newsletter_select_own ON newsletter_subscriptions
        FOR SELECT
        TO authenticated
        USING (LOWER(email) = LOWER(current_setting('request.jwt.claim.email', true)));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $;
    `);
    await run('Grant read on newsletter_subscriptions', `GRANT SELECT ON newsletter_subscriptions TO authenticated;`);

    console.log('✅ RLS setup completed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ RLS setup failed:', error);
    process.exit(1);
  }
}

setupRLS();
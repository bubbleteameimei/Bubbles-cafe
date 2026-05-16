-- Enable Row Level Security on all 5 flagged public tables.
-- The backend uses the Supabase service_role key, which bypasses RLS,
-- so these policies only restrict direct access via the anon/authenticated keys.

-- ============================================================
-- 1. site_settings – public can read, only service_role writes
-- ============================================================
ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of site_settings"
  ON "public"."site_settings"
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service_role full access to site_settings"
  ON "public"."site_settings"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. activity_logs – admin/service_role only
-- ============================================================
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to activity_logs"
  ON "public"."activity_logs"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. contact_messages – anyone can insert, only service_role reads
-- ============================================================
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert of contact_messages"
  ON "public"."contact_messages"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service_role full access to contact_messages"
  ON "public"."contact_messages"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. post_reactions – public read, service_role write
--    (created outside migrations, may not exist in all environments)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_reactions') THEN
    ALTER TABLE "public"."post_reactions" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow public read of post_reactions"
      ON "public"."post_reactions"
      FOR SELECT
      USING (true);

    CREATE POLICY "Allow service_role full access to post_reactions"
      ON "public"."post_reactions"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  ELSE
    RAISE NOTICE 'Table post_reactions does not exist, skipping RLS setup';
  END IF;
END $$;

-- ============================================================
-- 5. wordpress_sync_runs – service_role only
--    (created outside migrations, may not exist in all environments)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wordpress_sync_runs') THEN
    ALTER TABLE "public"."wordpress_sync_runs" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow service_role full access to wordpress_sync_runs"
      ON "public"."wordpress_sync_runs"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  ELSE
    RAISE NOTICE 'Table wordpress_sync_runs does not exist, skipping RLS setup';
  END IF;
END $$;

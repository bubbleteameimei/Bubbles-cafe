-- Fix ambiguous "key" column reference in update_site_setting RPC.
-- Run in Supabase SQL Editor after 0002_upsert_wordpress_post.sql.

CREATE OR REPLACE FUNCTION public.update_site_setting(
  key text,
  value text,
  category text DEFAULT 'system',
  description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.site_settings AS ss (key, value, category, description, updated_at)
  VALUES (
    update_site_setting.key,
    update_site_setting.value,
    COALESCE(update_site_setting.category, 'system'),
    update_site_setting.description,
    now()
  )
  ON CONFLICT (key) DO UPDATE
  SET
    value = EXCLUDED.value,
    category = EXCLUDED.category,
    description = COALESCE(EXCLUDED.description, public.site_settings.description),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_site_setting(text, text, text, text) TO anon, authenticated, service_role;

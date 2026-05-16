-- WordPress sync RPC used by the Cloudflare Worker (/api/wordpress/sync/manual).
-- Run in Supabase SQL Editor if /api/health/supabase reports upsert_wordpress_post missing.

CREATE OR REPLACE FUNCTION public.upsert_wordpress_post(
  post_id bigint,
  title text,
  content text,
  excerpt text,
  slug text,
  date timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id integer;
  v_plain text;
  v_word_count integer;
  v_reading_time integer;
BEGIN
  SELECT id INTO v_author_id
  FROM users
  WHERE is_admin = true
  ORDER BY id
  LIMIT 1;

  IF v_author_id IS NULL THEN
    SELECT id INTO v_author_id FROM users ORDER BY id LIMIT 1;
  END IF;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION 'upsert_wordpress_post: no users row available for author_id';
  END IF;

  v_plain := regexp_replace(COALESCE(content, ''), '<[^>]+>', ' ', 'g');
  v_word_count := COALESCE(array_length(regexp_split_to_array(trim(v_plain), '\s+'), 1), 0);
  v_reading_time := GREATEST(1, CEIL(v_word_count::numeric / 200));

  INSERT INTO posts (
    title,
    content,
    excerpt,
    slug,
    author_id,
    reading_time_minutes,
    metadata,
    created_at
  )
  VALUES (
    COALESCE(NULLIF(trim(title), ''), 'Untitled Story'),
    COALESCE(content, ''),
    excerpt,
    slug,
    v_author_id,
    v_reading_time,
    json_build_object(
      'wordpressId', post_id,
      'source', 'wordpress_api'
    )::json,
    COALESCE(date, now())
  )
  ON CONFLICT (slug) DO UPDATE
  SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    excerpt = EXCLUDED.excerpt,
    reading_time_minutes = EXCLUDED.reading_time_minutes,
    metadata = COALESCE(posts.metadata, '{}'::json) || EXCLUDED.metadata,
    created_at = COALESCE(EXCLUDED.created_at, posts.created_at);
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_wordpress_post(bigint, text, text, text, text, timestamptz) TO anon, authenticated, service_role;

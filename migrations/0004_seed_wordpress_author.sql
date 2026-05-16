-- System author used by upsert_wordpress_post when syncing WordPress stories.
-- Requires at least one row in public.users because posts.author_id is NOT NULL.

INSERT INTO public.users (username, email, password_hash, is_admin)
VALUES (
  'wordpress',
  'wordpress-sync@bubblescafe.space',
  'sync-not-a-login',
  true
)
ON CONFLICT (email) DO NOTHING;

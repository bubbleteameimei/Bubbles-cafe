# Supabase setup (required for full backend health)

The Cloudflare Worker at `api.bubblescafe.space` uses Supabase for posts, auth mapping, bookmarks, and sync metadata. WordPress content is the source of truth until sync completes.

## 1. Verify health

```bash
curl https://api.bubblescafe.space/api/health/supabase
```

Healthy when:

- `status` is `ok` (not `degraded`)
- `rpc.upsert_wordpress_post.exists` is `true`
- `rpc.update_site_setting.ok` is `true`
- `schema.tables.posts` returns rows after sync

## 2. Apply SQL migrations (in order)

In [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor, run:

1. `migrations/0002_upsert_wordpress_post.sql`
2. `migrations/0003_fix_update_site_setting.sql`
3. `migrations/0004_seed_wordpress_author.sql`

## 3. Cloudflare Worker secrets

Ensure these are set on the Worker (`wrangler secret list`):

| Secret | Notes |
|--------|--------|
| `SUPABASE_URL` | `https://<project>.supabase.co` (no trailing slash) |
| `SUPABASE_ANON_KEY` | JWT (`eyJ...`) or publishable (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for WordPress sync |
| `WORDPRESS_SYNC_KEY` | Protects manual sync endpoint |

## 4. Run WordPress sync

```bash
curl -X POST https://api.bubblescafe.space/api/wordpress/sync/manual \
  -H "X-Sync-Key: YOUR_WORDPRESS_SYNC_KEY"
```

Then confirm posts exist:

```bash
curl "https://api.bubblescafe.space/api/posts?limit=3"
```

## 5. Deploy Worker after code changes

```bash
npx wrangler deploy
```

The Worker also falls back to live WordPress when the `posts` table is empty, but sync is still required for comments, reactions, and bookmarks tied to local post IDs.

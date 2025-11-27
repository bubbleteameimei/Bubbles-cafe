// Bookmarks domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import {
  json,
  proxyToBackend,
  getBearerToken,
  getSupabaseUserIdFromJwt,
  resolveLocalPostIdFromExternal,
} from './utils';

// Register all bookmark-related routes on the provided router instance.
export function registerBookmarksRoutes(router: any) {
  // GET /api/bookmarks - list all bookmarks for current user with post details
  router.get('/api/bookmarks', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const userHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const bookmarksUrl =
        `${baseUrl}/rest/v1/bookmarks?select=id,user_id,post_id,created_at,notes,tags,last_position` +
        `&order=created_at.desc&limit=500`;
      const res = await fetch(bookmarksUrl, { headers: userHeaders });

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }
      if (!res.ok) {
        return json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
      }

      const raw = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(raw) || raw.length === 0) {
        return json([]);
      }

      const postIds = Array.from(
        new Set(
          raw
            .map((b: any) => Number(b.post_id))
            .filter((n: number) => Number.isFinite(n)),
        ),
      );
      const postsMap = new Map<number, any>();

      if (postIds.length > 0) {
        const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
        postsUrl.searchParams.set('select', 'id,title,slug,excerpt,created_at');
        postsUrl.searchParams.set('id', `in.(${postIds.join(',')})`);

        const postsRes = await fetch(postsUrl.toString(), {
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            Accept: 'application/json',
          },
        });

        if (postsRes.ok) {
          const postsRows = (await postsRes.json().catch(() => [])) as any[];
          if (Array.isArray(postsRows)) {
            for (const p of postsRows) {
              const id = Number(p.id);
              if (Number.isFinite(id)) {
                postsMap.set(id, {
                  id,
                  title: p.title,
                  slug: p.slug,
                  excerpt: p.excerpt,
                  createdAt: p.created_at,
                });
              }
            }
          }
        }
      }

      const enriched = raw
        .map((b: any) => {
          const postId = Number(b.post_id);
          const post = postsMap.get(postId);
          if (!post) return null;
          return {
            id: b.id,
            userId: typeof b.user_id === 'number' ? b.user_id : undefined,
            postId,
            createdAt: b.created_at,
            notes: b.notes ?? null,
            tags: Array.isArray(b.tags) ? b.tags : null,
            lastPosition:
              typeof b.last_position === 'string' && b.last_position
                ? b.last_position
                : '0',
            post,
          };
        })
        .filter((b) => b !== null);

      return json(enriched);
    } catch {
      return json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }
  });

  // GET /api/bookmarks/tag/:tag - list bookmarks filtered by tag for current user
  router.get('/api/bookmarks/tag/:tag', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const tag = decodeURIComponent(segments[segments.length - 1] || '').trim();
      if (!tag) {
        return json({ success: false, message: 'Tag is required' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const userHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const bookmarksUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      bookmarksUrl.searchParams.set(
        'select',
        'id,user_id,post_id,created_at,notes,tags,last_position',
      );
      bookmarksUrl.searchParams.set('tags', `cs.{${tag}}`);
      bookmarksUrl.searchParams.set('order', 'created_at.desc');
      bookmarksUrl.searchParams.set('limit', '500');

      const res = await fetch(bookmarksUrl.toString(), {
        headers: userHeaders,
      });

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }
      if (!res.ok) {
        return json(
          { success: false, message: 'Failed to fetch bookmarks by tag' },
          { status: 500 },
        );
      }

      const raw = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(raw) || raw.length === 0) {
        return json([]);
      }

      const postIds = Array.from(
        new Set(
          raw
            .map((b: any) => Number(b.post_id))
            .filter((n: number) => Number.isFinite(n)),
        ),
      );
      const postsMap = new Map<number, any>();

      if (postIds.length > 0) {
        const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
        postsUrl.searchParams.set('select', 'id,title,slug,excerpt,created_at');
        postsUrl.searchParams.set('id', `in.(${postIds.join(',')})`);

        const postsRes = await fetch(postsUrl.toString(), {
          headers: {
            apikey: env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            Accept: 'application/json',
          },
        });

        if (postsRes.ok) {
          const postsRows = (await postsRes.json().catch(() => [])) as any[];
          if (Array.isArray(postsRows)) {
            for (const p of postsRows) {
              const id = Number(p.id);
              if (Number.isFinite(id)) {
                postsMap.set(id, {
                  id,
                  title: p.title,
                  slug: p.slug,
                  excerpt: p.excerpt,
                  createdAt: p.created_at,
                });
              }
            }
          }
        }
      }

      const enriched = raw
        .map((b: any) => {
          const postId = Number(b.post_id);
          const post = postsMap.get(postId);
          if (!post) return null;
          return {
            id: b.id,
            userId: typeof b.user_id === 'number' ? b.user_id : undefined,
            postId,
            createdAt: b.created_at,
            notes: b.notes ?? null,
            tags: Array.isArray(b.tags) ? b.tags : null,
            lastPosition:
              typeof b.last_position === 'string' && b.last_position
                ? b.last_position
                : '0',
            post,
          };
        })
        .filter((b) => b !== null);

      return json(enriched);
    } catch {
      return json(
        { success: false, message: 'Failed to fetch bookmarks by tag' },
        { status: 500 },
      );
    }
  });

  // GET /api/bookmarks/:postId - check bookmark status for current user
  router.get('/api/bookmarks/:postId', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const rawIdStr = segments[segments.length - 1] || '';
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json({ success: false, message: 'Invalid post ID' }, { status: 400 });
      }

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json({ success: false, message: 'Post not found' }, { status: 404 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const userHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const url = new URL(`${baseUrl}/rest/v1/bookmarks`);
      url.searchParams.set(
        'select',
        'id,user_id,post_id,created_at,notes,tags,last_position',
      );
      url.searchParams.set('post_id', `eq.${postId}`);
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), {
        headers: userHeaders,
      });

      if (res.status === 401 || res.status === 403) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }
      if (!res.ok) {
        return json(
          { success: false, message: 'Failed to check bookmark status' },
          { status: 500 },
        );
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const bookmarked = Array.isArray(rows) && rows.length > 0;
      const row = bookmarked ? rows[0] : null;

      if (!bookmarked || !row) {
        return json({
          success: true,
          bookmarked: false,
          bookmark: null,
        });
      }

      const bookmark = {
        id: row.id,
        userId: typeof row.user_id === 'number' ? row.user_id : undefined,
        postId: Number(row.post_id),
        createdAt: row.created_at,
        notes: row.notes ?? null,
        tags: Array.isArray(row.tags) ? row.tags : null,
        lastPosition:
          typeof row.last_position === 'string' && row.last_position
            ? row.last_position
            : '0',
      };

      return json({
        success: true,
        bookmarked: true,
        bookmark,
      });
    } catch {
      return json(
        { success: false, message: 'Failed to check bookmark status' },
        { status: 500 },
      );
    }
  });

  // POST /api/bookmarks/:postId - create or update bookmark with optional notes/tags
  router.post('/api/bookmarks/:postId', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const rawIdStr = segments[segments.length - 1] || '';
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json({ success: false, message: 'Invalid post ID' }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const notes = typeof body.notes === 'string' ? body.notes : undefined;
      const tags =
        Array.isArray(body.tags) && body.tags.length ? (body.tags as string[]) : undefined;

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json({ success: false, message: 'Post not found' }, { status: 404 });
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      // Check for existing bookmark
      const checkUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      checkUrl.searchParams.set(
        'select',
        'id,user_id,post_id,created_at,notes,tags,last_position',
      );
      checkUrl.searchParams.set('user_id', `eq.${userId}`);
      checkUrl.searchParams.set('post_id', `eq.${postId}`);
      checkUrl.searchParams.set('limit', '1');

      const checkRes = await fetch(checkUrl.toString(), {
        headers,
      });

      if (checkRes.status === 401 || checkRes.status === 403) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }
      if (!checkRes.ok) {
        return json(
          { success: false, message: 'Failed to bookmark post' },
          { status: 500 },
        );
      }

      const existingRows = (await checkRes.json().catch(() => [])) as any[];
      const existing =
        Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

      if (existing) {
        if (notes !== undefined || tags !== undefined) {
          const updateUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
          updateUrl.searchParams.set('user_id', `eq.${userId}`);
          updateUrl.searchParams.set('post_id', `eq.${postId}`);

          const updateBody: Record<string, any> = {};
          if (notes !== undefined) updateBody.notes = notes;
          if (tags !== undefined) updateBody.tags = tags;

          const updRes = await fetch(updateUrl.toString(), {
            method: 'PATCH',
            headers: {
              ...headers,
              Prefer: 'return=representation',
            },
            body: JSON.stringify(updateBody),
          });

          if (!updRes.ok) {
            return json(
              {
                success: false,
                message: 'Failed to update bookmark details',
              },
              { status: 500 },
            );
          }

          const updRows = (await updRes.json().catch(() => [])) as any[];
          const updated = Array.isArray(updRows) && updRows.length > 0 ? updRows[0] : existing;

          return json({
            success: true,
            message: 'Post already bookmarked; details updated',
            bookmark: updated,
          });
        }

        return json({
          success: true,
          message: 'Post already bookmarked',
          bookmark: existing,
        });
      }

      // Insert new bookmark
      const insertRes = await fetch(`${baseUrl}/rest/v1/bookmarks`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          user_id: userId,
          post_id: postId,
          notes: notes ?? null,
          tags: tags ?? null,
          last_position: '0',
        }),
      });

      if (insertRes.status === 401 || insertRes.status === 403) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }
      if (!insertRes.ok) {
        return json(
          { success: false, message: 'Failed to bookmark post' },
          { status: 500 },
        );
      }

      const insRows = (await insertRes.json().catch(() => [])) as any[];
      const inserted = Array.isArray(insRows) && insRows.length > 0 ? insRows[0] : null;

      return json(
        {
          success: true,
          message: 'Post bookmarked successfully',
          bookmark: inserted,
        },
        { status: 201 },
      );
    } catch {
      return json(
        { success: false, message: 'Failed to bookmark post' },
        { status: 500 },
      );
    }
  });

  // PATCH /api/bookmarks/:postId - update notes/tags/lastPosition for a bookmark
  router.patch('/api/bookmarks/:postId', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const rawIdStr = segments[segments.length - 1] || '';
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json({ success: false, message: 'Invalid post ID' }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const notes = typeof body.notes === 'string' ? body.notes : undefined;
      const tags =
        Array.isArray(body.tags) && body.tags.length ? (body.tags as string[]) : undefined;
      const lastPosition =
        typeof body.lastPosition === 'string' ? body.lastPosition : undefined;

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json({ success: false, message: 'Post not found' }, { status: 404 });
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const updateBody: Record<string, any> = {};
      if (notes !== undefined) updateBody.notes = notes;
      if (tags !== undefined) updateBody.tags = tags;
      if (lastPosition !== undefined) updateBody.last_position = lastPosition;

      if (Object.keys(updateBody).length === 0) {
        return json({ success: false, message: 'No updates provided' }, { status: 400 });
      }

      const updateUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      updateUrl.searchParams.set('user_id', `eq.${userId}`);
      updateUrl.searchParams.set('post_id', `eq.${postId}`);

      const updRes = await fetch(updateUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(updateBody),
      });

      if (updRes.status === 401 || updRes.status === 403) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }
      if (!updRes.ok) {
        return json(
          { success: false, message: 'Failed to update bookmark' },
          { status: 500 },
        );
      }

      const rows = (await updRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { success: false, message: 'Bookmark not found' },
          { status: 404 },
        );
      }

      return json({
        success: true,
        bookmark: rows[0],
      });
    } catch {
      return json(
        { success: false, message: 'Failed to update bookmark' },
        { status: 500 },
      );
    }
  });

  // DELETE /api/bookmarks/:postId - remove a bookmark
  router.delete('/api/bookmarks/:postId', async (req: Request, env: Env) => {
    const token = getBearerToken(req);
    if (!token || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const rawIdStr = segments[segments.length - 1] || '';
      const rawPostId = parseInt(decodeURIComponent(rawIdStr), 10);
      if (!Number.isFinite(rawPostId)) {
        return json({ success: false, message: 'Invalid post ID' }, { status: 400 });
      }

      const postId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(postId || NaN)) {
        return json({ success: false, message: 'Post not found' }, { status: 404 });
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const deleteUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
      deleteUrl.searchParams.set('user_id', `eq.${userId}`);
      deleteUrl.searchParams.set('post_id', `eq.${postId}`);

      const delRes = await fetch(deleteUrl.toString(), {
        method: 'DELETE',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
      });

      if (delRes.status === 401 || delRes.status === 403) {
        return json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        );
      }
      if (!delRes.ok) {
        return json(
          { success: false, message: 'Failed to remove bookmark' },
          { status: 500 },
        );
      }

      const rows = (await delRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json(
          { success: false, message: 'Bookmark not found' },
          { status: 404 },
        );
      }

      return json({
        success: true,
        message: 'Bookmark removed successfully',
        bookmark: rows[0],
      });
    } catch {
      return json(
        { success: false, message: 'Failed to remove bookmark' },
        { status: 500 },
      );
    }
  });

  // GET /api/bookmarks/migrate - dry-run migratable count (JWT clients use localStorage; return 0)
  // Legacy/session clients without JWT still proxy to backend.
  router.get('/api/bookmarks/migrate', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }
    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }
    // For Supabase-JWT clients we no longer track anonymous bookmarks on the server.
    // Migration uses client-provided local payload only, so report zero migratable here.
    return json({ success: true, migratable: 0 });
  });

  // POST /api/bookmarks/migrate - import anonymous/local bookmarks into authenticated account
  router.post('/api/bookmarks/migrate', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }
    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    try {
      const body = (await (req as any).json?.()) || {};
      const localPayload =
        body && typeof body.local === 'object' && body.local !== null
          ? (body.local as Record<string, any>)
          : null;

      const entries = localPayload ? Object.entries(localPayload) : [];
      if (!entries.length) {
        // Nothing to migrate; cleared flag reflects whether client passed local payload or not
        return json({ success: true, migrated: 0, cleared: !!localPayload });
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json(
          { success: false, message: 'User not authenticated' },
          { status: 401 },
        );
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      let migrated = 0;

      for (const [rawId, b] of entries as [string, any][]) {
        const wpOrLocalId = Number(rawId);
        if (!Number.isFinite(wpOrLocalId)) continue;

        const postId = await resolveLocalPostIdFromExternal(env, wpOrLocalId);
        if (!Number.isFinite(postId || NaN)) continue;

        // Check if bookmark already exists for this user/post
        try {
          const checkUrl = new URL(`${baseUrl}/rest/v1/bookmarks`);
          checkUrl.searchParams.set('select', 'id');
          checkUrl.searchParams.set('user_id', `eq.${userId}`);
          checkUrl.searchParams.set('post_id', `eq.${postId}`);
          checkUrl.searchParams.set('limit', '1');

          const checkRes = await fetch(checkUrl.toString(), {
            headers,
          });

          if (!checkRes.ok) {
            // Skip this entry on error; continue with others
            continue;
          }

          const existing = (await checkRes.json().catch(() => [])) as any[];
          if (Array.isArray(existing) && existing.length > 0) {
            // Already bookmarked
            continue;
          }

          const insertBody: Record<string, any> = {
            user_id: userId,
            post_id: postId,
            notes: b?.notes ?? null,
            tags: Array.isArray(b?.tags) ? b.tags : null,
            last_position:
              typeof b?.lastPosition === 'string' && b.lastPosition
                ? b.lastPosition
                : '0',
          };

          const insRes = await fetch(`${baseUrl}/rest/v1/bookmarks`, {
            method: 'POST',
            headers: {
              ...headers,
              Prefer: 'return=representation',
            },
            body: JSON.stringify(insertBody),
          });

          if (insRes.ok) {
            migrated += 1;
          }
        } catch {
          // Ignore individual failures; continue migrating others
          continue;
        }
      }

      return json({ success: true, migrated, cleared: true });
    } catch {
      return json(
        { success: false, message: 'Failed to migrate bookmarks' },
        { status: 500 },
      );
    }
  });
}
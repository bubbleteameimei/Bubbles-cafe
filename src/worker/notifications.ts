// User notifications routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import {
  json,
  proxyToBackend,
  getBearerToken,
  getSupabaseUserIdFromJwt,
} from './utils';

// Register all notifications-related routes on the provided router instance.
export function registerNotificationsRoutes(router: any) {
  // GET /api/notifications - list notifications for current user
  router.get('/api/notifications', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    try {
      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const url = new URL(`${baseUrl}/rest/v1/user_notifications`);
      url.searchParams.set(
        'select',
        'id,user_id,type,title,message,metadata,is_read,created_at',
      );
      url.searchParams.set('user_id', `eq.${userId}`);
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', '50');

      const res = await fetch(url.toString(), {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }
      if (!res.ok) {
        return json({ error: 'Failed to list notifications' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows)) {
        return json({ notifications: [] });
      }

      return json({ notifications: rows });
    } catch {
      return json({ error: 'Failed to list notifications' }, { status: 500 });
    }
  });

  // POST /api/notifications - create a notification for current user
  router.post('/api/notifications', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    try {
      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }

      let body: any;
      try {
        body = (await (req as any).json?.().catch(() => ({}))) || {};
      } catch {
        body = {};
      }

      const type = typeof body.type === 'string' && body.type.trim() ? body.type.trim() : null;
      const title =
        typeof body.title === 'string' && body.title.trim() ? body.title.trim() : null;
      const message =
        typeof body.message === 'string' && body.message.trim() ? body.message.trim() : null;
      const metadata =
        body && typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : {};

      if (!type || !title || !message) {
        return json({ error: 'Invalid payload' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/rest/v1/user_notifications`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          user_id: Number(userId),
          type,
          title,
          message,
          metadata,
          is_read: false,
          created_at: new Date().toISOString(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }
      if (!res.ok) {
        return json({ error: 'Failed to create notification' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const created = Array.isArray(rows) && rows.length ? rows[0] : null;

      return json({ notification: created }, { status: 201 });
    } catch {
      return json({ error: 'Failed to create notification' }, { status: 500 });
    }
  });

  // PATCH /api/notifications/:id/read - mark as read/unread for current user
  router.patch('/api/notifications/:id/read', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    const token = getBearerToken(req);
    if (!token) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      // /api/notifications/:id/read -> ["api","notifications",":id","read"]
      const idSegment = segments[2] || '';
      const id = parseInt(decodeURIComponent(idSegment), 10);
      if (!Number.isFinite(id)) {
        return json({ error: 'Invalid id' }, { status: 400 });
      }

      const userId = await getSupabaseUserIdFromJwt(env, token);
      if (!Number.isFinite(userId || NaN)) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }

      let body: any;
      try {
        body = (await (req as any).json?.().catch(() => ({}))) || {};
      } catch {
        body = {};
      }
      const isRead = typeof body.isRead === 'boolean' ? body.isRead : true;

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const updateUrl = new URL(`${baseUrl}/rest/v1/user_notifications`);
      updateUrl.searchParams.set('id', `eq.${id}`);
      updateUrl.searchParams.set('user_id', `eq.${userId}`);

      const res = await fetch(updateUrl.toString(), {
        method: 'PATCH',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ is_read: !!isRead }),
      });

      if (res.status === 401 || res.status === 403) {
        return json({ error: 'Authentication required' }, { status: 401 });
      }
      if (!res.ok) {
        return json({ error: 'Failed to update notification' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      const updated = Array.isArray(rows) && rows.length ? rows[0] : null;

      if (!updated) {
        return json({ error: 'Notification not found' }, { status: 404 });
      }

      return json({ notification: updated });
    } catch {
      return json({ error: 'Failed to update notification' }, { status: 500 });
    }
  });
}
// Comments domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import {
  json,
  proxyToBackend,
  getBearerToken,
  getSupabaseUserIdFromJwt,
  getSupabaseCurrentUser,
  resolveLocalPostIdFromExternal,
} from './utils';

function parseCookies(header: string | null): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  try {
    const parts = header.split(';');
    for (const part of parts) {
      const [name, ...rest] = part.split('=');
      const key = name.trim();
      if (!key) continue;
      const value = rest.join('=').trim();
      if (!value) continue;
      result[key] = decodeURIComponent(value);
    }
  } catch {
    // ignore parse errors
  }
  return result;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let str = '';
  for (const b of u8) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function signAnonCommentId(env: Env, id: string): Promise<string> {
  const secret = (env.CSRF_SECRET || '').trim();
  if (!secret) return id;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(id));
  return `${id}.${base64UrlEncode(sig)}`;
}

async function verifySignedAnonCommentId(env: Env, signed: string): Promise<string | null> {
  const secret = (env.CSRF_SECRET || '').trim();
  if (!secret) return signed || null;

  const lastDot = signed.lastIndexOf('.');
  if (lastDot <= 0) return null;

  const id = signed.slice(0, lastDot);
  const sigB64 = signed.slice(lastDot + 1);
  if (!id || !sigB64) return null;

  let sigBytes: Uint8Array;
  try {
    const padded = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(padded + '==='.slice((padded.length + 3) % 4));
    sigBytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) sigBytes[i] = raw.charCodeAt(i);
  } catch {
    return null;
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(id),
    );

    return ok ? id : null;
  } catch {
    return null;
  }
}

async function getAnonCommentIdFromCookie(env: Env, header: string | null): Promise<string | null> {
  const cookies = parseCookies(header);
  const raw = cookies['anon_comment_id'] || null;
  if (!raw) return null;
  return verifySignedAnonCommentId(env, raw);
}

function makeAnonCommentId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

// Register all comments-related routes on the provided router instance.
export function registerCommentsRoutes(router: any) {
  // GET /api/posts/:postId/comments - list comments for a post
  router.get('/api/posts/:postId/comments', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const rawPostId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(rawPostId) || rawPostId <= 0) {
        return json({ error: 'Invalid post id' }, { status: 400 });
      }

      const localPostId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(localPostId || NaN)) {
        return json([]);
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };

      const commentsUrl = new URL(`${baseUrl}/rest/v1/comments`);
      commentsUrl.searchParams.set(
        'select',
        'id,content,post_id,user_id,is_approved,edited,edited_at,metadata,created_at,parent_id',
      );
      commentsUrl.searchParams.set('post_id', `eq.${Number(localPostId)}`);
      commentsUrl.searchParams.set('order', 'created_at.desc');
      commentsUrl.searchParams.set('limit', '500');

      const res = await fetch(commentsUrl.toString(), { headers });
      if (res.status === 401 || res.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!res.ok) {
        return json({ error: 'Failed to fetch comments' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json([]);
      }

      let userKey: string | null = null;
      const token = getBearerToken(req);
      if (token) {
        const userId = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(userId || NaN)) {
          userKey = String(userId);
        }
      }

      if (!userKey) {
        const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
        const anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
        if (anonId) {
          userKey = `anon:${anonId}`;
        }
      }

      const enhanced = rows.map((row: any) => {
        let metadata = row.metadata;
        if (metadata && typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = {};
          }
        }
        if (!metadata || typeof metadata !== 'object') {
          metadata = {};
        }
        const meta = metadata as any;

        const baseApproved =
          (row as any).approved === undefined
            ? Boolean(row.is_approved)
            : Boolean((row as any).approved);

        const ownerKey = meta && meta.ownerKey != null ? String(meta.ownerKey) : null;
        const isOwner = !!userKey && !!ownerKey && String(ownerKey) === userKey;
        const uxApproved = baseApproved || isOwner;

        const author = (meta && meta.author) || (meta && meta.name) || 'Guest';

        return {
          id: row.id,
          content: row.content ?? '',
          createdAt: row.created_at,
          metadata: {
            ...meta,
            author,
          },
          is_approved: row.is_approved === true,
          approved: uxApproved,
          parentId: row.parent_id != null ? Number(row.parent_id) : null,
          isOwner,
        };
      });

      return json(enhanced);
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // POST /api/posts/:postId/comments - create a new comment or reply
  router.post('/api/posts/:postId/comments', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const rawPostId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(rawPostId) || rawPostId <= 0) {
        return json({ error: 'Invalid post id' }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const rawContent = typeof body.content === 'string' ? body.content : '';
      const content = rawContent.trim();
      if (!content) {
        return json({ error: 'Content is required' }, { status: 400 });
      }

      const localPostId = await resolveLocalPostIdFromExternal(env, rawPostId);
      if (!Number.isFinite(localPostId || NaN)) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const token = getBearerToken(req);
      let userId: number | null = null;
      if (token) {
        const uid = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(uid || NaN)) {
          userId = Number(uid);
        }
      }

      const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
      let anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
      let setAnonCookie = false;
      if (!userId && !anonId) {
        anonId = makeAnonCommentId();
        setAnonCookie = true;
      }

      const userKey =
        userId != null && Number.isFinite(userId) ? String(userId) : `anon:${String(anonId)}`;

      const authorFromBody = typeof body.author === 'string' ? body.author.trim() : '';
      const author = authorFromBody || (userId != null ? 'User' : 'Guest');

      const needsModeration = Boolean(body.needsModeration === true);
      const moderationStatus = String(body.moderationStatus || '').toLowerCase();
      const holdForReview =
        needsModeration || moderationStatus === 'flagged' || moderationStatus === 'under_review';

      const isApproved = !holdForReview;

      const selectionStart =
        typeof body.selectionStart === 'number'
          ? body.selectionStart
          : Number.isFinite(Number(body.selectionStart))
            ? Number(body.selectionStart)
            : undefined;
      const selectionEnd =
        typeof body.selectionEnd === 'number'
          ? body.selectionEnd
          : Number.isFinite(Number(body.selectionEnd))
            ? Number(body.selectionEnd)
            : undefined;
      const anchorParagraphIndex =
        typeof body.anchorParagraphIndex === 'number'
          ? body.anchorParagraphIndex
          : Number.isFinite(Number(body.anchorParagraphIndex))
            ? Number(body.anchorParagraphIndex)
            : undefined;
      const selectionText = typeof body.selectionText === 'string' ? body.selectionText : undefined;

      const metadata: any = {
        author,
        isAnonymous: !userId,
        moderated: holdForReview,
        originalContent: content,
        replyCount: 0,
        ownerKey: userKey,
      };

      if (selectionText && selectionStart != null && selectionEnd != null) {
        metadata.selectionAnchor = {
          startOffset: Number(selectionStart),
          endOffset: Number(selectionEnd),
          paragraphIndex: anchorParagraphIndex != null ? Number(anchorParagraphIndex) : undefined,
          text: selectionText,
        };
      }

      const parentIdRaw = (body as any).parentId;
      const parentId =
        typeof parentIdRaw === 'number'
          ? parentIdRaw
          : Number.isFinite(Number(parentIdRaw))
            ? Number(parentIdRaw)
            : null;

      const insertBody: Record<string, any> = {
        post_id: Number(localPostId),
        user_id: userId != null && Number.isFinite(userId) ? userId : null,
        content,
        parent_id: parentId,
        is_approved: isApproved,
        metadata,
        created_at: new Date().toISOString(),
      };

      const insertRes = await fetch(`${baseUrl}/rest/v1/comments`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(insertBody),
      });

      if (insertRes.status === 401 || insertRes.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!insertRes.ok) {
        return json({ error: 'Failed to create comment' }, { status: 500 });
      }

      const rows = (await insertRes.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ error: 'Failed to create comment' }, { status: 500 });
      }

      const row = rows[0] as any;
      let metaOut = row.metadata;
      if (metaOut && typeof metaOut === 'string') {
        try {
          metaOut = JSON.parse(metaOut);
        } catch {
          metaOut = {};
        }
      }
      if (!metaOut || typeof metaOut !== 'object') {
        metaOut = {};
      }

      const baseApproved = row.is_approved === true;
      const approved = baseApproved || true;

      const responseComment = {
        id: row.id,
        content: row.content ?? content,
        createdAt: row.created_at ?? insertBody.created_at,
        metadata: metaOut,
        is_approved: row.is_approved === true,
        approved,
        parentId: row.parent_id != null ? Number(row.parent_id) : insertBody.parent_id,
        isOwner: true,
      };

      const headersInit: Record<string, string> = {};
      if (setAnonCookie && !userId && anonId) {
        const signed = await signAnonCommentId(env, anonId);
        headersInit['Set-Cookie'] = `anon_comment_id=${encodeURIComponent(
          signed,
        )}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }

      return json(responseComment, {
        status: 201,
        headers: headersInit,
      });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // POST /api/comments/:id/flag - flag a comment for moderation
  router.post('/api/comments/:id/flag', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const commentId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(commentId) || commentId <= 0) {
        return json({ error: 'Invalid comment id' }, { status: 400 });
      }

      const body = (await (req as any).json?.()) || {};
      const reason =
        typeof body.reason === 'string' && body.reason.trim().length > 0
          ? body.reason.trim()
          : 'inappropriate content';

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };

      const getUrl = new URL(`${baseUrl}/rest/v1/comments`);
      getUrl.searchParams.set('select', 'id,metadata');
      getUrl.searchParams.set('id', `eq.${commentId}`);
      getUrl.searchParams.set('limit', '1');

      const res = await fetch(getUrl.toString(), { headers });
      if (res.status === 401 || res.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!res.ok) {
        return json({ error: 'Failed to flag comment' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ error: 'Comment not found' }, { status: 404 });
      }

      let metadata = rows[0].metadata;
      if (metadata && typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }
      if (!metadata || typeof metadata !== 'object') {
        metadata = {};
      }

      const token = getBearerToken(req);
      let userKey: string | null = null;
      if (token) {
        const userId = await getSupabaseUserIdFromJwt(env, token);
        if (Number.isFinite(userId || NaN)) {
          userKey = String(userId);
        }
      }

      if (!userKey) {
        const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
        const anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
        userKey = anonId ? `anon:${anonId}` : 'anon';
      }

      const updatedMeta = {
        ...(metadata as any),
        status: 'flagged',
        flaggedAt: new Date().toISOString(),
        flaggedBy: userKey,
        flagReason: reason,
      };

      const updateUrl = new URL(`${baseUrl}/rest/v1/comments`);
      updateUrl.searchParams.set('id', `eq.${commentId}`);

      const updRes = await fetch(updateUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ metadata: updatedMeta }),
      });

      if (updRes.status === 401 || updRes.status === 403) {
        return proxyToBackend(req, env);
      }
      if (!updRes.ok) {
        return json({ error: 'Failed to flag comment' }, { status: 500 });
      }

      return json({ success: true });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // GET /api/comments/recent - list recent approved comments for sidebar widgets
  router.get('/api/comments/recent', async (_req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return json([]);
    }

    try {
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const url = new URL(`${baseUrl}/rest/v1/comments`);
      url.searchParams.set('select', 'id,content,created_at,is_approved');
      url.searchParams.set('is_approved', 'eq.true');
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', '10');

      const res = await fetch(url.toString(), {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        return json([]);
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows)) {
        return json([]);
      }

      const items = rows.map((row: any) => ({
        id: row.id,
        content: typeof row.content === 'string' ? row.content : '',
        createdAt: row.created_at || new Date().toISOString(),
      }));

      return json(items);
    } catch {
      return json([]);
    }
  });

  // PATCH /api/comments/:id - edit an existing comment (owner or admin only)
  router.patch('/api/comments/:id', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const commentId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(commentId) || commentId <= 0) {
        return json({ error: 'Invalid comment id' }, { status: 400 });
      }

      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const rawContent = typeof body.content === 'string' ? body.content : '';
      const content = rawContent.trim();
      if (!content) {
        return json({ error: 'Content is required' }, { status: 400 });
      }
      if (content.length > 2000) {
        return json({ error: 'Content is too long' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      };

      const getUrl = new URL(`${baseUrl}/rest/v1/comments`);
      getUrl.searchParams.set('select', 'id,content,user_id,metadata,is_approved,parent_id,created_at');
      getUrl.searchParams.set('id', `eq.${commentId}`);
      getUrl.searchParams.set('limit', '1');

      const res = await fetch(getUrl.toString(), { headers });
      if (!res.ok) {
        return json({ error: 'Failed to update comment' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ error: 'Comment not found' }, { status: 404 });
      }
      const row = rows[0] as any;

      const token = getBearerToken(req);
      let currentUserId: number | null = null;
      let isAdmin = false;
      if (token) {
        currentUserId = await getSupabaseUserIdFromJwt(env, token);
        const currentUser = await getSupabaseCurrentUser(env, token).catch(() => null);
        if (currentUser && currentUser.isAdmin) {
          isAdmin = true;
        }
      }

      const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
      const anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
      const userKey =
        currentUserId != null && Number.isFinite(currentUserId)
          ? String(currentUserId)
          : anonId
            ? `anon:${anonId}`
            : null;

      if (!userKey && !isAdmin) {
        return json({ error: 'Authentication required to edit comment' }, { status: 401 });
      }

      let metadata = row.metadata;
      if (metadata && typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }
      if (!metadata || typeof metadata !== 'object') {
        metadata = {};
      }
      const meta = metadata as any;

      const ownerKey = meta && meta.ownerKey != null ? String(meta.ownerKey) : null;
      const isOwner =
        (userKey && ownerKey && userKey === ownerKey) ||
        (currentUserId != null && row.user_id != null && Number(row.user_id) === currentUserId);

      if (!isOwner && !isAdmin) {
        return json({ error: 'Not authorized to edit this comment' }, { status: 403 });
      }

      const nowIso = new Date().toISOString();
      const historyArray = Array.isArray(meta.editHistory) ? meta.editHistory : [];
      historyArray.push({
        content: String(row.content ?? ''),
        editedAt: nowIso,
      });
      meta.editHistory = historyArray;
      if (!meta.originalContent) {
        meta.originalContent = String(row.content ?? '');
      }

      const updateUrl = new URL(`${baseUrl}/rest/v1/comments`);
      updateUrl.searchParams.set('id', `eq.${commentId}`);

      const updRes = await fetch(updateUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          content,
          edited: true,
          edited_at: nowIso,
          metadata: meta,
        }),
      });

      if (!updRes.ok) {
        return json({ error: 'Failed to update comment' }, { status: 500 });
      }

      const updRows = (await updRes.json().catch(() => [])) as any[];
      const upd = Array.isArray(updRows) && updRows.length > 0 ? updRows[0] : null;
      if (!upd) {
        return json({ success: true });
      }

      let metaOut = upd.metadata;
      if (metaOut && typeof metaOut === 'string') {
        try {
          metaOut = JSON.parse(metaOut);
        } catch {
          metaOut = {};
        }
      }
      if (!metaOut || typeof metaOut !== 'object') {
        metaOut = {};
      }

      const baseApproved = upd.is_approved === true;
      const updatedOwnerKey =
        metaOut && (metaOut as any).ownerKey != null ? String((metaOut as any).ownerKey) : ownerKey;
      const isOwnerNow =
        (userKey && updatedOwnerKey && userKey === updatedOwnerKey) ||
        (currentUserId != null && upd.user_id != null && Number(upd.user_id) === currentUserId);

      const approved = baseApproved || isOwnerNow;

      const mapped = {
        id: upd.id,
        content: upd.content,
        createdAt: upd.created_at,
        metadata: metaOut,
        is_approved: upd.is_approved === true,
        approved,
        parentId: upd.parent_id != null ? Number(upd.parent_id) : null,
        isOwner: isOwnerNow || isAdmin,
      };

      return json(mapped);
    } catch {
      return json({ error: 'Failed to update comment' }, { status: 500 });
    }
  });

  // DELETE /api/comments/:id - delete a comment (owner or admin only)
  router.delete('/api/comments/:id', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const commentId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(commentId) || commentId <= 0) {
        return json({ error: 'Invalid comment id' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      };

      const getUrl = new URL(`${baseUrl}/rest/v1/comments`);
      getUrl.searchParams.set('select', 'id,content,user_id,metadata,is_approved,parent_id,created_at');
      getUrl.searchParams.set('id', `eq.${commentId}`);
      getUrl.searchParams.set('limit', '1');

      const res = await fetch(getUrl.toString(), { headers });
      if (!res.ok) {
        return json({ error: 'Failed to delete comment' }, { status: 500 });
      }

      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ error: 'Comment not found' }, { status: 404 });
      }
      const row = rows[0] as any;

      const token = getBearerToken(req);
      let currentUserId: number | null = null;
      let isAdmin = false;
      if (token) {
        currentUserId = await getSupabaseUserIdFromJwt(env, token);
        const currentUser = await getSupabaseCurrentUser(env, token).catch(() => null);
        if (currentUser && currentUser.isAdmin) {
          isAdmin = true;
        }
      }

      const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
      const anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
      const userKey =
        currentUserId != null && Number.isFinite(currentUserId)
          ? String(currentUserId)
          : anonId
            ? `anon:${anonId}`
            : null;

      if (!userKey && !isAdmin) {
        return json({ error: 'Authentication required to delete comment' }, { status: 401 });
      }

      let metadata = row.metadata;
      if (metadata && typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }
      if (!metadata || typeof metadata !== 'object') {
        metadata = {};
      }
      const meta = metadata as any;

      const ownerKey = meta && meta.ownerKey != null ? String(meta.ownerKey) : null;
      const isOwner =
        (userKey && ownerKey && userKey === ownerKey) ||
        (currentUserId != null && row.user_id != null && Number(row.user_id) === currentUserId);

      if (!isOwner && !isAdmin) {
        return json({ error: 'Not authorized to delete this comment' }, { status: 403 });
      }

      const deleteUrl = new URL(`${baseUrl}/rest/v1/comments`);
      deleteUrl.searchParams.set('id', `eq.${commentId}`);

      const delRes = await fetch(deleteUrl.toString(), {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      });

      if (delRes.ok) {
        const delRows = (await delRes.json().catch(() => [])) as any[];
        if (!Array.isArray(delRows) || delRows.length === 0) {
          return json({ error: 'Comment not found' }, { status: 404 });
        }
        return json({ success: true, deleted: true });
      }

      const errText = await delRes.text().catch(() => '');
      const conflict = delRes.status === 409 || errText.toLowerCase().includes('foreign key');

      if (!conflict) {
        return json({ error: 'Failed to delete comment' }, { status: 500 });
      }

      const nowIso = new Date().toISOString();
      meta.deleted = true;
      meta.deletedAt = nowIso;
      meta.deletedBy = userKey || (isAdmin ? 'admin' : 'unknown');

      const softDeleteUrl = new URL(`${baseUrl}/rest/v1/comments`);
      softDeleteUrl.searchParams.set('id', `eq.${commentId}`);

      const softRes = await fetch(softDeleteUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          content: '[deleted]',
          is_approved: false,
          metadata: meta,
        }),
      });

      if (!softRes.ok) {
        return json({ error: 'Failed to delete comment' }, { status: 500 });
      }

      return json({ success: true, deleted: true, softDeleted: true });
    } catch {
      return json({ error: 'Failed to delete comment' }, { status: 500 });
    }
  });

  // POST /api/comments/:id/vote - upvote/downvote a comment
  router.post('/api/comments/:id/vote', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const commentId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(commentId) || commentId <= 0) {
        return json({ error: 'Invalid comment id' }, { status: 400 });
      }

      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const isUpvote = Boolean((body as any).isUpvote);
      if (typeof (body as any).isUpvote !== 'boolean') {
        return json({ error: 'isUpvote boolean is required' }, { status: 400 });
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      };

      const token = getBearerToken(req);
      let supabaseUserId: number | null = null;
      if (token) {
        supabaseUserId = await getSupabaseUserIdFromJwt(env, token);
      }

      const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
      let anonId = await getAnonCommentIdFromCookie(env, cookieHeader);
      let setAnonCookie = false;

      if (!supabaseUserId && !anonId) {
        anonId = makeAnonCommentId();
        setAnonCookie = true;
      }

      const userKey =
        supabaseUserId != null && Number.isFinite(supabaseUserId)
          ? String(supabaseUserId)
          : anonId
            ? `anon:${anonId}`
            : null;

      if (!userKey) {
        return json({ error: 'Unable to resolve user for voting' }, { status: 400 });
      }

      const getCommentUrl = new URL(`${baseUrl}/rest/v1/comments`);
      getCommentUrl.searchParams.set('select', 'id,metadata');
      getCommentUrl.searchParams.set('id', `eq.${commentId}`);
      getCommentUrl.searchParams.set('limit', '1');

      const commentRes = await fetch(getCommentUrl.toString(), { headers });
      if (!commentRes.ok) {
        return json({ error: 'Failed to register vote' }, { status: 500 });
      }
      const commentRows = (await commentRes.json().catch(() => [])) as any[];
      if (!Array.isArray(commentRows) || commentRows.length === 0) {
        return json({ error: 'Comment not found' }, { status: 404 });
      }

      let metadata = commentRows[0].metadata;
      if (metadata && typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }
      if (!metadata || typeof metadata !== 'object') {
        metadata = {};
      }
      const meta = metadata as any;

      const getVoteUrl = new URL(`${baseUrl}/rest/v1/comment_votes`);
      getVoteUrl.searchParams.set('select', 'id,is_upvote');
      getVoteUrl.searchParams.set('comment_id', `eq.${commentId}`);
      getVoteUrl.searchParams.set('user_id', `eq.${userKey}`);
      getVoteUrl.searchParams.set('limit', '1');

      const voteRes = await fetch(getVoteUrl.toString(), { headers });
      let existingVote: any | null = null;
      if (voteRes.ok) {
        const voteRows = (await voteRes.json().catch(() => [])) as any[];
        if (Array.isArray(voteRows) && voteRows.length > 0) {
          existingVote = voteRows[0];
        }
      }

      let newState: 'none' | 'upvote' | 'downvote';
      if (isUpvote) {
        newState = existingVote && existingVote.is_upvote === true ? 'none' : 'upvote';
      } else {
        newState = existingVote && existingVote.is_upvote === false ? 'none' : 'downvote';
      }

      if (newState === 'none' && existingVote) {
        const deleteVoteUrl = new URL(`${baseUrl}/rest/v1/comment_votes`);
        deleteVoteUrl.searchParams.set('id', `eq.${existingVote.id}`);

        await fetch(deleteVoteUrl.toString(), {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        }).catch(() => {});
      } else {
        const votePayload = {
          comment_id: commentId,
          user_id: userKey,
          is_upvote: newState === 'upvote',
        };

        if (existingVote) {
          const updateVoteUrl = new URL(`${baseUrl}/rest/v1/comment_votes`);
          updateVoteUrl.searchParams.set('id', `eq.${existingVote.id}`);

          await fetch(updateVoteUrl.toString(), {
            method: 'PATCH',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ is_upvote: votePayload.is_upvote }),
          }).catch(() => {});
        } else {
          await fetch(`${baseUrl}/rest/v1/comment_votes`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify(votePayload),
          }).catch(() => {});
        }
      }

      const currentUp = Number((meta.votes && meta.votes.upvotes) ?? meta.upvotes ?? 0);
      const currentDown = Number((meta.votes && meta.votes.downvotes) ?? meta.downvotes ?? 0);

      let upvotes = isNaN(currentUp) ? 0 : currentUp;
      let downvotes = isNaN(currentDown) ? 0 : currentDown;

      if (isUpvote) {
        if (existingVote && existingVote.is_upvote === true) {
          upvotes = Math.max(0, upvotes - 1);
        } else if (existingVote && existingVote.is_upvote === false) {
          upvotes += 1;
          downvotes = Math.max(0, downvotes - 1);
        } else {
          upvotes += 1;
        }
      } else {
        if (existingVote && existingVote.is_upvote === false) {
          downvotes = Math.max(0, downvotes - 1);
        } else if (existingVote && existingVote.is_upvote === true) {
          downvotes += 1;
          upvotes = Math.max(0, upvotes - 1);
        } else {
          downvotes += 1;
        }
      }

      meta.upvotes = upvotes;
      meta.downvotes = downvotes;
      meta.votes = { upvotes, downvotes };

      const updateCommentUrl = new URL(`${baseUrl}/rest/v1/comments`);
      updateCommentUrl.searchParams.set('id', `eq.${commentId}`);

      await fetch(updateCommentUrl.toString(), {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ metadata: meta }),
      }).catch(() => {});

      const responseHeaders: Record<string, string> = {};
      if (setAnonCookie && anonId) {
        const signed = await signAnonCommentId(env, anonId);
        responseHeaders['Set-Cookie'] = `anon_comment_id=${encodeURIComponent(
          signed,
        )}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }

      return json(
        {
          commentId,
          upvotes,
          downvotes,
          state: newState,
        },
        { headers: responseHeaders },
      );
    } catch {
      return json({ error: 'Failed to register vote' }, { status: 500 });
    }
  });
}

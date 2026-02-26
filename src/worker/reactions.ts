// Reactions domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import {
  json,
  proxyToBackend,
  buildPostSummaries,
  resolveLocalPostIdFromExternal,
  callSupabaseRpc,
  getBearerToken,
  getSupabaseUserIdFromJwt,
} from './utils';

// Local ReactionState type mirrors the one previously declared in src/index.ts
type ReactionState = 'like' | 'dislike' | 'none';

type ReactionUserKey = `user:${number}` | `anon:${string}`;

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
    // ignore
  }
  return result;
}

function base64UrlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes);
  let str = '';
  for (const b of u8) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function signAnonId(env: Env, id: string): Promise<string> {
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

async function verifySignedAnonId(env: Env, signed: string): Promise<string | null> {
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

async function getOrCreateReactionUserKey(
  req: Request,
  env: Env,
): Promise<{ userKey: ReactionUserKey | null; setCookie?: string }> {
  const token = getBearerToken(req);
  if (token) {
    const userId = await getSupabaseUserIdFromJwt(env, token);
    if (Number.isFinite(userId || NaN)) {
      return { userKey: `user:${Number(userId)}` };
    }
  }

  const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const signed = cookies['anon_reaction_id'] || null;

  let anonId: string | null = null;
  if (signed) {
    anonId = await verifySignedAnonId(env, signed);
  }

  if (!anonId) {
    anonId = crypto.randomUUID();
    const signedOut = await signAnonId(env, anonId);
    return {
      userKey: `anon:${anonId}`,
      setCookie: `anon_reaction_id=${encodeURIComponent(signedOut)}; Path=/; Max-Age=31536000; SameSite=Lax`,
    };
  }

  return { userKey: `anon:${anonId}` };
}

function normalizeReactionState(value: any): ReactionState {
  if (value === 'like' || value === 'dislike' || value === 'none') return value;
  return 'none';
}

function parseReactionState(value: any): ReactionState {
  if (value === 'like' || value === 'dislike') return value;
  return 'none';
}

function computeReactionDelta(
  prev: ReactionState,
  next: ReactionState,
): {
  deltaLikes: number;
  deltaDislikes: number;
} {
  if (prev === next) return { deltaLikes: 0, deltaDislikes: 0 };
  let deltaLikes = 0;
  let deltaDislikes = 0;

  if (prev === 'none') {
    if (next === 'like') deltaLikes = 1;
    else if (next === 'dislike') deltaDislikes = 1;
  } else if (prev === 'like') {
    if (next === 'none') {
      deltaLikes = -1;
    } else if (next === 'dislike') {
      deltaLikes = -1;
      deltaDislikes = 1;
    }
  } else if (prev === 'dislike') {
    if (next === 'none') {
      deltaDislikes = -1;
    } else if (next === 'like') {
      deltaLikes = 1;
      deltaDislikes = -1;
    }
  }

  return { deltaLikes, deltaDislikes };
}

// Register all reactions-related routes on the provided router instance.
export function registerReactionsRoutes(router: any) {
  // GET /api/posts/:id/reactions - single post reaction totals
  router.get('/api/posts/:id/reactions', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const rawId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(rawId) || rawId <= 0) {
        return json({ error: 'Invalid post id' }, { status: 400 });
      }

      const summaries = await buildPostSummaries(env, [rawId]);
      if (!summaries.length) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      const s = summaries[0] as any;
      const reactions = s.reactions || {};
      const baselineLikes = Number(reactions.baselineLikes ?? 0);
      const baselineDislikes = Number(reactions.baselineDislikes ?? 0);
      const likesCount = Number(reactions.likesCount ?? 0);
      const dislikesCount = Number(reactions.dislikesCount ?? 0);

      return json({
        postId: Number(s.localPostId ?? s.id ?? rawId),
        baselineLikes,
        baselineDislikes,
        likesCount,
        dislikesCount,
        totals: {
          likes: baselineLikes + likesCount,
          dislikes: baselineDislikes + dislikesCount,
        },
      });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // GET /api/posts/reactions-batch?ids=1,2,3
  router.get('/api/posts/reactions-batch', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const search = urlObj.searchParams;
      const rawParams = [...search.getAll('ids'), ...search.getAll('id')];
      const joined = rawParams.length ? rawParams.join(',') : '';
      const list = joined
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);

      const ids = Array.from(new Set(list));
      if (!ids.length) {
        return json({ results: [] });
      }

      const summaries = await buildPostSummaries(env, ids);
      const results = summaries.map((s: any) => {
        const reactions = s.reactions || {};
        const baselineLikes = Number(reactions.baselineLikes ?? 0);
        const baselineDislikes = Number(reactions.baselineDislikes ?? 0);
        const likesCount = Number(reactions.likesCount ?? 0);
        const dislikesCount = Number(reactions.dislikesCount ?? 0);
        const localId = Number(s.localPostId ?? s.id ?? 0);

        return {
          postId: localId,
          baselineLikes,
          baselineDislikes,
          likesCount,
          dislikesCount,
          totals: {
            likes: baselineLikes + likesCount,
            dislikes: baselineDislikes + dislikesCount,
          },
        };
      });

      return json({ results });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  // POST /api/posts/:id/reaction - update reaction state (robust)
  //
  // This endpoint is intended to be safe against:
  // - race conditions (atomic DB-side update)
  // - client-side spoofing of prevState
  //
  // Implementation uses a Supabase RPC (`apply_post_reaction`) that:
  // - upserts a per-user reaction record (user_key)
  // - atomically adjusts likes_count / dislikes_count
  router.post('/api/posts/:id/reaction', async (req: Request, env: Env) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return proxyToBackend(req, env);
    }

    try {
      const urlObj = new URL(req.url);
      const segments = urlObj.pathname.split('/');
      const idSegment = segments.length >= 2 ? segments[segments.length - 2] : '';
      const rawId = parseInt(decodeURIComponent(idSegment || ''), 10);
      if (!Number.isFinite(rawId) || rawId <= 0) {
        return json({ error: 'Invalid post id' }, { status: 400 });
      }

      const localPostId = await resolveLocalPostIdFromExternal(env, rawId);
      if (!Number.isFinite(localPostId || NaN)) {
        return json({ error: 'Post not found' }, { status: 404 });
      }
      const postId = Number(localPostId);

      const body = (await (req as any).json?.().catch(() => ({}))) || {};
      const isLike = Boolean((body as any).isLike);
      const hasExplicitNextState = body && Object.prototype.hasOwnProperty.call(body, 'nextState');
      const explicitNext = normalizeReactionState((body as any).nextState);

      // For legacy callers that don't send nextState, derive it from isLike.
      const nextState: ReactionState = hasExplicitNextState ? explicitNext : isLike ? 'like' : 'dislike';

      const { userKey, setCookie } = await getOrCreateReactionUserKey(req, env);
      if (!userKey) {
        return json({ error: 'Unable to resolve user for reaction' }, { status: 400 });
      }

      // Primary path: Supabase RPC
      try {
        const rpcRes = await callSupabaseRpc(env, 'apply_post_reaction', {
          post_id: postId,
          user_key: userKey,
          next_state: nextState,
        });

        if (rpcRes.ok) {
          const payload = (await rpcRes.json().catch(() => null)) as any;
          const row = Array.isArray(payload) ? payload[0] : payload;

          const baselineLikes = Number(row?.baseline_likes ?? row?.baselineLikes ?? 0);
          const baselineDislikes = Number(row?.baseline_dislikes ?? row?.baselineDislikes ?? 0);
          const likesCount = Number(row?.likes_count ?? row?.likesCount ?? 0);
          const dislikesCount = Number(row?.dislikes_count ?? row?.dislikesCount ?? 0);

          const headers: Record<string, string> = {};
          if (setCookie) {
            headers['Set-Cookie'] = setCookie;
          }

          return json(
            {
              postId,
              baselineLikes,
              baselineDislikes,
              likesCount,
              dislikesCount,
              totals: {
                likes: baselineLikes + likesCount,
                dislikes: baselineDislikes + dislikesCount,
              },
              state: nextState,
            },
            { headers },
          );
        }
      } catch {
        // Fall through to legacy best-effort behavior.
      }

      // Fallback: legacy read-modify-write (still race-prone). Keep for safety
      // if the RPC hasn't been deployed yet.
      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };

      const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
      postsUrl.searchParams.set(
        'select',
        'id,baseline_likes,baseline_dislikes,likes_count,dislikes_count',
      );
      postsUrl.searchParams.set('id', `eq.${postId}`);
      postsUrl.searchParams.set('limit', '1');

      const res = await fetch(postsUrl.toString(), { headers: serviceHeaders });
      if (!res.ok) {
        return json({ error: 'Failed to update reaction' }, { status: 500 });
      }
      const rows = (await res.json().catch(() => [])) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ error: 'Post not found' }, { status: 404 });
      }

      const row = rows[0] as any;
      const baselineLikes = Number(row.baseline_likes ?? row.baselineLikes ?? 0);
      const baselineDislikes = Number(row.baseline_dislikes ?? row.baselineDislikes ?? 0);
      const currentLikesCount = Number(row.likes_count ?? row.likesCount ?? 0);
      const currentDislikesCount = Number(row.dislikes_count ?? row.dislikesCount ?? 0);

      // Best-effort: trust client prevState if provided, otherwise assume "none".
      const prevState = normalizeReactionState((body as any).prevState);
      const { deltaLikes, deltaDislikes } = computeReactionDelta(prevState, nextState);

      const newLikesCount = Math.max(0, currentLikesCount + deltaLikes);
      const newDislikesCount = Math.max(0, currentDislikesCount + deltaDislikes);

      let finalLikesCount = newLikesCount;
      let finalDislikesCount = newDislikesCount;

      try {
        const updateUrl = new URL(`${baseUrl}/rest/v1/posts`);
        updateUrl.searchParams.set('id', `eq.${postId}`);

        const updateRes = await fetch(updateUrl.toString(), {
          method: 'PATCH',
          headers: {
            ...serviceHeaders,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            likes_count: newLikesCount,
            dislikes_count: newDislikesCount,
          }),
        });

        if (updateRes.ok) {
          const updatedRows = (await updateRes.json().catch(() => [])) as any[];
          if (Array.isArray(updatedRows) && updatedRows.length > 0) {
            const updated = updatedRows[0] as any;
            finalLikesCount = Number(updated.likes_count ?? updated.likesCount ?? newLikesCount);
            finalDislikesCount = Number(
              updated.dislikes_count ?? updated.dislikesCount ?? newDislikesCount,
            );
          }
        }
      } catch {
        // ignore
      }

      const headers: Record<string, string> = {};
      if (setCookie) {
        headers['Set-Cookie'] = setCookie;
      }

      return json(
        {
          postId,
          baselineLikes,
          baselineDislikes,
          likesCount: finalLikesCount,
          dislikesCount: finalDislikesCount,
          totals: {
            likes: baselineLikes + finalLikesCount,
            dislikes: baselineDislikes + finalDislikesCount,
          },
          state: nextState,
          warning: 'apply_post_reaction RPC not available; used legacy fallback',
        },
        { headers },
      );
    } catch {
      return proxyToBackend(req, env);
    }
  });
}
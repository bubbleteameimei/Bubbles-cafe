// Reactions domain routes for Bubble's Cafe Worker.
// Extracted from src/index.ts to keep the Worker entrypoint slimmer while
// preserving existing behavior.

import type { Env } from './utils';
import { json, proxyToBackend, buildPostSummaries, resolveLocalPostIdFromExternal } from './utils';

// Local ReactionState type mirrors the one previously declared in src/index.ts
type ReactionState = 'like' | 'dislike' | 'none';

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

  // POST /api/posts/:id/reaction - update aggregate reaction counters
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

      const body = (await (req as any).json?.()) || {};
      const isLike = Boolean((body as any).isLike);
      const prevState = parseReactionState((body as any).prevState);
      const hasExplicitNextState = body && Object.prototype.hasOwnProperty.call(body, 'nextState');
      let nextState = parseReactionState((body as any).nextState);

      // For legacy callers that don't send nextState, derive it from isLike.
      // If nextState is provided (including "none"), respect it.
      if (!hasExplicitNextState) {
        nextState = isLike ? 'like' : 'dislike';
      }

      const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
      const serviceHeaders: Record<string, string> = {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };

      const localPostId = await resolveLocalPostIdFromExternal(env, rawId);
      if (!Number.isFinite(localPostId || NaN)) {
        return json({ error: 'Post not found' }, { status: 404 });
      }
      const postId = Number(localPostId);

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
        // best-effort; fall back to optimistic values on error
      }

      const totalsLikes = baselineLikes + finalLikesCount;
      const totalsDislikes = baselineDislikes + finalDislikesCount;

      return json({
        postId,
        baselineLikes,
        baselineDislikes,
        likesCount: finalLikesCount,
        dislikesCount: finalDislikesCount,
        totals: {
          likes: totalsLikes,
          dislikes: totalsDislikes,
        },
      });
    } catch {
      return proxyToBackend(req, env);
    }
  });

  }
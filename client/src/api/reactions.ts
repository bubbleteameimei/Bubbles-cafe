import { getApiBaseUrl } from '@/lib/asset-path';

export interface ReactionTotals {
  postId: number;
  baselineLikes: number;
  baselineDislikes: number;
  likesCount: number;
  dislikesCount: number;
  totals: {
    likes: number;
    dislikes: number;
  };
}

function buildApiCandidates(path: string): string[] {
  const base = getApiBaseUrl();
  const explicit = (import.meta.env.VITE_API_URL as string | undefined) || undefined;
  const rel = path.startsWith('/') ? path : `/${path}`;
  const candidates: string[] = [];
  candidates.push(base ? `${base}${rel}` : rel);
  if (explicit) candidates.push(`${explicit.replace(/\/+$/, '')}${rel}`);
  return candidates;
}

async function fetchWithFallback<T>(path: string, init: RequestInit): Promise<T> {
  const urls = buildApiCandidates(path);
  let lastErr: any;
  for (const url of urls) {
    try {
      const res = await fetch(url, { ...init, credentials: init.credentials ?? 'include' });
      if (res.ok) {
        return (await res.json()) as T;
      }
      lastErr = new Error(`Request failed: ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Request failed');
}

export async function fetchReactions(postId: number): Promise<ReactionTotals> {
  return fetchWithFallback<ReactionTotals>(`/api/posts/${postId}/reactions`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
}

export async function fetchReactionsBatch(postIds: number[]): Promise<ReactionTotals[]> {
  // Filter out invalid IDs (NaN, undefined, etc.) to prevent malformed requests
  const validIds = (Array.isArray(postIds) ? postIds : [])
    .filter((id) => Number.isFinite(Number(id)))
    .map((id) => Number(id));

  // Early return for empty list to avoid unnecessary API call
  if (validIds.length === 0) return [];

  const idsParam = validIds.join(',');
  const data = await fetchWithFallback<{ results: ReactionTotals[] }>(
    `/api/posts/reactions-batch?ids=${encodeURIComponent(idsParam)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  );
  return Array.isArray(data?.results) ? data.results : [];
}

export async function submitReaction(
  postId: number,
  isLike: boolean,
  options?: { prevState?: 'like' | 'dislike' | 'none'; nextState?: 'like' | 'dislike' | 'none' }
): Promise<ReactionTotals> {
  const payload: any = { isLike };
  if (options && typeof options.prevState === 'string') {
    payload.prevState = options.prevState;
  }
  if (options && typeof options.nextState === 'string') {
    payload.nextState = options.nextState;
  }

  return fetchWithFallback<ReactionTotals>(`/api/posts/${postId}/reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
}

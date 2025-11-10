/**
 * Trending score computation wrapper.
 * Uses a Web Worker when available to offload scoring; falls back to inline compute.
 */

export type ReactionTotalsLite = Record<number, { totals?: { likes?: number } }>;

function inlineComputeTrendingScores(
  posts: Array<{ id: number; createdAt: string | number | Date; metadata?: any; likesCount?: number }>,
  reactionTotals: ReactionTotalsLite,
  windowDays: number
): Record<number, number> {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const scores: Record<number, number> = {};
  for (const p of posts) {
    const id = Number(p?.id);
    if (!Number.isFinite(id)) continue;
    const totals = reactionTotals[id];
    const likesRaw = (totals?.totals?.likes ?? (p as any)?.likesCount) ?? 0;
    const likes = Number(likesRaw) || 0;
    const views = (p as any)?.metadata && (p as any).metadata.pageViews ? Number((p as any).metadata.pageViews) : 0;

    let createdAtTs = 0;
    try {
      const ts = (p?.createdAt instanceof Date) ? p.createdAt.getTime() : new Date(p?.createdAt as any).getTime();
      createdAtTs = Number.isFinite(ts) ? ts : 0;
    } catch {
      createdAtTs = 0;
    }
    const ageDays = Math.max(0, (now - createdAtTs) / dayMs);
    const decay = Math.max(0.2, 1 - (ageDays / windowDays));
    const score = (likes * 2.5 + views * 0.8) * decay;

    scores[id] = score;
  }
  return scores;
}

export async function computeTrendingScores(
  posts: Array<{ id: number; createdAt: string | number | Date; metadata?: any; likesCount?: number }>,
  reactionTotals: ReactionTotalsLite,
  windowDays: number = 14
): Promise<Record<number, number>> {
  try {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      // SSR or no Worker support
      return inlineComputeTrendingScores(posts, reactionTotals, windowDays);
    }
    const worker = new Worker(new URL("../workers/trending.worker.ts", import.meta.url), {
      type: "module",
    });
    return await new Promise<Record<number, number>>((resolve) => {
      const timer = setTimeout(() => {
        try { worker.terminate(); } catch {}
        resolve(inlineComputeTrendingScores(posts, reactionTotals, windowDays));
      }, 1500); // safety timeout

      worker.onmessage = (e: MessageEvent) => {
        clearTimeout(timer);
        try { worker.terminate(); } catch {}
        const scores = (e.data && e.data.scores) || {};
        resolve(scores);
      };
      worker.onerror = () => {
        clearTimeout(timer);
        try { worker.terminate(); } catch {}
        resolve(inlineComputeTrendingScores(posts, reactionTotals, windowDays));
      };
      worker.postMessage({ posts, reactionTotals, windowDays });
    });
  } catch {
    return inlineComputeTrendingScores(posts, reactionTotals, windowDays);
  }
}
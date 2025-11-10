// Minimal Web Worker to compute trending scores for posts
// Receives: { posts: Array<{ id: number, createdAt: string | number | Date, metadata?: any, likesCount?: number }>, reactionTotals: Record<number, { totals?: { likes?: number } }>, windowDays?: number }
// Returns: { scores: Record<number, number> }

const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = (e: MessageEvent) => {
  try {
    const data = e.data || {};
    const posts: any[] = Array.isArray(data.posts) ? data.posts : [];
    const reactionTotals: Record<number, any> = data.reactionTotals || {};
    const windowDays: number = typeof data.windowDays === "number" ? data.windowDays : 14;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const scores: Record<number, number> = {};

    for (const p of posts) {
      const id = Number(p?.id);
      if (!Number.isFinite(id)) continue;

      const totals = reactionTotals[id];
      const likesRaw = (totals?.totals?.likes ?? p?.likesCount) ?? 0;
      const likes = Number(likesRaw) || 0;
      const views = p?.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;

      let createdAtTs = 0;
      try {
        const ts = (p?.createdAt instanceof Date) ? p.createdAt.getTime() : new Date(p?.createdAt).getTime();
        createdAtTs = Number.isFinite(ts) ? ts : 0;
      } catch {
        createdAtTs = 0;
      }
      const ageDays = Math.max(0, (now - createdAtTs) / dayMs);
      const decay = Math.max(0.2, 1 - (ageDays / windowDays));
      const score = (likes * 2.5 + views * 0.8) * decay;

      scores[id] = score;
    }

    ctx.postMessage({ scores });
  } catch (err) {
    // Return empty scores on failure
    ctx.postMessage({ scores: {} });
  }
};
// Simple Server-Sent Events (SSE) hub for post reaction updates

import { Response, Request } from 'express';
import { db } from '../db';
import { posts as postsTable } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

type Client = {
  res: Response;
  createdAt: number;
};

const clientsByPostId = new Map<number, Set<Client>>();

function initSseHeaders(res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

function sendEvent(res: Response, event: string, data: any) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function broadcastPostReactions(postId: number) {
  const set = clientsByPostId.get(postId);
  if (!set || set.size === 0) return;

  try {
    // Read totals once and broadcast to all listeners
    const result = await db.execute(sql`
      SELECT id,
             baseline_likes AS "baselineLikes",
             baseline_dislikes AS "baselineDislikes",
             likes_count AS "likesCount",
             dislikes_count AS "dislikesCount"
      FROM posts
      WHERE id = ${postId}
      LIMIT 1
    `);

    const row = (result as any).rows?.[0];
    if (!row) return;

    const payload = {
      postId,
      baselineLikes: Number(row.baselineLikes ?? 0),
      baselineDislikes: Number(row.baselineDislikes ?? 0),
      likesCount: Number(row.likesCount ?? 0),
      dislikesCount: Number(row.dislikesCount ?? 0),
      totals: {
        likes: Number(row.baselineLikes ?? 0) + Number(row.likesCount ?? 0),
        dislikes: Number(row.baselineDislikes ?? 0) + Number(row.dislikesCount ?? 0),
      },
      ts: Date.now(),
    };

    for (const client of Array.from(set)) {
      try {
        sendEvent(client.res, 'update', payload);
      } catch {
        // Drop bad client
        set.delete(client);
        try { client.res.end(); } catch {}
      }
    }
  } catch {
    // silent failure; SSE is best-effort
  }
}

export async function handleSseSubscription(req: Request, res: Response) {
  const idRaw = (req.params as any).id ?? (req.query as any).postId;
  const inputId = Number(idRaw);
  if (!Number.isFinite(inputId) || inputId <= 0) {
    res.status(400).json({ error: 'Invalid postId' });
    return;
  }

  // Resolve to local post id when provided a WordPress id
  let effectiveId = inputId;
  try {
    const exists = await db.execute(sql`SELECT id FROM posts WHERE id = ${inputId} LIMIT 1`);
    if (!(exists as any).rows?.[0]?.id) {
      const mapRes = await db.execute(sql`
        SELECT id FROM posts WHERE (metadata->>'wordpressId')::int = ${inputId} LIMIT 1
      `);
      const mapped = (mapRes as any).rows?.[0]?.id;
      if (Number.isFinite(mapped)) effectiveId = Number(mapped);
    }
  } catch {
    // ignore mapping failures; continue with input id
  }

  initSseHeaders(res);

  // Register client under effective local id
  const set = clientsByPostId.get(effectiveId) ?? new Set<Client>();
  clientsByPostId.set(effectiveId, set);
  const client: Client = { res, createdAt: Date.now() };
  set.add(client);

  // Initial event: quick read and send snapshot
  db.execute(sql`
    SELECT id,
           baseline_likes AS "baselineLikes",
           baseline_dislikes AS "baselineDislikes",
           likes_count AS "likesCount",
           dislikes_count AS "dislikesCount"
    FROM posts
    WHERE id = ${effectiveId}
    LIMIT 1
  `).then((result: any) => {
    const row = result.rows?.[0];
    if (row) {
      const payload = {
        postId: effectiveId,
        baselineLikes: Number(row.baselineLikes ?? 0),
        baselineDislikes: Number(row.baselineDislikes ?? 0),
        likesCount: Number(row.likesCount ?? 0),
        dislikesCount: Number(row.dislikesCount ?? 0),
        totals: {
          likes: Number(row.baselineLikes ?? 0) + Number(row.likesCount ?? 0),
          dislikes: Number(row.baselineDislikes ?? 0) + Number(row.dislikesCount ?? 0),
        },
        ts: Date.now(),
      };
      sendEvent(res, 'initial', payload);
    }
  }).catch(() => { /* ignore */ });

  // Heartbeat to keep connection alive on proxies
  const interval = setInterval(() => {
    try { sendEvent(res, 'ping', { ts: Date.now() }); } catch {}
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
    try { res.end(); } catch {}
    const set = clientsByPostId.get(effectiveId);
    if (set) {
      for (const c of set) {
        if (c.res === res) set.delete(c);
      }
      if (set.size === 0) clientsByPostId.delete(effectiveId);
    }
  });
}
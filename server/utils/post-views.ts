import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { analytics } from '@shared/schema';

/**
 * Attach each story's view count (analytics.page_views) as metadata.pageViews, the field
 * the client already reads. Failures leave the rows unchanged: views are non-critical.
 */
export async function withViews<T extends { id: number; metadata?: unknown }>(rows: T[]): Promise<T[]> {
  if (rows.length === 0) return rows;
  try {
    const ids = rows.map((r) => r.id);
    const counts = await db
      .select({ postId: analytics.postId, views: analytics.pageViews })
      .from(analytics)
      .where(inArray(analytics.postId, ids));
    const byId = new Map(counts.map((c: { postId: number; views: number }) => [c.postId, Number(c.views ?? 0)]));
    return rows.map((r) => ({
      ...r,
      metadata: { ...((r.metadata as Record<string, unknown>) ?? {}), pageViews: byId.get(r.id) ?? 0 },
    }));
  } catch (error) {
    console.error('Failed to attach view counts:', error);
    return rows;
  }
}

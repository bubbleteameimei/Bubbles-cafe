import { Router } from 'express';
import { db } from '../db';
import { authorTips, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// POST /api/tips - record a tip event (manual logging)
const createSchema = z.object({
  authorId: z.coerce.number().int().positive(),
  amount: z.string().min(1), // store as text to avoid currency conversions
  currency: z.string().min(1).optional().default('USD'),
  status: z.enum(['pending', 'succeeded', 'failed']).optional().default('pending'),
  providerId: z.string().optional(),
  message: z.string().optional()
});
router.post('/', async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid tip payload', details: parsed.error.flatten() });
    }
    const { authorId, amount, currency, status, providerId, message } = parsed.data;

    // Optional: link to the current user if available
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id ?? null;

    const [created] = await db.insert(authorTips).values({
      authorId: Number(authorId),
      userId: userId ? Number(userId) : null,
      amount: String(amount),
      currency: String(currency),
      status: String(status),
      providerId: providerId ? String(providerId) : null,
      message: message ? String(message) : null
    } as any).returning();

    return res.status(201).json({ success: true, tip: created });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record tip event' });
  }
});

// GET /api/tips/author/:authorId - aggregate tip totals for an author
router.get('/author/:authorId', async (req, res) => {
  try {
    const authorId = Number(req.params.authorId);
    if (!Number.isFinite(authorId)) {
      return res.status(400).json({ error: 'Invalid authorId' });
    }

    // Simple aggregation: count of tips and latest records
    const rows = await db.select().from(authorTips).where(eq(authorTips.authorId, authorId));
    const totalTips = rows.length;

    return res.json({
      authorId,
      totalTips,
      tips: rows.slice(0, 50)
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch author tips' });
  }
});

export default router;
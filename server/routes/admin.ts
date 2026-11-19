/**
 * Admin endpoints ported from the retired Cloudflare Worker.
 *
 * registerAdminRoutes()       → mounted at /api/admin (every route requires admin)
 * registerAdminExtraRoutes()  → mounted at /api, for admin features that live
 *                               outside /api/admin in the client (feedback review,
 *                               moderation, email test, post themes)
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  adminNotifications,
  comments,
  posts,
  reportedContent,
  siteSettings,
  userFeedback,
  users,
} from '@shared/schema';
import { requireAdmin } from '../auth-google';
import {
  getSyncLogs,
  getSyncStatus,
  runWordPressSync,
  setSyncEnabled,
} from '../services/wordpress-sync';
import { sendEmail } from '../services/email';
import { checkGmailStatus } from '../services/gmail';
import { checkSendGridStatus } from '../services/sendgrid';
import { checkMailerSendStatus } from '../services/mailersend';

const idParam = (req: Request) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const FEEDBACK_STATUSES = ['pending', 'reviewed', 'resolved', 'rejected'] as const;
const MODERATION_STATUSES = ['pending', 'approved', 'rejected', 'removed', 'reviewed', 'dismissed'] as const;

// ---------------------------------------------------------------------------
// /api/admin/*
// ---------------------------------------------------------------------------

export function registerAdminRoutes() {
  const router = Router();
  router.use(requireAdmin as any);

  // ---- notifications -------------------------------------------------------
  router.get('/notifications', async (_req, res) => {
    try {
      const rows = await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(100);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  router.post('/notifications/:id/read', async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    try {
      await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification read:', error);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // ---- site settings -------------------------------------------------------
  router.get('/site-settings', async (_req, res) => {
    try {
      const rows = await db.select().from(siteSettings).orderBy(asc(siteSettings.category), asc(siteSettings.key));
      res.json(rows);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  const settingSchema = z.object({
    key: z.string().trim().min(1).max(100),
    value: z.string().max(20_000),
    category: z.string().trim().max(50).optional(),
    description: z.string().max(500).optional(),
  });

  router.post('/site-settings', async (req, res) => {
    const parsed = settingSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'key and value are required' });
    const { key, value, category, description } = parsed.data;
    try {
      const [row] = await db
        .insert(siteSettings)
        .values({ key, value, category: category || 'general', description })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
        .returning();
      return res.json(row);
    } catch (error) {
      console.error('Error saving site setting:', error);
      return res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  // ---- users ---------------------------------------------------------------
  router.get('/users', async (req, res) => {
    try {
      const search = String(req.query.search ?? '').trim();
      const pattern = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      const rows = await db
        .select()
        .from(users)
        .where(search ? or(ilike(users.username, pattern), ilike(users.email, pattern)) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(200);
      res.json(
        rows.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          isAdmin: !!u.isAdmin,
          createdAt: u.createdAt,
          lastLogin: (u.metadata as any)?.lastLogin ?? null,
        })),
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // ---- posts ---------------------------------------------------------------
  // Publish / feature flags live in posts.metadata (status: 'publish' | 'draft', featured: boolean),
  // matching what the admin UI reads.
  async function listPosts(req: Request, res: Response, preset?: 'pending' | 'flagged') {
    try {
      const rows: any[] = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(1000);
      const statusOf = (p: any) => String((p.metadata as any)?.status || 'publish').toLowerCase();
      const stats = {
        total: rows.length,
        published: rows.filter((p) => statusOf(p) === 'publish').length,
        pending: rows.filter((p) => statusOf(p) === 'pending').length,
        flagged: rows.filter((p) => (p.metadata as any)?.flagged === true).length,
      };

      const search = String(req.query.search ?? '').toLowerCase();
      const category = String(req.query.category ?? '');
      const status = String(req.query.status ?? '');
      const featured = req.query.featured === 'true';

      const filtered = rows.filter((p) => {
        const meta = (p.metadata ?? {}) as any;
        if (preset === 'pending' && statusOf(p) !== 'pending') return false;
        if (preset === 'flagged' && meta.flagged !== true) return false;
        if (status && status !== 'all' && statusOf(p) !== status) return false;
        if (category && category !== 'all' && (p.themeCategory || meta.themeCategory) !== category) return false;
        if (featured && meta.featured !== true) return false;
        if (search && !String(p.title).toLowerCase().includes(search)) return false;
        return true;
      });

      res.json({ posts: filtered, total: filtered.length, stats });
    } catch (error) {
      console.error('Error fetching admin posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }
  router.get('/posts', (req, res) => listPosts(req, res));
  router.get('/posts/pending', (req, res) => listPosts(req, res, 'pending'));
  router.get('/posts/flagged', (req, res) => listPosts(req, res, 'flagged'));

  async function setPostMeta(id: number, patch: Record<string, unknown>) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!post) return null;
    const [updated] = await db
      .update(posts)
      .set({ metadata: { ...((post.metadata ?? {}) as object), ...patch } })
      .where(eq(posts.id, id))
      .returning();
    return updated;
  }

  const flagActions: Record<string, Record<string, unknown>> = {
    publish: { status: 'publish' },
    unpublish: { status: 'draft' },
    feature: { featured: true },
    unfeature: { featured: false },
  };

  router.patch('/posts/:id/:action(publish|unpublish|feature|unfeature)', async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    try {
      const updated = await setPostMeta(id, flagActions[req.params.action]);
      if (!updated) return res.status(404).json({ error: 'Post not found' });
      return res.json(updated);
    } catch (error) {
      console.error('Error updating post flags:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  });

  const postPatchSchema = z.object({
    title: z.string().trim().min(1).max(300).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().max(500).nullable().optional(),
    themeCategory: z.string().max(50).nullable().optional(),
    isSecret: z.boolean().optional(),
    matureContent: z.boolean().optional(),
    metadata: z.record(z.unknown()).optional(),
  });

  router.patch('/posts/:id', async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const parsed = postPatchSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid post data' });
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const { metadata, ...fields } = parsed.data;
      const [updated] = await db
        .update(posts)
        .set({
          ...fields,
          ...(metadata ? { metadata: { ...((post.metadata ?? {}) as object), ...metadata } } : {}),
        })
        .where(eq(posts.id, id))
        .returning();
      return res.json(updated);
    } catch (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  });

  router.delete('/posts/:id', async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    try {
      const deleted = await db.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
      if (!deleted.length) return res.status(404).json({ error: 'Post not found' });
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  const bulkSchema = z.object({
    action: z.enum(['publish', 'unpublish', 'feature', 'unfeature', 'delete']),
    postIds: z.array(z.number().int().positive()).min(1).max(500),
  });

  router.post('/posts/bulk', async (req, res) => {
    const parsed = bulkSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid bulk action' });
    const { action, postIds } = parsed.data;
    try {
      if (action === 'delete') {
        const deleted = await db.delete(posts).where(inArray(posts.id, postIds)).returning({ id: posts.id });
        return res.json({ success: true, affected: deleted.length });
      }
      let affected = 0;
      for (const id of postIds) {
        if (await setPostMeta(id, flagActions[action])) affected++;
      }
      return res.json({ success: true, affected });
    } catch (error) {
      console.error('Error running bulk action:', error);
      return res.status(500).json({ error: 'Bulk action failed' });
    }
  });

  // ---- WordPress sync dashboard -------------------------------------------
  router.get('/wordpress/status', async (_req, res) => {
    try {
      res.json(await getSyncStatus());
    } catch (error) {
      console.error('Error fetching sync status:', error);
      res.status(500).json({ error: 'Failed to fetch sync status' });
    }
  });

  router.get('/wordpress/logs', async (_req, res) => {
    try {
      res.json(await getSyncLogs(30));
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      res.status(500).json({ error: 'Failed to fetch sync logs' });
    }
  });

  router.post('/wordpress/sync', async (_req, res) => {
    const result = await runWordPressSync('manual');
    if (!result.success) {
      const status = result.errors[0] === 'A sync is already running' ? 409 : 502;
      return res.status(status).json({ ...result, error: result.errors[0] ?? 'Sync failed' });
    }
    return res.json(result);
  });

  router.post('/wordpress/toggle', async (req, res) => {
    const enabled = req.body?.enabled === true;
    try {
      await setSyncEnabled(enabled);
      return res.json({ enabled });
    } catch (error) {
      console.error('Error toggling sync:', error);
      return res.status(500).json({ error: 'Failed to toggle sync' });
    }
  });

  return router;
}

// ---------------------------------------------------------------------------
// Admin features mounted under /api
// ---------------------------------------------------------------------------

export function registerAdminExtraRoutes() {
  const router = Router();

  // ---- feedback review -----------------------------------------------------
  router.get('/feedback', requireAdmin as any, async (req, res) => {
    try {
      const status = String(req.query.status ?? '');
      const type = String(req.query.type ?? '');
      const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const conditions = [
        status && status !== 'all' ? eq(userFeedback.status, status) : undefined,
        type ? eq(userFeedback.type, type) : undefined,
      ].filter(Boolean) as any[];
      const where = conditions.length ? and(...conditions) : undefined;

      const [rows, [{ count }]] = await Promise.all([
        db.select().from(userFeedback).where(where).orderBy(desc(userFeedback.createdAt)).limit(limit).offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)::int` }).from(userFeedback).where(where),
      ]);
      res.json({ feedback: rows, total: Number(count), page, limit });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  router.get('/feedback/:id', requireAdmin as any, async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    try {
      const [row] = await db.select().from(userFeedback).where(eq(userFeedback.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Feedback not found' });
      // AI response suggestions aren't implemented; the UI handles these being empty.
      return res.json({ feedback: row, responseSuggestion: null, alternativeSuggestions: [], responseHints: [] });
    } catch (error) {
      console.error('Error fetching feedback detail:', error);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  // AI response suggestions aren't implemented; return an empty set the UI can render.
  router.get('/feedback/:id/suggestions', requireAdmin as any, (_req, res) => {
    res.json({ suggestions: [], responseSuggestion: null, alternativeSuggestions: [], responseHints: [] });
  });

  router.patch('/feedback/:id/status', requireAdmin as any, async (req, res) => {
    const id = idParam(req);
    const status = String(req.body?.status ?? '');
    if (!id || !(FEEDBACK_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({ error: `status must be one of ${FEEDBACK_STATUSES.join(', ')}` });
    }
    try {
      const [row] = await db.update(userFeedback).set({ status }).where(eq(userFeedback.id, id)).returning();
      if (!row) return res.status(404).json({ error: 'Feedback not found' });
      return res.json(row);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  });

  router.post('/feedback/:id/respond', requireAdmin as any, async (req, res) => {
    const id = idParam(req);
    const response = String(req.body?.response ?? '').trim();
    if (!id || !response) return res.status(400).json({ error: 'A response is required' });
    try {
      const [row] = await db.select().from(userFeedback).where(eq(userFeedback.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Feedback not found' });
      const meta = (row.metadata ?? {}) as Record<string, any>;
      const responses = Array.isArray(meta.responses) ? meta.responses : [];
      responses.push({ response, by: (req as any).user?.userId ?? null, at: new Date().toISOString() });

      const [updated] = await db
        .update(userFeedback)
        .set({ status: 'reviewed', metadata: { ...meta, responses, adminResponse: response } })
        .where(eq(userFeedback.id, id))
        .returning();

      // Email the submitter if they left an address (best effort).
      let emailSent = false;
      const to = meta.email || meta.contactEmail;
      if (typeof to === 'string' && to.includes('@')) {
        try {
          const result = await sendEmail({
            to,
            subject: "Re: your feedback to Bubble's Cafe",
            text: response,
          });
          emailSent = result.success;
        } catch {
          emailSent = false;
        }
      }
      return res.json({ success: true, feedback: updated, emailSent });
    } catch (error) {
      console.error('Error responding to feedback:', error);
      return res.status(500).json({ error: 'Failed to send response' });
    }
  });

  // ---- moderation ----------------------------------------------------------
  router.get('/moderation/reported-content', requireAdmin as any, async (_req, res) => {
    try {
      const rows = await db
        .select({
          id: reportedContent.id,
          contentType: reportedContent.contentType,
          contentId: reportedContent.contentId,
          reporterId: reportedContent.reporterId,
          reason: reportedContent.reason,
          status: reportedContent.status,
          createdAt: reportedContent.createdAt,
          reporterUsername: users.username,
        })
        .from(reportedContent)
        .leftJoin(users, eq(users.id, reportedContent.reporterId))
        .orderBy(desc(reportedContent.createdAt))
        .limit(200);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching reported content:', error);
      res.status(500).json({ error: 'Failed to fetch reported content' });
    }
  });

  router.patch('/moderation/reported-content/:id', requireAdmin as any, async (req, res) => {
    const id = idParam(req);
    const status = String(req.body?.status ?? '');
    if (!id || !(MODERATION_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    try {
      const [row] = await db.update(reportedContent).set({ status }).where(eq(reportedContent.id, id)).returning();
      if (!row) return res.status(404).json({ error: 'Report not found' });
      return res.json(row);
    } catch (error) {
      console.error('Error updating report:', error);
      return res.status(500).json({ error: 'Failed to update report' });
    }
  });

  router.get('/comments/pending', requireAdmin as any, async (_req, res) => {
    try {
      const rows = await db
        .select()
        .from(comments)
        .where(eq(comments.is_approved, false))
        .orderBy(desc(comments.createdAt))
        .limit(200);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      res.status(500).json({ error: 'Failed to fetch pending comments' });
    }
  });

  // ---- email service test --------------------------------------------------
  router.get('/email/status', requireAdmin as any, async (_req, res) => {
    const [gmail, sendgrid, mailersend] = await Promise.all([
      checkGmailStatus().catch(() => false),
      checkSendGridStatus().catch(() => false),
      checkMailerSendStatus().catch(() => false),
    ]);
    const primaryService = gmail ? 'gmail' : sendgrid ? 'sendgrid' : mailersend ? 'mailersend' : 'none';
    res.json({ services: { gmail, sendgrid, mailersend }, primaryService });
  });

  const emailTestSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(300),
    text: z.string().max(10_000).optional(),
    html: z.string().max(50_000).optional(),
  });

  router.post('/email/test', requireAdmin as any, async (req, res) => {
    const parsed = emailTestSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ success: false, error: 'to and subject are required' });
    try {
      const result = await sendEmail(parsed.data);
      return res.status(result.success ? 200 : 502).json(result);
    } catch (error) {
      return res.status(502).json({ success: false, error: error instanceof Error ? error.message : 'Send failed' });
    }
  });

  // ---- post themes ---------------------------------------------------------
  // Public: the search page uses this for per-theme counts. Only public post fields.
  router.get('/posts/admin/themes', async (_req, res) => {
    try {
      const rows = await db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          themeCategory: posts.themeCategory,
          metadata: posts.metadata,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .where(eq(posts.isSecret, false))
        .orderBy(desc(posts.createdAt));
      res.json(
        rows.map((p: any) => {
          const meta = (p.metadata ?? {}) as Record<string, any>;
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            themeCategory: p.themeCategory ?? meta.themeCategory ?? null,
            createdAt: p.createdAt,
            metadata: {
              themeCategory: p.themeCategory ?? meta.themeCategory ?? null,
              themeIcon: meta.themeIcon ?? null,
              isCommunityPost: !!meta.isCommunityPost,
            },
          };
        }),
      );
    } catch (error) {
      console.error('Error fetching post themes:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  router.patch('/posts/:id/theme', requireAdmin as any, async (req, res) => {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const themeCategory = String(req.body?.themeCategory ?? req.body?.theme_category ?? '').trim() || null;
    const themeIcon = String(req.body?.themeIcon ?? req.body?.icon ?? '').trim() || null;
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const [updated] = await db
        .update(posts)
        .set({
          themeCategory,
          metadata: { ...((post.metadata ?? {}) as object), themeCategory, ...(themeIcon ? { themeIcon } : {}) },
        })
        .where(eq(posts.id, id))
        .returning();
      return res.json(updated);
    } catch (error) {
      console.error('Error updating post theme:', error);
      return res.status(500).json({ error: 'Failed to update theme' });
    }
  });

  router.patch('/themes/definitions', requireAdmin as any, async (req, res) => {
    const overrides = req.body?.overrides ?? req.body;
    if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
      return res.status(400).json({ error: 'overrides object is required' });
    }
    try {
      const value = JSON.stringify(overrides);
      if (value.length > 20_000) return res.status(400).json({ error: 'overrides too large' });
      const [row] = await db
        .insert(siteSettings)
        .values({ key: 'theme_definitions_overrides', value, category: 'themes' })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
        .returning();
      return res.json({ overrides, updatedAt: row.updatedAt });
    } catch (error) {
      console.error('Error saving theme definitions:', error);
      return res.status(500).json({ error: 'Failed to save theme definitions' });
    }
  });

  return router;
}

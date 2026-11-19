/**
 * Reader-facing endpoints ported from the retired Cloudflare Worker.
 *
 * Mounted at /api in server/index.ts:
 *   GET  /api/trending-stories
 *   GET  /api/search/suggest
 *   GET  /api/themes/categories
 *   GET  /api/themes/definitions
 *   GET  /api/auth/status
 *   POST /api/contact
 *   POST /api/newsletter-direct/subscribe
 *   POST /api/feedback
 *   POST /api/user-feedback
 *   POST /api/errors
 */
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  analytics,
  contactMessages,
  newsletterSubscriptions,
  posts,
  siteSettings,
  themeCategories,
  userFeedback,
} from '@shared/schema';
import { getOptionalUser } from '../auth-google';
import { sendEmail } from '../services/email';
import { getGmailUser } from '../services/gmail';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function stripHtml(input: string | null | undefined): string {
  return String(input ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tiny in-process TTL cache for public, read-heavy endpoints. */
const cache = new Map<string, { expires: number; value: unknown }>();
async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await load();
  cache.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

/** Limits for anonymous write endpoints (spam / abuse protection). One bucket per form. */
const formLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false },
});

function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    success: false,
    message: error.issues[0]?.message || 'Invalid request',
    errors: error.flatten().fieldErrors,
  });
}

// ---------------------------------------------------------------------------
// schemas
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('A valid email is required').max(320),
  subject: z.string().trim().max(300).optional().default('Contact Form Submission'),
  message: z.string().trim().min(1, 'Message is required').max(10_000),
  metadata: z.record(z.unknown()).optional(),
});

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(320),
});

const optionalText = (max: number) => z.string().trim().max(max).optional();
const feedbackSchema = z.object({
  type: optionalText(50),
  content: z.string().trim().min(1, 'Feedback content is required').max(10_000),
  page: optionalText(500),
  category: optionalText(50),
  browser: optionalText(200),
  operatingSystem: optionalText(200),
  screenResolution: optionalText(50),
  userAgent: optionalText(1000),
  metadata: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// routes
// ---------------------------------------------------------------------------

export function registerPublicRoutes() {
  const router = Router();

  /** Top stories ranked by views (70%) and likes (30%). */
  router.get('/trending-stories', async (_req: Request, res: Response) => {
    try {
      const payload = await cached('trending-stories', 10 * 60 * 1000, async () => {
        const rows = await db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            content: posts.content,
            createdAt: posts.createdAt,
            themeCategory: posts.themeCategory,
            readingTimeMinutes: posts.readingTimeMinutes,
            likesCount: posts.likesCount,
            baselineLikes: posts.baselineLikes,
            metadata: posts.metadata,
            pageViews: analytics.pageViews,
            averageReadTime: analytics.averageReadTime,
          })
          .from(analytics)
          .innerJoin(posts, eq(posts.id, analytics.postId))
          .where(eq(posts.isSecret, false))
          .orderBy(desc(analytics.pageViews))
          .limit(50);

        const items = rows.map((row: any) => {
          const contentText = stripHtml(row.content);
          const excerptSource = stripHtml(row.excerpt) || contentText;
          const excerpt = excerptSource.length > 180 ? `${excerptSource.slice(0, 180)}...` : excerptSource;
          const readingTime =
            row.readingTimeMinutes ?? Math.max(1, Math.ceil(contentText.split(' ').filter(Boolean).length / 200));
          const views = Number(row.pageViews ?? 0);
          const likes = Number(row.baselineLikes ?? 0) + Number(row.likesCount ?? 0);
          return {
            score: views * 0.7 + likes * 0.3,
            item: {
              id: row.id,
              slug: row.slug,
              title: { rendered: stripHtml(row.title) || 'Untitled' },
              excerpt: { rendered: excerpt },
              date: row.createdAt,
              metadata: { themeCategory: row.themeCategory ?? (row.metadata as any)?.themeCategory ?? null },
              analytics: {
                views,
                likes,
                timeOnPage: Number(row.averageReadTime || readingTime * 60),
                engagementRate: views > 0 ? Math.max(0, Math.min(1, likes / views)) : 0,
              },
            },
          };
        });

        items.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
        return { posts: items.slice(0, 20).map((entry: { item: unknown }) => entry.item) };
      });

      res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=600');
      res.json(payload);
    } catch (error) {
      console.error('Error fetching trending stories:', error);
      res.status(500).json({ posts: [], error: 'Failed to fetch trending stories' });
    }
  });

  /** Title matches first, then content matches. */
  router.get('/search/suggest', async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q ?? '').trim();
      const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1), 20);
      if (q.length < 2) return res.json({ suggestions: [] });

      const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      const rows = await db
        .select({ id: posts.id, title: posts.title, slug: posts.slug })
        .from(posts)
        .where(and(eq(posts.isSecret, false), or(ilike(posts.title, pattern), ilike(posts.content, pattern))))
        .orderBy(sql`CASE WHEN ${posts.title} ILIKE ${pattern} THEN 0 ELSE 1 END`, desc(posts.createdAt))
        .limit(limit);

      return res.json({
        suggestions: rows.map((p: any) => ({
          id: p.id,
          title: stripHtml(p.title) || 'Untitled',
          type: 'post',
          url: `/reader/${p.slug || p.id}`,
        })),
      });
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return res.status(500).json({ suggestions: [] });
    }
  });

  router.get('/themes/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await cached('theme-categories', 5 * 60 * 1000, async () => {
        const rows = await db
          .select()
          .from(themeCategories)
          .where(eq(themeCategories.isActive, true))
          .orderBy(asc(themeCategories.sortOrder), asc(themeCategories.label));
        return rows.map((row: any) => ({
          key: row.key,
          label: row.label || row.key,
          icon: row.icon ?? null,
          sortOrder: row.sortOrder ?? 0,
        }));
      });
      res.json({ categories, total: categories.length, source: 'database' });
    } catch (error) {
      console.error('Error fetching theme categories:', error);
      // The client falls back to its built-in list when this is empty.
      res.json({ categories: [], total: 0, source: 'error' });
    }
  });

  router.get('/themes/definitions', async (_req: Request, res: Response) => {
    try {
      const [row] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, 'theme_definitions_overrides'))
        .limit(1);
      let overrides: Record<string, unknown> = {};
      if (row?.value) {
        try {
          const parsed = JSON.parse(row.value);
          if (parsed && typeof parsed === 'object') overrides = parsed;
        } catch {
          // stored value isn't JSON; ignore
        }
      }
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ overrides, updatedAt: row?.updatedAt ?? null, source: 'database' });
    } catch (error) {
      console.error('Error fetching theme definitions:', error);
      res.json({ overrides: {}, updatedAt: null, source: 'error' });
    }
  });

  router.get('/auth/status', async (req: Request, res: Response) => {
    const user = await getOptionalUser(req).catch(() => null);
    if (!user) return res.json({ isAuthenticated: false });
    return res.json({
      isAuthenticated: true,
      user: { id: user.userId, email: user.email, isAdmin: user.isAdmin },
    });
  });

  router.post('/contact', formLimiter(), async (req: Request, res: Response) => {
    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success) return sendValidationError(res, parsed.error);
    const { name, email, subject, message, metadata } = parsed.data;

    try {
      await db.insert(contactMessages).values({
        name,
        email,
        subject: subject || 'Contact Form Submission',
        message,
        metadata: { ...(metadata ?? {}), ip: req.ip, receivedAt: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Error saving contact message:', error);
      return res.status(500).json({ success: false, message: 'Failed to process contact request' });
    }

    // Notify the admin. Failure here is non-fatal: the message is already saved.
    let emailStatus: 'success' | 'failed' | 'skipped' = 'skipped';
    const adminEmail = process.env.GMAIL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || getGmailUser();
    if (adminEmail) {
      try {
        const result = await sendEmail({
          to: adminEmail,
          replyTo: email,
          subject: `[Bubble's Cafe] ${subject || 'Contact form'}`,
          text: `From: ${name} <${email}>\n\n${message}`,
          html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
        });
        emailStatus = result.success ? 'success' : 'failed';
      } catch (error) {
        console.warn('Contact notification email failed:', error instanceof Error ? error.message : error);
        emailStatus = 'failed';
      }
    }

    return res.json({
      success: true,
      emailStatus,
      message: 'Your message has been received. We will get back to you soon.',
    });
  });

  router.post('/newsletter-direct/subscribe', formLimiter(), async (req: Request, res: Response) => {
    const parsed = newsletterSchema.safeParse(req.body ?? {});
    if (!parsed.success) return sendValidationError(res, parsed.error);
    const { email } = parsed.data;

    try {
      await db
        .insert(newsletterSubscriptions)
        .values({ email, status: 'active', metadata: { source: 'website' } })
        .onConflictDoUpdate({
          target: newsletterSubscriptions.email,
          set: { status: 'active', updatedAt: new Date() },
        });
      return res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
  });

  const handleFeedback = async (req: Request, res: Response) => {
    const parsed = feedbackSchema.safeParse(req.body ?? {});
    if (!parsed.success) return sendValidationError(res, parsed.error);
    const data = parsed.data;
    const user = await getOptionalUser(req).catch(() => null);

    try {
      const [row] = await db
        .insert(userFeedback)
        .values({
          type: data.type || 'general',
          content: data.content,
          page: data.page || 'unknown',
          category: data.category || data.type || 'general',
          browser: data.browser || 'unknown',
          operatingSystem: data.operatingSystem || 'unknown',
          screenResolution: data.screenResolution || 'unknown',
          userAgent: data.userAgent || req.get('user-agent') || 'unknown',
          userId: user?.userId ?? null,
          metadata: data.metadata ?? {},
        })
        .returning({ id: userFeedback.id });
      return res.status(201).json({ success: true, id: row?.id, message: 'Thank you for your feedback!' });
    } catch (error) {
      console.error('Error saving feedback:', error);
      return res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
  };
  const feedbackLimiter = formLimiter(); // shared: both paths are the same feedback form
  router.post('/feedback', feedbackLimiter, handleFeedback);
  router.post('/user-feedback', feedbackLimiter, handleFeedback);

  /** Client error reports: logged, not stored (avoids unbounded table growth). */
  router.post('/errors', telemetryLimiter, (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const summary = {
        message: String(body.message ?? body.error ?? '').slice(0, 500),
        url: String(body.url ?? '').slice(0, 300),
        errorId: body.errorId ? String(body.errorId).slice(0, 100) : undefined,
        userAgent: String(req.get('user-agent') ?? '').slice(0, 200),
      };
      console.warn('[client-error]', JSON.stringify(summary));
    } catch {
      // never fail an error report
    }
    res.status(204).end();
  });

  return router;
}

// Exported for tests
export const __test = { stripHtml, escapeHtml, contactSchema, newsletterSchema, feedbackSchema };

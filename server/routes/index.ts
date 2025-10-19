import { Express } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { postsRouter } from './posts';
import { commentsRouter } from './comments';
import { authRouter } from './auth';
import { supabaseAuthRouter } from './supabase-auth';
import { adminRoutes } from './admin';
import searchRoutes from './search';
import newsletterRoutes from './newsletter';
// import bookmarksRoutes from './bookmarks';
import emailRoutes from './email';
import moderationRoutes from './moderation';
import analyticsRoutes from './analytics';
import { registerPrivacySettingsRoutes } from './privacy-settings';
import { registerRecommendationsRoutes } from './recommendations';
import { registerPostRecommendationsRoutes } from './posts-recommendations';
import { registerUserFeedbackRoutes } from '../routes/user-feedback';
import { storage } from '../storage';
import { handleError } from '../utils/error-handler';
import healthRoutes from './health';
import { getCsrfToken } from '../middleware/csrf-protection';
import { z } from 'zod';
import seoRoutes from './seo';
import { requireAuth, requireAdmin } from '../middlewares/auth';

const routesLogger = createSecureLogger('RoutesIndex');

export function registerModularRoutes(app: Express) {
  try {
    // Health check routes (should be first for load balancers)
    app.use('/api/health', healthRoutes);
    routesLogger.info('Health check routes registered');

    // SEO routes (robots.txt, sitemap.xml)
    app.use('/', seoRoutes);
    routesLogger.info('SEO routes registered');

    // SECURITY FIX: Secure CSRF token endpoint
    app.get('/api/csrf-token', getCsrfToken);
    routesLogger.info('Secure CSRF token endpoint registered');

    // Authentication routes
    app.use('/api/auth', authRouter);
    app.use('/api/auth', supabaseAuthRouter);
    routesLogger.info('Auth routes registered');

    // Posts routes
    app.use('/api/posts', postsRouter);
    routesLogger.info('Posts routes registered');

    // Comments routes  
    app.use('/api', commentsRouter);
    routesLogger.info('Comments routes registered');

    // Search routes
    app.use('/api/search', searchRoutes);
    routesLogger.info('Search routes registered');

    // Newsletter routes
    app.use('/api/newsletter', newsletterRoutes);
    routesLogger.info('Newsletter routes registered');

    // Bookmarks routes are registered via registerBookmarkRoutes to avoid conflicts

    // Email routes
    app.use('/api/email', emailRoutes);
    routesLogger.info('Email routes registered');

    // Moderation routes
    app.use('/api', moderationRoutes);
    routesLogger.info('Moderation routes registered');

    // Analytics routes
    app.use('/api/analytics', analyticsRoutes);
    routesLogger.info('Analytics routes registered');

    // Privacy settings (function-based registration)
    registerPrivacySettingsRoutes(app, storage);
    routesLogger.info('Privacy settings routes registered');

    // Recommendations (function-based registration)
    registerRecommendationsRoutes(app, storage);
    registerPostRecommendationsRoutes(app);
    routesLogger.info('Recommendations routes registered');

    // Admin
    app.use('/api/admin', adminRoutes);
    routesLogger.info('Admin routes registered');

    // User feedback (function-based registration)
    registerUserFeedbackRoutes(app, storage);
    routesLogger.info('User feedback routes registered');

    // Feedback submission endpoint used by client
    const feedbackSchema = z.object({
      type: z.enum(['general', 'bug', 'feature', 'content']).default('general'),
      content: z.string().min(5),
      page: z.string().optional(),
      category: z.string().optional(),
      browser: z.string().optional(),
      operatingSystem: z.string().optional(),
      screenResolution: z.string().optional(),
      userAgent: z.string().optional()
    });
    app.post('/api/feedback', async (req, res) => {
      try {
        const body = feedbackSchema.parse(req.body);
        const feedback = await (storage as any).submitFeedback({
          type: body.type,
          content: body.content,
          page: body.page ?? 'unknown',
          status: 'pending',
          userId: (req as any).user?.id ?? null,
          browser: body.browser ?? 'unknown',
          operatingSystem: body.operatingSystem ?? 'unknown',
          screenResolution: body.screenResolution ?? 'unknown',
          userAgent: body.userAgent ?? req.get('User-Agent') ?? 'unknown',
          category: body.category ?? 'general',
          metadata: {}
        });
        res.status(201).json({ success: true, feedback });
      } catch (error: any) {
        routesLogger.error('Feedback submission failed', { error: error?.message });
        res.status(400).json({ error: 'Invalid feedback payload' });
      }
    });

    // Admin: list all feedback with optional filters and pagination
    app.get('/api/feedback', requireAuth, requireAdmin, async (req, res) => {
      try {
        const status = typeof req.query.status === 'string' ? req.query.status : 'all';
        const type = typeof req.query.type === 'string' ? req.query.type : undefined;
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 50);

        // Fetch a superset then paginate in memory (storage doesn't support offset)
        const all = await (storage as any).getAllFeedback(page * limit, status);
        let items = Array.isArray(all) ? all : [];

        if (type) {
          items = items.filter((f: any) => (f.type || 'general') === type);
        }

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = items.slice(start, end);

        res.json({
          feedback: paginated,
          total: items.length,
          page,
          hasMore: items.length > end
        });
      } catch (error: any) {
        routesLogger.error('Failed to list feedback', { error: error?.message });
        res.status(500).json({ error: 'Failed to list feedback' });
      }
    });

    // Admin: get feedback by id
    app.get('/api/feedback/:id', requireAuth, requireAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const item = await (storage as any).getFeedback(id);
        if (!item) {
          return res.status(404).json({ error: 'Not found' });
        }
        return res.json(item);
      } catch (error: any) {
        routesLogger.error('Failed to get feedback item', { error: error?.message });
        return res.status(500).json({ error: 'Failed to get feedback item' });
      }
    });

    // Admin: update feedback status
    app.patch('/api/feedback/:id/status', requireAuth, requireAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const schema = z.object({ status: z.string().min(1) });
        const { status } = schema.parse(req.body);
        const updated = await (storage as any).updateFeedbackStatus(id, status);
        return res.json({ success: true, feedback: updated });
      } catch (error: any) {
        routesLogger.error('Failed to update feedback status', { error: error?.message });
        return res.status(400).json({ error: 'Failed to update feedback status' });
      }
    });

    // Admin: respond to feedback (stores adminResponse in metadata)
    app.post('/api/feedback/:id/respond', requireAuth, requireAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const schema = z.object({ response: z.string().min(1) });
        const { response: adminResponse } = schema.parse(req.body);
        const responderId = (req as any).user?.id ?? null;
        const updated = await (storage as any).respondToFeedback(id, adminResponse, responderId);
        return res.json({ success: true, feedback: updated });
      } catch (error: any) {
        routesLogger.error('Failed to respond to feedback', { error: error?.message });
        return res.status(400).json({ error: 'Failed to respond to feedback' });
      }
    });

    // Admin: simple AI response suggestions (mocked)
    app.get('/api/feedback/:id/suggestions', requireAuth, requireAdmin, async (req, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ error: 'Invalid id' });
        }
        const item = await (storage as any).getFeedback(id);
        const baseText = (item?.content as string) || 'your feedback';

        const suggestion = {
          suggestion: `Thanks for the report. We’ve reviewed ${baseText.slice(0, 60)}... and will look into it.`,
          confidence: 0.82,
          category: 'acknowledgement',
          tags: ['bug', 'acknowledge'],
          isAutomated: true
        };
        const alternatives = [
          {
            suggestion: `Appreciate the detailed report. We’ve triaged this and marked it for investigation.`,
            confidence: 0.76,
            category: 'triage',
            tags: ['bug', 'triaged'],
            isAutomated: true
          },
          {
            suggestion: `We can’t reproduce this yet. Could you share steps to reproduce and a screenshot if possible?`,
            confidence: 0.69,
            category: 'follow-up',
            tags: ['info-request'],
            isAutomated: true
          }
        ];

        return res.json({ responseSuggestion: suggestion, alternativeSuggestions: alternatives });
      } catch (error: any) {
        routesLogger.error('Failed to generate suggestions', { error: error?.message });
        return res.status(500).json({ error: 'Failed to generate suggestions' });
      }
    });

    // Error reporting endpoint used by client error logger
    app.post('/api/errors', (req, res) => {
      try {
        routesLogger.warn('Client error report received', { id: req.body?.id, message: req.body?.message });
        return res.status(204).end();
      } catch (_e) {
        return res.status(204).end();
      }
    });

    // Global error handler - must be last
    app.use(handleError);
    routesLogger.info('Global error handler registered');

    routesLogger.info('All modular routes registered successfully');
  } catch (error) {
    routesLogger.error('Error registering modular routes', { error });
    throw error;
  }
}
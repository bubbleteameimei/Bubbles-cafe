import { Router } from "express";
import { storage } from "../storage";
import { userService } from '../services/user-service';
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

// Admin info endpoint
router.get("/info", requireAuth, requireAdmin, async (req, res) => {
  try {
    const adminInfo = await storage.getAdminInfo();
    res.json(adminInfo);
  } catch (error) {
    console.error("[Admin] Error fetching admin info:", error);
    res.status(500).json({ error: "Failed to fetch admin information" });
  }
});

// WordPress sync status endpoint
router.get("/wordpress/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get WordPress sync status from site settings
    const allSettings = await storage.getSiteSettings();
    const enabledSetting = allSettings.find(s => s.key === "wordpress_sync_enabled");
    const lastSyncSetting = allSettings.find(s => s.key === "last_wordpress_sync");
    const intervalSetting = allSettings.find(s => s.key === "wordpress_sync_interval");
    
    const enabled = enabledSetting?.value === "true";
    const lastSync = lastSyncSetting?.value ? new Date(parseInt(lastSyncSetting.value)) : null;
    const interval = parseInt(intervalSetting?.value || "300000"); // 5 minutes default
    
    // Calculate next sync time
    const nextSync = enabled && lastSync ? 
      new Date(lastSync.getTime() + interval) : null;
    
    // Get posts count
    const postsCount = await storage.getPostCount();
    
    // Check if sync is currently running (simple check based on recent activity)
    const recentActivity = await storage.getRecentActivity(1);
    const isRunning = recentActivity.length > 0 && 
      recentActivity[0].action === "wordpress_sync" &&
      Date.now() - new Date(recentActivity[0].createdAt).getTime() < 60000; // Less than 1 minute ago
    
    res.json({
      enabled,
      isRunning,
      lastSync: lastSync?.toISOString(),
      nextSync: nextSync?.toISOString(),
      postsCount,
      syncInterval: interval,
      totalProcessed: postsCount, // For now, assume all posts are from WordPress
      errors: [] // TODO: Implement error tracking
    });
  } catch (error) {
    console.error("[Admin] Error fetching WordPress sync status:", error);
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
});

// WordPress sync logs endpoint
router.get("/wordpress/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get recent WordPress sync activity logs
    const logs = await storage.getRecentActivity(20);
    
    // Filter and format WordPress sync logs
    const syncLogs = logs
      .filter(log => log.action === "wordpress_sync")
      .map(log => {
        const details = (log.details as any) || {};
        return {
          id: log.id.toString(),
          timestamp: log.createdAt.toISOString(),
          status: details.status || "success",
          message: details.message || "WordPress sync completed",
          postsProcessed: details.postsProcessed || 0,
          duration: details.duration || 0
        };
      });
    
    res.json(syncLogs);
  } catch (error) {
    console.error("[Admin] Error fetching WordPress sync logs:", error);
    res.status(500).json({ error: "Failed to fetch sync logs" });
  }
});

// Trigger WordPress sync endpoint
router.post("/wordpress/sync", requireAuth, requireAdmin, async (req, res) => {
  try {
    // Log the sync trigger
    await storage.logActivity({
      userId: req.user!.id,
      action: "wordpress_sync_trigger",
      details: {
        triggeredBy: req.user!.email,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });
    
    // In a real implementation, this would trigger the WordPress sync process
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: "WordPress sync triggered successfully"
    });
  } catch (error) {
    console.error("[Admin] Error triggering WordPress sync:", error);
    res.status(500).json({ error: "Failed to trigger WordPress sync" });
  }
});

// Toggle WordPress sync endpoint
router.post("/wordpress/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== "boolean") {
      res.status(400).json({ error: "Invalid enabled value" });
      return;
    }
    
    // Update the WordPress sync enabled setting
    await storage.updateSiteSetting("wordpress_sync_enabled", enabled.toString());
    
    // Log the toggle action
    await storage.logActivity({
      userId: req.user!.id,
      action: "wordpress_sync_toggle",
      details: {
        enabled,
        toggledBy: req.user!.email,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });
    
    res.json({
      success: true,
      enabled,
      message: `WordPress sync ${enabled ? "enabled" : "disabled"} successfully`
    });
  } catch (error) {
    console.error("[Admin] Error toggling WordPress sync:", error);
    res.status(500).json({ error: "Failed to toggle WordPress sync" });
  }
});

// Site analytics endpoint
router.get("/analytics", requireAuth, requireAdmin, async (req, res) => {
  try {
    const analytics = await storage.getSiteAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("[Admin] Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Recent activity endpoint
router.get("/activity", requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activity = await storage.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    console.error("[Admin] Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// Users management endpoint
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Get users with pagination
    const users = await userService.getUsers(page, limit);
    res.json(users);
  } catch (error) {
    console.error("[Admin] Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Posts management endpoint with filters
router.get("/posts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const featured = req.query.featured === 'true';
    const status = (req.query.status as string) || 'all';
    
    const result = await storage.getPosts(page, limit, { search, category });
    let posts = result.posts as any[];

    // Optional UI-level filters
    if (status && status !== 'all') {
      posts = posts.filter(p => {
        const meta = (p.metadata || {}) as any;
        const s = (meta.status || '').toString().toLowerCase();
        return status === 'published' ? s === 'publish' : s === 'draft' || s === 'pending';
      });
    }
    if (featured) {
      posts = posts.filter(p => ((p.metadata || {}) as any).featured === true);
    }

    const total = posts.length;
    const stats = {
      published: posts.filter(p => ((p.metadata || {}) as any).status === 'publish').length,
      pending: 0,
      flagged: 0,
    };

    res.json({ posts, total, stats, hasMore: result.hasMore });
  } catch (error) {
    console.error("[Admin] Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Pending posts list
router.get('/posts/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pending = await storage.getPendingPosts();
    res.json({ posts: pending, total: pending.length, stats: { pending: pending.length, flagged: 0, published: 0 } });
  } catch (error) {
    console.error("[Admin] Error fetching pending posts:", error);
    res.status(500).json({ error: 'Failed to fetch pending posts' });
  }
});

// Flagged posts list (best-effort; depends on metadata)
router.get('/posts/flagged', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await storage.getPosts(1, 500, {});
    const flagged = (result.posts as any[]).filter(p => ((p.metadata || {}) as any).flagged === true || ((p.metadata || {}) as any).flagCount > 0);
    res.json({ posts: flagged, total: flagged.length, stats: { flagged: flagged.length, pending: 0, published: 0 } });
  } catch (error) {
    console.error("[Admin] Error fetching flagged posts:", error);
    res.status(500).json({ error: 'Failed to fetch flagged posts' });
  }
});

// Update a post (partial)
router.patch('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await storage.updatePost(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("[Admin] Error updating post:", error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await storage.deletePost(id);
    res.json(deleted);
  } catch (error) {
    console.error("[Admin] Error deleting post:", error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Publish / Unpublish
router.patch('/posts/:id/publish', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await storage.updatePost(id, { metadata: { status: 'publish' } as any });
    res.json(post);
  } catch (error) {
    console.error("[Admin] Error publishing post:", error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

router.patch('/posts/:id/unpublish', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await storage.updatePost(id, { metadata: { status: 'draft' } as any });
    res.json(post);
  } catch (error) {
    console.error("[Admin] Error unpublishing post:", error);
    res.status(500).json({ error: 'Failed to unpublish post' });
  }
});

// Feature / Unfeature
router.patch('/posts/:id/feature', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await storage.updatePost(id, { metadata: { featured: true } as any });
    res.json(post);
  } catch (error) {
    console.error("[Admin] Error featuring post:", error);
    res.status(500).json({ error: 'Failed to feature post' });
  }
});

router.patch('/posts/:id/unfeature', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await storage.updatePost(id, { metadata: { featured: false } as any });
    res.json(post);
  } catch (error) {
    console.error("[Admin] Error unfeaturing post:", error);
    res.status(500).json({ error: 'Failed to unfeature post' });
  }
});

// Bulk actions
router.post('/posts/bulk', requireAuth, requireAdmin, async (req, res) => {
  try {
    const schema = z.object({
      action: z.enum(['publish', 'unpublish', 'delete', 'feature', 'unfeature']),
      postIds: z.array(z.number().int().positive())
    });
    const { action, postIds } = schema.parse(req.body);

    const results: any[] = [];
    for (const id of postIds) {
      switch (action) {
        case 'publish':
          results.push(await storage.updatePost(id, { metadata: { status: 'publish' } as any }));
          break;
        case 'unpublish':
          results.push(await storage.updatePost(id, { metadata: { status: 'draft' } as any }));
          break;
        case 'feature':
          results.push(await storage.updatePost(id, { metadata: { featured: true } as any }));
          break;
        case 'unfeature':
          results.push(await storage.updatePost(id, { metadata: { featured: false } as any }));
          break;
        case 'delete':
          results.push(await storage.deletePost(id));
          break;
      }
    }

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("[Admin] Error processing bulk action:", error);
    res.status(500).json({ error: 'Failed to process bulk action' });
  }
});

export { router as adminRoutes };
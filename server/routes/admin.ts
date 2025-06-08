import { Router } from "express";
import { storage } from "../storage";
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
    const enabledSetting = await storage.getSiteSettingByKey("wordpress_sync_enabled");
    const lastSyncSetting = await storage.getSiteSettingByKey("last_wordpress_sync");
    const intervalSetting = await storage.getSiteSettingByKey("wordpress_sync_interval");
    
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
      .map(log => ({
        id: log.id.toString(),
        timestamp: log.createdAt.toISOString(),
        status: log.details?.status || "success",
        message: log.details?.message || "WordPress sync completed",
        postsProcessed: log.details?.postsProcessed || 0,
        duration: log.details?.duration || 0
      }));
    
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
      return res.status(400).json({ error: "Invalid enabled value" });
    }
    
    // Update the WordPress sync enabled setting
    await storage.setSiteSetting("wordpress_sync_enabled", enabled.toString(), "wordpress");
    
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
    const users = await storage.getUsers(page, limit);
    res.json(users);
  } catch (error) {
    console.error("[Admin] Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Posts management endpoint
router.get("/posts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const posts = await storage.getPosts(page, limit);
    res.json(posts);
  } catch (error) {
    console.error("[Admin] Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Site settings endpoints
router.get("/settings", requireAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await storage.getAllSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("[Admin] Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch site settings" });
  }
});

router.post("/settings", requireAuth, requireAdmin, async (req, res) => {
  try {
    const settingsSchema = z.object({
      key: z.string().min(1),
      value: z.string(),
      category: z.string().min(1),
      description: z.string().optional()
    });
    
    const { key, value, category, description } = settingsSchema.parse(req.body);
    
    await storage.setSiteSetting(key, value, category, description);
    
    // Log the setting change
    await storage.logActivity({
      userId: req.user!.id,
      action: "setting_updated",
      details: {
        key,
        category,
        updatedBy: req.user!.email
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent")
    });
    
    res.json({ success: true, message: "Setting updated successfully" });
  } catch (error) {
    console.error("[Admin] Error updating setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export { router as adminRoutes };
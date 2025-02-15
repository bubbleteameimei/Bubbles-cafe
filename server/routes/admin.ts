import { Router } from "express";
import { db } from "../db";
import { requireAdmin } from "../middleware/admin";
import { users, posts, comments } from "../../shared/schema";
import { count, eq, desc } from "drizzle-orm";

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Get admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalStories,
      pendingComments
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(comments).where(eq(comments.approved, false))
    ]);

    // Get recent activity
    const recentActivity = await db
      .select()
      .from(comments)
      .orderBy(desc(comments.createdAt))
      .limit(5);

    res.json({
      totalUsers: totalUsers[0].value,
      totalStories: totalStories[0].value,
      pendingComments: pendingComments[0].value,
      recentActivity: recentActivity.map(comment => ({
        description: `New comment on post ${comment.postId}`,
        timestamp: comment.createdAt
      }))
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

export default router;
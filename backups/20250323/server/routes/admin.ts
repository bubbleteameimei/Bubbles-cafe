import { Router } from 'express';
import { storage } from '../storage';
import { isAdmin } from '../middleware/admin';

const router = Router();

// Get admin profile
router.get("/profile", isAdmin, async (req, res) => {
  try {
    const adminUser = await storage.getUser(req.user!.id);
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Remove sensitive information
    const { password_hash, ...safeAdminUser } = adminUser;

    res.json({
      ...safeAdminUser,
      role: 'admin',
      permissions: ['manage_posts', 'manage_users', 'manage_comments']
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
});

// Get admin dashboard data
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const [posts, comments, users] = await Promise.all([
      storage.getPosts(1, 5),
      storage.getRecentComments(),
      storage.getAdminByEmail(req.user!.email)
    ]);

    res.json({
      recentPosts: posts.posts.slice(0, 5),
      recentComments: comments,
      adminUsers: users
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Failed to fetch admin dashboard data" });
  }
});

export default router;

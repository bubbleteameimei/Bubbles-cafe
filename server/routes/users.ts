
import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import bcrypt from 'bcrypt';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Get current user's profile
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Omit password hash from response
    const { password_hash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update user profile
router.patch('/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    });

    const validatedData = updateSchema.parse(req.body);
    
    // Check if email is being updated and is not already taken
    if (validatedData.email) {
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update user data
    const updatedUser = await storage.updateUser(userId, {
      username: validatedData.name,
      email: validatedData.email,
    });

    // Omit password hash from response
    const { password_hash, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

// Update user password
router.patch('/me/password', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const passwordSchema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    });

    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    
    // Verify current password
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    await storage.updateUserPassword(userId, hashedPassword);
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Failed to update password" });
  }
});

export default router;

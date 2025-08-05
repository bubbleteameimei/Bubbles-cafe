import { Router } from "express";
import { z } from "zod";

import { createLogger } from "../utils/debug-logger";
import { storage } from '../storage';

const router = Router();
const logger = createLogger("firebase-auth");

// Firebase user sync schema
const firebaseUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().optional(),
});

// Sync Firebase user with backend database
router.post("/firebase-sync", async (req, res) => {
  try {
    const userData = firebaseUserSchema.parse(req.body);
    
    if (!userData.email) {
      return res.status(400).json({ error: "Email is required" });
    }

    logger.info("Syncing Firebase user with backend", { 
      uid: userData.uid, 
      email: userData.email 
    });

    // Check if user already exists by email
    let user = await storage.getUserByUsername(userData.email); // Using getUserByUsername as it's available

    if (!user) {
      // Create new user
      const newUserData = {
        username: userData.displayName || userData.email.split('@')[0],
        email: userData.email,
        password_hash: "", // Firebase handles auth, so no password needed
      };
      
      user = await storage.createUser(newUserData);
      logger.info("Created new user from Firebase", { userId: user.id, email: user.email });
    }

    // Update user data - we'll need to add these methods to storage later

    // Set session
    req.session.userId = user.id;
    req.session.user = user;

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      }
    });

  } catch (error: any) {
    logger.error("Firebase sync error", { error: error.message });
    res.status(500).json({ error: "Failed to sync Firebase user" });
  }
});

export { router as firebaseAuthRoutes };
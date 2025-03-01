import { Router } from "express";
import { storage } from "../storage";
import { UserSettings } from "@shared/schema";

const router = Router();

// Get user settings
router.get("/api/user/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const settings = await storage.getUserSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update user settings
router.patch("/api/user/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updatedSettings = await storage.updateUserSettings(req.user.id, req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;

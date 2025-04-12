import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { insertGameSaveSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for user management
  app.post("/api/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid user data" });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(result.data);
      return res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  });

  // API routes for game saves
  app.get("/api/saves/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const saves = await storage.getGameSaves(userId);
      return res.json(saves);
    } catch (error) {
      console.error("Error fetching saves:", error);
      return res.status(500).json({ error: "Failed to fetch saves" });
    }
  });

  app.post("/api/saves", async (req, res) => {
    try {
      const result = insertGameSaveSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid save data" });
      }

      const save = await storage.saveGame(result.data);
      return res.status(201).json(save);
    } catch (error) {
      console.error("Error saving game:", error);
      return res.status(500).json({ error: "Failed to save game" });
    }
  });

  app.delete("/api/saves/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid save ID" });
      }

      const success = await storage.deleteGameSave(id);
      if (success) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: "Save not found" });
      }
    } catch (error) {
      console.error("Error deleting save:", error);
      return res.status(500).json({ error: "Failed to delete save" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

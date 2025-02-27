import { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import { z } from "zod";

// Basic health check endpoint
export function registerRoutes(app: Express): Server {
  // API routes need the correct content type
  app.use('/api/*', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Basic health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // User management endpoints
  app.delete("/api/users/me", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.deleteUser(userId);

      req.logout(() => {
        req.session.destroy(() => {
          res.clearCookie('connect.sid');
          res.status(200).json({ message: "Account deleted successfully" });
        });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  app.delete("/api/users/me/reading-history", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.clearReadingHistory(userId);
      res.status(200).json({ message: "Reading history cleared successfully" });
    } catch (error) {
      console.error("Error clearing reading history:", error);
      res.status(500).json({ message: "Failed to clear reading history" });
    }
  });

  app.delete("/api/users/me/progress", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.resetUserProgress(userId);
      res.status(200).json({ message: "Progress reset successfully" });
    } catch (error) {
      console.error("Error resetting progress:", error);
      res.status(500).json({ message: "Failed to reset progress" });
    }
  });

  // Create server instance
  return createServer(app);
}
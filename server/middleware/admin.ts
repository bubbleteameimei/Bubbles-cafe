import { Request, Response, NextFunction } from "express";
import { User } from "../../shared/schema";

// Extend the session type to include our user
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
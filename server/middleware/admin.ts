import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: "Access denied: Admin privileges required" });
    return;
  }

  next();
};

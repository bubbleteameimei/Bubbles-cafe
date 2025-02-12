import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || process.env.REPLIT_ID!, // Fallback to REPL_ID if SESSION_SECRET not set
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/'
    },
    name: 'sessionId',
    rolling: true
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie!.secure = true;
    sessionSettings.proxy = true;
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email: string, password: string, done) => {
      try {
        console.log('[Auth] Attempting login for email:', email);
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log('[Auth] User not found:', email);
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          console.log('[Auth] Invalid password for user:', email);
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.isAdmin) {
          console.log('[Auth] User is not an admin:', email);
          return done(null, false, { message: "Unauthorized access" });
        }

        console.log('[Auth] Login successful for user:', email);
        return done(null, user);
      } catch (error) {
        console.error("[Auth] Authentication error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done: (err: any, id?: number) => void) => {
    console.log('[Auth] Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: any, user?: Express.User | false) => void) => {
    try {
      console.log('[Auth] Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('[Auth] User not found during deserialization:', id);
        return done(null, false);
      }
      console.log('[Auth] User deserialized successfully:', id);
      done(null, user);
    } catch (error) {
      console.error("[Auth] Deserialization error:", error);
      done(error);
    }
  });

  // Admin authentication middleware
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Add JSON response endpoints with rate limiting and better error handling
  app.post("/api/admin/login", (req: Request, res: Response, next: NextFunction) => {
    console.log('[Auth] Admin login attempt for:', req.body.email);
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return res.status(500).json({ 
          message: process.env.NODE_ENV === 'production' 
            ? "An error occurred during authentication" 
            : err.message 
        });
      }
      if (!user) {
        console.log('[Auth] Login failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("[Auth] Login error:", loginErr);
          return res.status(500).json({ message: "Error establishing session" });
        }
        console.log('[Auth] Login successful for user:', user.email);
        return res.json({ 
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          username: user.username
        });
      });
    })(req, res, next);
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const sessionId = req.sessionID;
    console.log('[Auth] Logout attempt for session:', sessionId);
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("[Auth] Session destruction error:", destroyErr);
          return res.status(500).json({ message: "Error clearing session" });
        }
        console.log('[Auth] Logout successful for session:', sessionId);
        res.clearCookie('sessionId');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/admin/user", requireAdmin, (req: Request, res: Response) => {
    console.log('[Auth] Checking admin authentication status');
    if (!req.isAuthenticated()) {
      console.log('[Auth] User not authenticated');
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log('[Auth] Admin authenticated:', req.user?.email);
    const { id, email, isAdmin, username } = req.user!;
    res.json({ id, email, isAdmin, username });
  });

  return { requireAdmin };
}
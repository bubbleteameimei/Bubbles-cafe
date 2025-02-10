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
    secret: process.env.SESSION_SECRET || process.env.REPL_ID!, // Fallback to REPL_ID if SESSION_SECRET not set
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/'
    },
    name: 'sessionId',
    rolling: true // Refresh session with each request
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
        const user = await storage.getUserByEmail(email);

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.isAdmin) {
          return done(null, false, { message: "Unauthorized access" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done: (err: any, id?: number) => void) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: (err: any, user?: Express.User | false) => void) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  // Add JSON response endpoints with rate limiting and better error handling
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
          message: process.env.NODE_ENV === 'production' 
            ? "An error occurred during authentication" 
            : err.message 
        });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Error establishing session" });
        }
        return res.json({ 
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          username: user.username
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    const sessionId = req.sessionID;
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destruction error:", destroyErr);
          return res.status(500).json({ message: "Error clearing session" });
        }
        res.clearCookie('sessionId');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Only send necessary user data
    const { id, email, isAdmin, username } = req.user!;
    res.json({ id, email, isAdmin, username });
  });
}
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

interface AuthInfo {
  message: string;
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    },
    name: 'sessionId' // Change from default 'connect.sid'
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email: string, password: string, done: (error: any, user?: Express.User | false, options?: AuthInfo) => void) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValid = await comparePasswords(password, user.password_hash);
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
    }),
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

  // Admin-specific routes
  app.get("/api/admin/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ message: "Unauthorized: Please log in again" });
    }
    res.json({ 
      id: req.user.id,
      email: req.user.email,
      isAdmin: req.user.isAdmin 
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: AuthInfo) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Failed to establish session" });
        }
        res.json({ 
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    try {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return next(err);
        }
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Session destruction error:", sessionErr);
          }
          res.clearCookie('sessionId');
          res.json({ message: "Logged out successfully" });
        });
      });
    } catch (error) {
      console.error("Logout error:", error);
      next(error);
    }
  });
}
import { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import * as bcrypt from "bcrypt";
import { User } from "@shared/schema";

// Extend Express.User with our User type but avoid password_hash
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
      isAdmin: boolean;
      createdAt: Date;
    }
  }
}

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'));
      }
      // Omit password_hash from user object before passing to client
      const { password_hash, ...safeUser } = user;
      done(null, safeUser);
    } catch (error) {
      done(error);
    }
  });

  // Update LocalStrategy to use email with debug logging
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email: string, password: string, done) => {
    try {
      console.log(`Attempting login for email: ${email}`);
      const user = await storage.getUserByEmail(email);

      if (!user) {
        console.log('User not found');
        return done(null, false, { message: 'Invalid email or password' });
      }

      console.log('User found, comparing passwords');
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log(`Password validation result: ${isValid}`);

      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Omit password_hash from user object before passing to client
      const { password_hash, ...safeUser } = user;
      return done(null, safeUser);
    } catch (error) {
      console.error('Login error:', error);
      done(error);
    }
  }));

  // Add registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, username } = req.body;

      // Validate input
      if (!email || !password || !username) {
        return res.status(400).json({ 
          message: "Email, password, and username are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await storage.createUser({
        email,
        username,
        password_hash: hashedPassword,
        isAdmin: false // New users are not admins by default
      });

      // Omit password_hash before sending response
      const { password_hash, ...safeUser } = user;

      // Log user in after registration
      req.login(safeUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Add login endpoint with proper typing
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  // Add logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Add user info endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}
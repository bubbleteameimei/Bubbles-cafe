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

const SALT_ROUNDS = 10;

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    console.log('[Auth] Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('[Auth] Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('[Auth] User not found during deserialization:', id);
        return done(new Error('User not found'));
      }
      // Omit password_hash from user object before passing to client
      const { password_hash, ...safeUser } = user;
      done(null, safeUser);
    } catch (error) {
      console.error('[Auth] Error during deserialization:', error);
      done(error);
    }
  });

  // Update LocalStrategy to use email
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email: string, password: string, done) => {
    try {
      console.log('[Auth] Attempting login with email:', email);
      const user = await storage.getUserByEmail(email);

      if (!user) {
        console.log('[Auth] User not found with email:', email);
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Compare plain password with stored hash
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log('[Auth] Password validation result:', isValid);
      console.log('[Auth] Login attempt details:', {
        email,
        hashedPassword: user.password_hash,
        isValid
      });

      if (!isValid) {
        console.log('[Auth] Invalid password for user:', email);
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Omit password_hash from user object before passing to client
      const { password_hash, ...safeUser } = user;
      console.log('[Auth] Login successful for user:', email);
      return done(null, safeUser);
    } catch (error) {
      console.error('[Auth] Login error:', error);
      done(error);
    }
  }));

  // Add login endpoint with enhanced logging
  app.post("/api/login", (req, res, next) => {
    console.log('[Auth] Login request received:', { 
      email: req.body.email,
      hasPassword: !!req.body.password,
      body: JSON.stringify(req.body)
    });

    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error('[Auth] Login error:', err);
        return next(err);
      }
      if (!user) {
        console.log('[Auth] Login failed:', info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('[Auth] Session creation error:', err);
          return next(err);
        }
        console.log('[Auth] Login successful:', { id: user.id, email: user.email });
        return res.json(user);
      });
    })(req, res, next);
  });

  // Add other routes...
  app.post("/api/register", async (req, res) => {
    try {
      console.log('[Auth] Registration attempt:', { email: req.body.email, username: req.body.username });
      const { email, password, username } = req.body;

      // Validate input
      if (!email || !password || !username) {
        console.log('[Auth] Missing registration fields:', { email: !!email, password: !!password, username: !!username });
        return res.status(400).json({ 
          message: "Email, password, and username are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        console.log('[Auth] Registration failed - email already exists:', email);
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log('[Auth] Password hashed successfully');

      // Create user
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        isAdmin: false
      });

      // Omit password_hash before sending response
      const { password_hash, ...safeUser } = user;

      // Log user in after registration
      req.login(safeUser, (err) => {
        if (err) {
          console.error('[Auth] Error logging in after registration:', err);
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        console.log('[Auth] Registration successful:', { id: user.id, email });
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      console.error("[Auth] Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const userId = req.user?.id;
    console.log('[Auth] Logout request received:', { userId });
    req.logout((err) => {
      if (err) {
        console.error('[Auth] Logout error:', err);
        return res.status(500).json({ message: "Error logging out" });
      }
      console.log('[Auth] Logout successful:', { userId });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('[Auth] Unauthenticated user info request');
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log('[Auth] User info request:', { id: req.user?.id });
    res.json(req.user);
  });
}
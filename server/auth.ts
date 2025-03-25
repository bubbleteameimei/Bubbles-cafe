import { Express, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import bcryptjs from "bcryptjs";
import * as crypto from "crypto";
import { User, InsertResetToken } from "@shared/schema";

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
      const isValid = await bcryptjs.compare(password, user.password_hash);
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
  app.post("/api/auth/login", (req, res, next) => {
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
  app.post("/api/auth/register", async (req, res) => {
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

      // Create user - storage will handle password hashing
      console.log('[Auth] Creating user with registration data');
      const user = await storage.createUser({
        username,
        password,
        email, // Keep email as top-level property for backward compatibility
        isAdmin: false,
        metadata: {
          email // Also store in metadata for our new approach
        }
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

  app.post("/api/auth/logout", (req, res) => {
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

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('[Auth] Unauthenticated user info request');
      return res.status(401).json({ message: "Not authenticated" });
    }
    console.log('[Auth] User info request:', { id: req.user?.id });
    res.json(req.user);
  });
  
  // Add social login endpoint
  app.post("/api/auth/social-login", async (req, res) => {
    try {
      console.log('[Auth] Social login request received:', { 
        provider: req.body.provider,
        email: req.body.email,
        socialId: req.body.socialId
      });
      
      const { socialId, email, username, provider, photoURL, token } = req.body;
      
      if (!socialId || !email) {
        console.log('[Auth] Missing social login fields:', { socialId: !!socialId, email: !!email });
        return res.status(400).json({ message: "Social ID and email are required" });
      }
      
      // Check if user exists with this email
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create a new user if they don't exist
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        console.log('[Auth] Creating new user for social login:', { email, provider });
        
        try {
          // Create new user with social metadata
          user = await storage.createUser({
            username: username || email.split('@')[0],
            email, // Include as top-level property for backward compatibility
            password: randomPassword, // pass the unhashed password, storage handles hashing
            isAdmin: false,
            metadata: {
              email, // Also store in metadata for our new approach
              socialId,
              provider,
              lastLogin: new Date().toISOString(),
              displayName: username || null,
              photoURL: photoURL || null
            }
          });
          
          console.log('[Auth] New user created via social login:', { id: user.id, provider });
        } catch (createError) {
          console.error('[Auth] Error creating user for social login:', createError);
          return res.status(500).json({ message: "Error creating user account" });
        }
      } else {
        // Update existing user's social login metadata
        console.log('[Auth] Existing user found for social login:', { id: user.id, email });
        
        try {
          // Update user metadata with latest social login info
          // Handle metadata with type safety
          const existingMetadata = user.metadata || {};
          const updatedMetadata = Object.assign({}, existingMetadata, {
            socialId,
            provider,
            lastLogin: new Date().toISOString(),
            // Store user profile data in metadata
            displayName: username || (existingMetadata as any)?.displayName || null,
            photoURL: photoURL || (existingMetadata as any)?.photoURL || null
          });
          
          await storage.updateUser(user.id, {
            metadata: updatedMetadata
          });
        } catch (updateError) {
          console.error('[Auth] Error updating user for social login:', updateError);
          // Continue with login even if update fails - don't block login
        }
      }
      
      // Omit password_hash from user object
      const { password_hash, ...safeUser } = user;
      
      // Log the user in using the session
      req.login(safeUser, (err) => {
        if (err) {
          console.error('[Auth] Session creation error during social login:', err);
          return res.status(500).json({ message: "Error logging in with social account" });
        }
        
        console.log('[Auth] Social login successful:', { id: user.id, provider });
        return res.json(safeUser);
      });
    } catch (error) {
      console.error("[Auth] Social login error:", error);
      res.status(500).json({ message: "Error processing social login" });
    }
  });

  // Password reset request route
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      console.log('[Auth] Password reset requested for email:', email);
      
      // Find the user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        // Instead, pretend success but don't actually do anything
        console.log('[Auth] Password reset requested for non-existent email:', email);
        return res.json({ 
          success: true, 
          message: "If your email exists in our system, you'll receive a password reset link shortly" 
        });
      }
      
      // Generate a unique token for password reset
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calculate token expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Store token in database
      const resetTokenData: InsertResetToken = {
        userId: user.id,
        token,
        expiresAt,
        used: false
      };
      
      await storage.createResetToken(resetTokenData);
      
      console.log('[Auth] Password reset token created for user:', user.id);
      
      // In a real application, we would send an email here
      // But for this simulation, we'll just log the token and return it
      console.log('[Auth] Password reset token (for testing):', token);
      
      return res.json({ 
        success: true, 
        message: "If your email exists in our system, you'll receive a password reset link shortly",
        // Including token in response only for testing - would be sent via email in production
        token: token
      });
    } catch (error) {
      console.error('[Auth] Password reset request error:', error);
      return res.status(500).json({ message: "Error processing password reset request" });
    }
  });
  
  // Test metadata endpoint - temporary for verification
  app.get("/api/auth/test-metadata", async (req: Request, res: Response) => {
    try {
      // Create a unique username and email for this test
      const timestamp = Date.now();
      const username = `test_metadata_user_${timestamp}`;
      const email = `test${timestamp}@example.com`;
      
      // Create a test user with metadata
      const testUser = await storage.createUser({
        username,
        email,
        password: "password123",
        isAdmin: false,
        metadata: {
          displayName: "Test Metadata User",
          bio: "This is a test user for metadata verification",
          lastLogin: new Date().toISOString(),
          preferences: {
            darkMode: true,
            fontSize: "medium"
          }
        }
      });
      
      // Get the user back from storage to verify metadata handling
      const retrievedUser = await storage.getUser(testUser.id);
      
      if (!retrievedUser) {
        throw new Error('Failed to retrieve newly created user');
      }
      
      // Extract metadata with type safety
      const metadata = retrievedUser.metadata || {};
      
      // Return verification results
      res.json({
        success: true,
        message: "Metadata test successful",
        testUser,
        retrievedUser,
        metadataAccess: {
          displayName: (metadata as any).displayName,
          bio: (metadata as any).bio,
          lastLogin: (metadata as any).lastLogin,
          preferences: (metadata as any).preferences
        }
      });
    } catch (error) {
      console.error('[Auth] Metadata test error:', error);
      res.status(500).json({ 
        success: false,
        message: "Error testing metadata",
        error: String(error)
      });
    }
  });
  
  // Verify reset token
  app.get("/api/auth/verify-reset-token/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      console.log('[Auth] Verifying password reset token:', token);
      
      // Check if token exists and is valid
      const resetToken = await storage.getResetTokenByToken(token);
      
      if (!resetToken) {
        console.log('[Auth] Invalid password reset token:', token);
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        console.log('[Auth] Expired password reset token:', token);
        return res.status(400).json({ message: "Token has expired" });
      }
      
      // Check if token is already used
      if (resetToken.used) {
        console.log('[Auth] Already used password reset token:', token);
        return res.status(400).json({ message: "Token has already been used" });
      }
      
      console.log('[Auth] Valid password reset token for user:', resetToken.userId);
      
      return res.json({ 
        success: true, 
        userId: resetToken.userId 
      });
    } catch (error) {
      console.error('[Auth] Verify reset token error:', error);
      return res.status(500).json({ message: "Error verifying token" });
    }
  });
  
  // Reset password with token
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      console.log('[Auth] Processing password reset with token');
      
      // Check if token exists and is valid
      const resetToken = await storage.getResetTokenByToken(token);
      
      if (!resetToken) {
        console.log('[Auth] Invalid reset token for password reset');
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        console.log('[Auth] Expired reset token for password reset');
        return res.status(400).json({ message: "Token has expired" });
      }
      
      // Check if token is already used
      if (resetToken.used) {
        console.log('[Auth] Already used reset token for password reset');
        return res.status(400).json({ message: "Token has already been used" });
      }
      
      // Get user from token
      const user = await storage.getUser(resetToken.userId);
      
      if (!user) {
        console.log('[Auth] User not found for reset token:', resetToken.userId);
        return res.status(400).json({ message: "User not found" });
      }
      
      // Update user's password
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
      
      await storage.updateUser(user.id, {
        password_hash: hashedPassword
      });
      
      // Mark token as used
      await storage.markResetTokenAsUsed(token);
      
      console.log('[Auth] Password reset successful for user:', user.id);
      
      return res.json({ 
        success: true, 
        message: "Password has been reset successfully" 
      });
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      return res.status(500).json({ message: "Error resetting password" });
    }
  });
}
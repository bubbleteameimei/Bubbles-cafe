import { Express, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import bcryptjs from "bcryptjs";
import * as crypto from "crypto";
import { User, InsertResetToken } from "@shared/schema";
import { emailService } from "./utils/email-service";
import { authRateLimiter, sensitiveOperationsRateLimiter } from "./middlewares/rate-limiter";
import { createSecureLogger } from "./utils/secure-logger";

const authLogger = createSecureLogger('Auth');

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
    authLogger.debug('Serializing user', { userId: user.id });
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      authLogger.debug('Deserializing user', { userId: id });
      const user = await storage.getUser(id);
      if (!user) {
        authLogger.warn('User not found during deserialization', { userId: id });
        return done(new Error('User not found'));
      }
      // Omit password_hash from user object before passing to client
      const { password_hash, ...safeUser } = user;
      done(null, safeUser);
    } catch (error) {
      authLogger.error('Error during deserialization', { userId: id, error: error instanceof Error ? error.message : 'Unknown error' });
      done(error);
    }
  });

  // Update LocalStrategy to use email
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email: string, password: string, done) => {
    try {
      authLogger.debug('Login attempt', { email: email.trim().toLowerCase() });
      // Use a trimmed lowercase email to ensure consistency
      const normalizedEmail = email.trim().toLowerCase();
      const user = await storage.getUserByEmail(normalizedEmail);

      if (!user) {
        authLogger.warn('User not found during login');
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Add safety check for undefined password_hash
      if (!user.password_hash) {
        authLogger.warn('User found but password_hash is undefined');
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      // Compare plain password with stored hash using a try-catch to handle any bcrypt errors
      let isValid = false;
      try {
        isValid = await bcryptjs.compare(password, user.password_hash);
      } catch (compareError) {
        authLogger.error('Error comparing passwords', { 
          email: normalizedEmail, 
          error: compareError instanceof Error ? compareError.message : 'Unknown error' 
        });
        // If bcrypt fails, we consider it an invalid password
        // No fallback to plaintext comparison - that creates a security risk
        isValid = false;
      }
      
      authLogger.debug('Password validation completed', { 
        email: normalizedEmail, 
        isValid, 
        hashedPasswordExists: !!user.password_hash 
      });

      if (!isValid) {
        authLogger.warn('Invalid password attempt', { email: normalizedEmail });
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Omit password_hash from user object before passing to client
      const { password_hash: user_password_hash, ...safeUser } = user;
      authLogger.info('Login successful', { email: normalizedEmail, userId: safeUser.id });
      return done(null, safeUser);
    } catch (error) {
      authLogger.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
      done(error);
    }
  }));

  // Add login endpoint with enhanced logging, remember me feature, and rate limiting
  app.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    authLogger.debug('Login request received', { 
      email: req.body.email,
      hasPassword: !!req.body.password,
      rememberMe: !!req.body.rememberMe,
      body: JSON.stringify(req.body)
    });

    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        authLogger.error('Login error', { err: err instanceof Error ? err.message : 'Unknown error' });
        return next(err);
      }
      if (!user) {
        authLogger.warn('Login failed', { message: info?.message });
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      const loginOptions: any = {};
      
      // If rememberMe is true, set a longer session expiration (30 days)
      if (req.body.rememberMe) {
        loginOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        authLogger.debug('Remember me enabled, setting long session expiration');
      }
      
      req.login(user, loginOptions, (err) => {
        if (err) {
          authLogger.error('Session creation error', { err: err instanceof Error ? err.message : 'Unknown error' });
          return next(err);
        }
        authLogger.info('Login successful', { id: user.id, email: user.email, rememberMe: !!req.body.rememberMe });
        return res.json(user);
      });
    })(req, res, next);
  });

  // Add other routes...
  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    try {
      authLogger.debug('Registration attempt', { email: req.body.email, username: req.body.username });
      let { email, password, username } = req.body;

      // Validate input
      if (!email || !password || !username) {
        authLogger.warn('Missing registration fields', { email: !!email, password: !!password, username: !!username });
        res.status(400).json({ message: "Email, password, and username are required" });
        return;
      }
      
      // Normalize email to prevent duplicate accounts with different case
      email = email.trim().toLowerCase();
      username = username.trim();
      
      // Basic validation
      if (email === '') {
        res.status(400).json({ message: "Email cannot be empty" });
        return;
      }
      if (username === '') {
        res.status(400).json({ message: "Username cannot be empty" });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters long" });
        return;
      }

      // Check if user already exists with normalized email
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        authLogger.warn('Registration failed - email already exists', { email });
        res.status(400).json({ message: "Email already registered" });
        return;
      }

      // Create user - storage will handle password hashing
      authLogger.debug('Creating user with registration data');
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
      const user = await storage.createUser({
        username,
        email,
        password_hash: hashedPassword,
        isAdmin: false,
        metadata: {
          email,
          registeredAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      });

      // Omit password_hash before sending response
      const { password_hash, ...safeUser } = user;

      // Log user in after registration
      req.login(safeUser, (err) => {
        if (err) {
          authLogger.error('Error logging in after registration', { err: err instanceof Error ? err.message : 'Unknown error' });
          res.status(500).json({ message: "Error logging in after registration" });
          return;
        }
        authLogger.info('Registration successful', { id: user.id, email });
        res.status(201).json(safeUser);
        return;
      });
      return;
    } catch (error) {
      authLogger.error('Registration error', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ message: "Error creating user" });
      return;
    }
  });

  app.post("/api/auth/logout", (req, res): void => {
    const userId = req.user?.id;
    authLogger.debug('Logout request received', { userId });
    req.logout((err) => {
      if (err) {
        authLogger.error('Logout error', { err: err instanceof Error ? err.message : 'Unknown error' });
        res.status(500).json({ message: "Error logging out" });
        return;
      }
      authLogger.info('Logout successful', { userId });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      authLogger.debug('Unauthenticated user info request');
      return res.status(401).json({ message: "Not authenticated" });
    }
    authLogger.debug('User info request', { id: req.user?.id });
    return res.json(req.user);
  });
  
  // Add social login endpoint with rate limiting
  app.post("/api/auth/social-login", authRateLimiter, async (req, res) => {
    try {
      authLogger.debug('Social login request received', { 
        provider: req.body.provider,
        email: req.body.email,
        socialId: req.body.socialId
      });
      
      let { socialId, email, username, provider, photoURL, token } = req.body;
      
      if (!socialId || !email) {
        authLogger.warn('Missing social login fields', { socialId: !!socialId, email: !!email });
        return res.status(400).json({ message: "Social ID and email are required" });
      }
      
      // Normalize email to ensure consistency
      email = email.trim().toLowerCase();
      if (username) username = username.trim();
      
      // Check if user exists with this email (normalized)
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create a new user if they don't exist
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        authLogger.debug('Creating new user for social login', { email, provider });
        
        try {
          // Create new user with social metadata
          const password_hash = await bcryptjs.hash(randomPassword, SALT_ROUNDS);
          user = await storage.createUser({
            username: username || email.split('@')[0],
            email,
            password_hash,
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
          
          authLogger.info('New user created via social login', { id: user.id, provider });
        } catch (createError) {
          authLogger.error('Error creating user for social login', { error: createError instanceof Error ? createError.message : 'Unknown error' });
          return res.status(500).json({ message: "Error creating user account" });
        }
      } else {
        // Update existing user's social login metadata
        authLogger.debug('Existing user found for social login', { id: user.id, email });
        
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
          authLogger.error('Error updating user for social login', { error: updateError instanceof Error ? updateError.message : 'Unknown error' });
          // Continue with login even if update fails - don't block login
        }
      }
      
      // Omit password_hash from user object
      const { password_hash, ...safeUser } = user;
      
      // Log the user in using the session
      req.login(safeUser, (err) => {
        if (err) {
          authLogger.error('Session creation error during social login', { err: err instanceof Error ? err.message : 'Unknown error' });
          return res.status(500).json({ message: "Error logging in with social account" });
        }
        
        authLogger.info('Social login successful', { id: user.id, provider });
        return res.json(safeUser);
      });
      return;
    } catch (error) {
      authLogger.error('Social login error', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ message: "Error processing social login" });
      return;
    }
  });

  // Password reset request route with rate limiting
  app.post("/api/auth/forgot-password", sensitiveOperationsRateLimiter, async (req: Request, res: Response) => {
    try {
      let { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Normalize email to prevent case-sensitivity issues
      email = email.trim().toLowerCase();
      
      authLogger.debug('Password reset requested for email', { email });
      
      // Find the user by email (using normalized email)
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        // Instead, pretend success but don't actually do anything
        authLogger.debug('Password reset requested for non-existent email', { email });
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
      
      authLogger.debug('Password reset token created for user', { userId: user.id });
      
      // Send password reset email using our email service
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        token,
        user.username
      );
      
      authLogger.debug('Password reset email sent', { emailSent });
      
      // Security: Never log password reset tokens, even in development
      // Tokens should only be sent via secure email channels
      
      const response: any = { 
        success: true, 
        message: "If your email exists in our system, you'll receive a password reset link shortly",
        emailSent
      };
      
      // Include token in development mode for easier testing
      if (process.env.NODE_ENV === 'development') {
        response.token = token;
      }
      
      return res.json(response);
    } catch (error) {
      authLogger.error('Password reset request error', { error: error instanceof Error ? error.message : 'Unknown error' });
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
      const password_hash = await bcryptjs.hash("password123", SALT_ROUNDS);
      const testUser = await storage.createUser({
        username,
        email,
        password_hash,
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
      authLogger.error('Metadata test error', { error: error instanceof Error ? error.message : 'Unknown error' });
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
      
      authLogger.debug('Verifying password reset token', { token });
      
      // Check if token exists and is valid
      const resetToken = await storage.getResetTokenByToken(token);
      
      if (!resetToken) {
        authLogger.warn('Invalid password reset token', { token });
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        authLogger.warn('Expired password reset token', { token });
        return res.status(400).json({ message: "Token has expired" });
      }
      
      // Check if token is already used
      if (resetToken.used) {
        authLogger.warn('Already used password reset token', { token });
        return res.status(400).json({ message: "Token has already been used" });
      }
      
      authLogger.debug('Valid password reset token for user', { userId: resetToken.userId });
      
      return res.json({ 
        success: true, 
        userId: resetToken.userId 
      });
    } catch (error) {
      authLogger.error('Verify reset token error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ message: "Error verifying token" });
    }
  });
  
  // Reset password with token - apply rate limiting for security
  app.post("/api/auth/reset-password", sensitiveOperationsRateLimiter, async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      authLogger.debug('Processing password reset with token');
      
      // Check if token exists and is valid
      const resetToken = await storage.getResetTokenByToken(token);
      
      if (!resetToken) {
        authLogger.warn('Invalid reset token for password reset', { token });
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        authLogger.warn('Expired reset token for password reset', { token });
        return res.status(400).json({ message: "Token has expired" });
      }
      
      // Check if token is already used
      if (resetToken.used) {
        authLogger.warn('Already used reset token for password reset', { token });
        return res.status(400).json({ message: "Token has already been used" });
      }
      
      // Get user from token
      const user = await storage.getUser(resetToken.userId);
      
      if (!user) {
        authLogger.warn('User not found for reset token', { userId: resetToken.userId });
        return res.status(400).json({ message: "User not found" });
      }
      
      // Update user's password
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
      
      await storage.updateUser(user.id, {
        password_hash: hashedPassword
      });
      
      // Mark token as used
      await storage.markResetTokenAsUsed(token);
      
      authLogger.debug('Password reset successful for user', { userId: user.id });
      
      return res.json({ 
        success: true, 
        message: "Password has been reset successfully" 
      });
    } catch (error) {
      authLogger.error('Reset password error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ message: "Error resetting password" });
    }
  });
}
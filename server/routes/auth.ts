import { Request, Response, Router } from "express";
import { createSecureLogger } from '../utils/secure-logger';
import { validateBody, commonSchemas } from '../middleware/input-validation';
import { asyncHandler, createError } from '../utils/error-handler';
import { z } from "zod";
import { userRegistrationSchema, userLoginSchema } from "@shared/schema";
import { authRateLimiter, sensitiveOperationsRateLimiter } from '../middlewares/rate-limiter';
import passport from "passport";
import * as bcrypt from 'bcryptjs';
import { storage } from '../storage';

const authLogger = createSecureLogger('AuthRoutes');
const router = Router();

// Password reset schema
const passwordResetRequestSchema = z.object({
  email: commonSchemas.email
});

const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
});

// POST /api/auth/register - User registration
router.post('/register',
  authRateLimiter,
  validateBody(userRegistrationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        throw createError.conflict('User with this email already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const newUser = await storage.createUser({
        email,
        username,
        password_hash: hashedPassword,
        metadata: {}
      });
      
      authLogger.info('User registered successfully', { userId: newUser.id });
      
      // Return user without password
      const { password_hash, ...safeUser } = newUser;
      res.status(201).json({
        success: true,
        user: safeUser,
        message: 'Registration successful'
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) throw error;
      authLogger.error('Registration error', { email, error });
      throw createError.internal('Registration failed');
    }
  })
);

// POST /api/auth/login - User login
router.post('/login',
  authRateLimiter,
  validateBody(userLoginSchema),
  asyncHandler(async (req: Request, res: Response, _next: any) => {
    passport.authenticate('local', (err: any, user: any, _info: any) => {
      if (err) {
        authLogger.error('Login authentication error', { error: err });
        return _next(createError.internal('Authentication failed'));
      }
      
      if (!user) {
        authLogger.warn('Login failed - invalid credentials');
        return _next(createError.unauthorized('Invalid email or password'));
      }
      
      (req as any).logIn(user, (err: any) => {
        if (err) {
          authLogger.error('Login session error', { error: err });
          return _next(createError.internal('Login failed'));
        }
        
        // Set session expiration based on rememberMe
        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        
        authLogger.info('User logged in successfully', { userId: user.id });
        
        return res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: user.isAdmin
          },
          message: 'Login successful'
        });
      });
    })(req, res, _next);
  })
);

// POST /api/auth/logout - User logout
router.post('/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    (req as any).logout((err: any) => {
      if (err) {
        authLogger.error('Logout error', { userId, error: err });
        throw createError.internal('Logout failed');
      }
      
      req.session.destroy((err) => {
        if (err) {
          authLogger.error('Session destruction error', { userId, error: err });
          throw createError.internal('Session cleanup failed');
        }
        
        authLogger.info('User logged out successfully', { userId });
        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    });
  })
);

// GET /api/auth/me - Get current user info
router.get('/me',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      authLogger.debug('Unauthenticated user info request');
      return res.json({ user: null });
    }
    
    authLogger.debug('User info request', { userId: req.user.id });
    return res.json({ user: req.user });
  })
);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password',
  sensitiveOperationsRateLimiter,
  validateBody(passwordResetRequestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        authLogger.warn('Password reset requested for non-existent email');
        // Don't reveal if email exists - security best practice
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }
      
      // Generate reset token
      await storage.createPasswordResetToken(user.id);
      
      // Send reset email (implement email service)
      // await emailService.sendPasswordResetEmail(email, resetToken);
      
      authLogger.info('Password reset token created', { userId: user.id });
      
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      authLogger.error('Password reset request error', { email, error });
      throw createError.internal('Password reset request failed');
    }
  })
);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password',
  sensitiveOperationsRateLimiter,
  validateBody(passwordResetSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    try {
      // Verify reset token
      const resetToken = await storage.verifyPasswordResetToken(token);
      if (!resetToken) {
        throw createError.badRequest('Invalid or expired reset token');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user password
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      
      // Delete used token
      await storage.deletePasswordResetToken(token);
      
      authLogger.info('Password reset successful', { userId: resetToken.userId });
      
      return res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error: any) {
      if (error.statusCode) throw error;
      authLogger.error('Password reset error', { error });
      throw createError.internal('Password reset failed');
    }
  })
);

// POST /api/auth/change-password - Change password (authenticated)
router.post('/change-password',
  sensitiveOperationsRateLimiter,
  validateBody(z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number")
  })),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    try {
      // Get user with password hash
      const user = await storage.getUserWithPassword(userId);
      if (!user || !user.password_hash) {
        throw createError.notFound('User not found');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw createError.badRequest('Current password is incorrect');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await storage.updateUserPassword(userId, hashedPassword);
      
      authLogger.info('Password changed successfully', { userId });
      
      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      if (error.statusCode) throw error;
      authLogger.error('Password change error', { userId, error });
      throw createError.internal('Password change failed');
    }
  })
);

export { router as authRouter };
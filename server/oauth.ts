import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '../shared/schema';
import { config } from '../shared/config';
import './auth'; // Import Express namespace augmentation

// Define the Google OAuth user profile
interface GoogleProfile {
  id: string;
  displayName: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  provider: string;
}

// Reuse the serialization from auth.ts since we already set it up there
// Just add typings to make it clear for TypeScript
// We don't need to re-implement serialization/deserialization as it was already done in auth.ts

// Passport serialization is only performed once, even across multiple files
// So we don't need to duplicate this code here

export function setupOAuth(app: Express) {
  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '329473416186-pg9bu1jmiko7h0r84ri9i15i83g3ocl5.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
        callbackURL: '/api/auth/google/callback',
        // For development environments where callback URL might be different
        proxy: true
      },
      async (accessToken, refreshToken, profile: GoogleProfile, done) => {
        try {
          // Check if user exists by email
          let user: User | undefined;
          
          if (profile.emails && profile.emails.length > 0) {
            const email = profile.emails[0].value;
            user = await storage.getUserByEmail(email);
            
            if (!user) {
              // User doesn't exist, create a new one
              console.log(`[OAuth] Creating new user from Google profile: ${profile.displayName}`);
              
              const newUser = await storage.createUser({
                email,
                username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(Math.random() * 1000),
                password: '', // Empty password for OAuth users
                isAdmin: false,
                fullName: profile.displayName,
                avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
                bio: '',
                metadata: {
                  googleId: profile.id,
                  provider: 'google'
                }
              });
              
              // Return the newly created user
              return done(null, newUser);
            }
            
            // Return existing user
            return done(null, user);
          } else {
            // No email provided in the profile
            return done(new Error('No email was provided by Google OAuth'), undefined);
          }
        } catch (error) {
          console.error('[OAuth] Error in Google strategy:', error);
          return done(error, undefined);
        }
      }
    )
  );

  // Initialize Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get(
    '/api/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login?error=google_auth_failed',
      session: true
    }),
    (req: Request, res: Response) => {
      // Successful authentication, redirect to home page or a success page
      res.redirect('/');
    }
  );

  // Logout route
  app.get('/api/auth/logout', (req: Request, res: Response) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  // Check if user is authenticated
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as User;
      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          fullName: user.fullName,
          avatar: user.avatar
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Middleware for checking authentication
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Not authenticated' });
  };

  // Protected route example
  app.get('/api/auth/profile', isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as User;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      fullName: user.fullName,
      avatar: user.avatar
    });
  });
}
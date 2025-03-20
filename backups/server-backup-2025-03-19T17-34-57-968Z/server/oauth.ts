import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

// Define types for OAuth profiles
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

// Define metadata types
interface OAuthProvider {
  providerId: string;
  lastLogin: string;
}

interface OAuthData {
  [provider: string]: OAuthProvider;
}

interface UserMetadata {
  oauth?: OAuthData;
  [key: string]: any;
}

export function setupOAuth(app: Express) {
  // Local strategy for username/password authentication
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    },
      async (accessToken, refreshToken, profile: GoogleProfile, done) => {
        try {
          // Check if user exists by email
          let user = null;
          if (profile.emails && profile.emails.length > 0) {
            user = await storage.getUserByEmail(profile.emails[0].value);
          }

          if (user) {
            // Update existing user with OAuth info if needed
            const photoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            if (photoUrl && !user.avatar) {
              const currentMetadata = user.metadata || {};
              const updatedMetadata = (currentMetadata || {}) as UserMetadata;
              const oauthData = updatedMetadata.oauth || {} as OAuthData;
              
              user = await storage.updateUser(user.id, {
                avatar: photoUrl,
                metadata: {
                  ...updatedMetadata,
                  oauth: {
                    ...oauthData,
                    [profile.provider]: {
                      providerId: profile.id,
                      lastLogin: new Date().toISOString()
                    }
                  }
                }
              });
            }
            return done(null, user);
          } else {
            // Create new user with OAuth info
            if (!profile.emails || profile.emails.length === 0) {
              return done(new Error('No email provided by Google'));
            }

            const email = profile.emails[0].value;
            const photoUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
            
            // Generate a random secure password for OAuth users
            const password = uuidv4();
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = await storage.createUser({
              email,
              username: email.split('@')[0] + '_' + Math.floor(Math.random() * 10000),
              password,
              fullName: profile.displayName || undefined,
              avatar: photoUrl || undefined,
              metadata: {
                oauth: {
                  [profile.provider]: {
                    providerId: profile.id,
                    lastLogin: new Date().toISOString()
                  }
                }
              }
            });
            
            return done(null, newUser);
          }
        } catch (error) {
          return done(error);
        }
      }
    ));
  }

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Route for social login from Firebase
  app.post('/api/auth/social-login', async (req: Request, res: Response) => {
    try {
      const { providerId, email, displayName, photoURL, provider } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        // Update user with social login info if needed
        const updatedFields: any = {};
        let needsUpdate = false;
        
        // Update avatar if not set
        if (photoURL && !user.avatar) {
          updatedFields.avatar = photoURL;
          needsUpdate = true;
        }
        
        // Update full name if not set
        if (displayName && !user.fullName) {
          updatedFields.fullName = displayName;
          needsUpdate = true;
        }
        
        // Update metadata to include social provider info
        const userMetadata = (user.metadata || {}) as UserMetadata;
        const oauthData = userMetadata.oauth || {} as OAuthData;
        
        if (!userMetadata.oauth || !oauthData[provider]) {
          updatedFields.metadata = {
            ...userMetadata,
            oauth: {
              ...oauthData,
              [provider]: {
                providerId,
                lastLogin: new Date().toISOString()
              }
            }
          };
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          user = await storage.updateUser(user.id, updatedFields);
        }
      } else {
        // Create a new user
        const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
        const password = uuidv4(); // Generate random password
        
        user = await storage.createUser({
          email,
          username,
          password,
          fullName: displayName || null,
          avatar: photoURL || null,
          metadata: {
            oauth: {
              [provider]: {
                providerId,
                lastLogin: new Date().toISOString()
              }
            }
          }
        });
      }
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Authentication error' });
        }
        
        // Return user data without sensitive information
        return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          avatar: user.avatar,
          fullName: user.fullName,
          bio: user.bio
        });
      });
    } catch (error) {
      console.error('Social login error:', error);
      return res.status(500).json({ error: 'Social login failed' });
    }
  });
  
  // Setup Google routes
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
      res.redirect('/');
    }
  );

  // Logout route
  app.get('/api/auth/logout', (req: Request, res: Response) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  });

  // Auth status route
  app.get('/api/auth/status', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      console.log('[Auth] Authenticated user info request:', user.id);
      
      // Return user data without sensitive information
      return res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email, 
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          avatar: user.avatar,
          fullName: user.fullName,
          bio: user.bio
        }
      });
    } else {
      console.log('[Auth] Unauthenticated user info request');
      return res.json({ isAuthenticated: false });
    }
  });

  // Authentication middleware for protected routes
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  };

  // User profile route
  app.get('/api/auth/profile', isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      avatar: user.avatar,
      fullName: user.fullName,
      bio: user.bio
    });
  });
}
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
  displayName?: string | null;
  photoURL?: string | null;
  bio?: string | null;
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
            // Store profile data in metadata instead
            const currentMetadata = user.metadata || {};
            const updatedMetadata = (currentMetadata || {}) as UserMetadata;
            const oauthData = updatedMetadata.oauth || {} as OAuthData;
            
            user = await storage.updateUser(user.id, {
              metadata: {
                ...updatedMetadata,
                photoURL: photoUrl || updatedMetadata.photoURL,
                displayName: profile.displayName || updatedMetadata.displayName,
                oauth: {
                  ...oauthData,
                  [profile.provider]: {
                    socialId: profile.id, // Changed from providerId to socialId for consistency
                    lastLogin: new Date().toISOString()
                  }
                }
              }
            });
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
              // Remove fullName and avatar as they don't exist in the database
              metadata: {
                displayName: profile.displayName || undefined,
                photoURL: photoUrl || undefined,
                oauth: {
                  [profile.provider]: {
                    socialId: profile.id, // Changed from providerId to socialId for consistency
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
        
        // Get user metadata once
        const userMetadata = (user.metadata || {}) as UserMetadata;
        const oauthData = userMetadata.oauth || {} as OAuthData;
        
        // Store profile info in metadata since the columns don't exist
        if (photoURL || displayName) {
          updatedFields.metadata = {
            ...userMetadata,
            displayName: displayName || userMetadata.displayName || null,
            photoURL: photoURL || userMetadata.photoURL || null
          };
          needsUpdate = true;
        }
        
        if (!userMetadata.oauth || !oauthData[provider]) {
          updatedFields.metadata = {
            ...userMetadata,
            oauth: {
              ...oauthData,
              [provider]: {
                socialId: providerId,
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
          // Store displayName and photoURL in metadata instead
          metadata: {
            displayName: displayName || null,
            photoURL: photoURL || null,
            oauth: {
              [provider]: {
                socialId: providerId,
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
        // Extract profile data from metadata since those columns don't exist
        const metadata = (user.metadata || {}) as UserMetadata;
        return res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          // Use metadata values instead
          avatar: metadata.photoURL || null,
          fullName: metadata.displayName || null,
          bio: metadata.bio || null
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
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req: Request, res: Response) => {
      // Log successful authentication
      console.log('[OAuth] Google authentication successful for user:', (req.user as any)?.id);
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
      const metadata = user.metadata || {};
      return res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email, 
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          // Use metadata values since those columns don't exist in the database
          avatar: metadata.photoURL || null,
          fullName: metadata.displayName || null,
          bio: metadata.bio || null
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

  // User profile route - GET
  app.get('/api/auth/profile', isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as any;
    const metadata = user.metadata || {};
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      // Use metadata values since the columns don't exist in the database
      avatar: metadata.photoURL || null,
      fullName: metadata.displayName || null,
      bio: metadata.bio || null
    });
  });

  // User profile update route - PATCH
  app.patch('/api/auth/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { username, metadata } = req.body;
      
      // Validate input
      if (username && (username.length < 3 || username.length > 30)) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
      }
      
      // Check if username is already taken (if being changed)
      if (username && username !== user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (username) {
        updateData.username = username;
      }
      
      // Handle metadata update
      if (metadata) {
        const currentMetadata = user.metadata || {};
        updateData.metadata = {
          ...currentMetadata,
          displayName: metadata.fullName !== undefined ? metadata.fullName : currentMetadata.displayName,
          photoURL: metadata.avatar !== undefined ? metadata.avatar : currentMetadata.photoURL,
          bio: metadata.bio !== undefined ? metadata.bio : currentMetadata.bio
        };
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No changes provided' });
      }
      
      // Save updates
      const updatedUser = await storage.updateUser(user.id, updateData);
      
      // Return updated profile
      const updatedMetadata = updatedUser.metadata || {};
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        avatar: updatedMetadata && typeof updatedMetadata === 'object' && 'photoURL' in updatedMetadata ? updatedMetadata.photoURL : null,
        fullName: updatedMetadata && typeof updatedMetadata === 'object' && 'displayName' in updatedMetadata ? updatedMetadata.displayName : null,
        bio: updatedMetadata && typeof updatedMetadata === 'object' && 'bio' in updatedMetadata ? updatedMetadata.bio : null
      });
    } catch (error) {
      console.error('[Profile] Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });
}
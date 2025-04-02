import { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

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

  // Local authentication only - Google OAuth has been removed

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
  
  // Google OAuth routes have been removed

  // Logout route
  app.get('/api/auth/logout', (req: Request, res: Response) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      // For cross-domain setup, check if we need to redirect to frontend URL
      const frontendUrl = process.env.FRONTEND_URL || '';
      
      if (frontendUrl && frontendUrl !== '*') {
        // In split deployment, redirect to the frontend URL
        console.log('[Auth] Redirecting to frontend URL after logout:', frontendUrl);
        res.redirect(frontendUrl);
      } else {
        // In development or same-domain setup, redirect to the root
        res.redirect('/');
      }
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
      
      // Update session with the latest user data
      if (req.session && req.session.user) {
        // Update username if changed
        if (username && username !== user.username) {
          req.session.user.username = username;
        }
        
        // Update avatar if changed
        if (metadata && metadata.avatar && metadata.avatar !== req.session.user.avatar) {
          req.session.user.avatar = metadata.avatar;
        }
        
        // Save the session
        req.session.save((err) => {
          if (err) {
            console.error('[Profile] Error saving session:', err);
          }
        });
      }
      
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

  // Profile image upload route
  app.patch('/api/auth/profile-with-image', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      // Create a buffer to store the file data
      let fileData = Buffer.alloc(0);
      let contentType = '';
      let fileName = '';
      let username = '';
      let fullName = '';
      let bio = '';
      
      // Define allowed file types
      const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      // Define max file size (10MB) - increased to match server limit
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      
      // Check if the request's content type is multipart/form-data
      if (!req.headers['content-type']?.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Content type must be multipart/form-data' });
      }
      
      // Get the boundary from the content type
      const boundary = req.headers['content-type']
        .split(';')[1]
        ?.trim()
        .split('=')[1];
      
      if (!boundary) {
        return res.status(400).json({ error: 'Invalid multipart/form-data format' });
      }
      
      let currentField = '';
      let collectingFileData = false;
      let fileDataChunks: Buffer[] = [];
      
      // Parse the multipart form data with improved chunk handling
      req.on('data', (chunk) => {
        // Convert chunk to string for header inspection
        const chunkStr = chunk.toString();
        
        // Look for form field boundaries
        if (chunkStr.includes(`--${boundary}`)) {
          collectingFileData = false;
          
          // Check for field names in this chunk
          if (chunkStr.includes('name="username"')) {
            currentField = 'username';
          } else if (chunkStr.includes('name="fullName"')) {
            currentField = 'fullName';
          } else if (chunkStr.includes('name="bio"')) {
            currentField = 'bio';
          } else if (chunkStr.includes('name="avatarFile"')) {
            currentField = 'avatarFile';
            collectingFileData = true;
            
            // Extract content type and filename if available
            if (chunkStr.includes('Content-Type:')) {
              contentType = chunkStr.split('Content-Type:')[1].split('\r\n')[0].trim();
            }
            
            if (chunkStr.includes('filename=')) {
              fileName = chunkStr.split('filename=')[1].split('\r\n')[0].trim().replace(/"/g, '');
            }
          }
        }
        
        // Handle data based on current field
        if (collectingFileData && currentField === 'avatarFile') {
          // For file data, store the raw buffer for later processing
          fileDataChunks.push(chunk);
        } else if (currentField && !collectingFileData) {
          // For text fields, extract the value
          const fieldMatch = chunkStr.match(new RegExp(`name="${currentField}"[\\s\\S]*?\\r\\n\\r\\n([\\s\\S]*?)(?=\\r\\n--${boundary}|$)`));
          if (fieldMatch && fieldMatch[1]) {
            const value = fieldMatch[1].trim();
            switch (currentField) {
              case 'username':
                username = value;
                break;
              case 'fullName':
                fullName = value;
                break;
              case 'bio':
                bio = value;
                break;
            }
          }
        }
      });
      
      req.on('end', async () => {
        try {
          // Process file data if we have it
          if (fileDataChunks.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
          }
          
          // Combine all the file data chunks
          fileData = Buffer.concat(fileDataChunks);
          
          // Extract the actual file content from the multipart data
          // This is a simplistic approach - in production we'd use a proper parser
          const dataStr = fileData.toString();
          const headerEndIndex = dataStr.indexOf('\r\n\r\n');
          if (headerEndIndex > -1) {
            // Skip the headers
            fileData = fileData.slice(headerEndIndex + 4);
            
            // Find the end boundary
            const boundaryIndex = fileData.indexOf(`--${boundary}`);
            if (boundaryIndex > -1) {
              fileData = fileData.slice(0, boundaryIndex - 2); // -2 for \r\n
            }
          }
          
          // Validate the file
          if (fileData.length === 0) {
            return res.status(400).json({ error: 'Empty file uploaded' });
          }
          
          // Check if the file size is too large (adjust for multipart overhead)
          if (fileData.length > MAX_FILE_SIZE) {
            return res.status(400).json({ error: 'File is too large (max 10MB)' });
          }
          
          // Check file type
          if (!ACCEPTED_IMAGE_TYPES.includes(contentType)) {
            return res.status(400).json({ error: 'File type not supported (use .jpg, .jpeg, .png, or .webp)' });
          }
          
          // Convert image to base64 for storage
          const base64Image = `data:${contentType};base64,${fileData.toString('base64')}`;
          
          // Prepare the user update
          const currentMetadata = user.metadata || {};
          const updateData: any = {
            metadata: {
              ...currentMetadata,
              photoURL: base64Image
            }
          };
          
          // Add additional form fields if provided
          if (username && username !== user.username) {
            // Check if username is already taken 
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser && existingUser.id !== user.id) {
              return res.status(400).json({ error: 'Username is already taken' });
            }
            updateData.username = username;
          }
          
          if (fullName) {
            updateData.metadata.displayName = fullName;
          }
          
          if (bio) {
            updateData.metadata.bio = bio;
          }
          
          // Save the update
          const updatedUser = await storage.updateUser(user.id, updateData);
          
          // Update session with latest user data
          if (req.session && req.session.user) {
            // Update username if changed
            if (username && username !== user.username) {
              req.session.user.username = username;
            }
            
            // Update other user details in session
            const updatedMetadata = (updatedUser.metadata || {}) as UserMetadata;
            if (updatedMetadata.photoURL && updatedMetadata.photoURL !== req.session.user.avatar) {
              req.session.user.avatar = updatedMetadata.photoURL;
            }
            
            // Save the session changes
            req.session.save((err) => {
              if (err) {
                console.error('[Profile] Error saving session:', err);
              }
            });
          }
          
          // Return success response
          const updatedMetadata = (updatedUser.metadata || {}) as UserMetadata;
          res.json({
            success: true,
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              avatar: updatedMetadata.photoURL || null,
              fullName: updatedMetadata.displayName || null,
              bio: updatedMetadata.bio || null,
              isAdmin: updatedUser.isAdmin,
              createdAt: updatedUser.createdAt
            }
          });
        } catch (error) {
          console.error('[Profile] Error processing image upload:', error);
          res.status(500).json({ error: 'Failed to process image upload' });
        }
      });
      
      req.on('error', (error) => {
        console.error('[Profile] Error in upload request:', error);
        res.status(500).json({ error: 'Upload failed' });
      });
      
    } catch (error) {
      console.error('[Profile] Error in profile image upload:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}
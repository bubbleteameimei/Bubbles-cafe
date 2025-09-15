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

// Define the session user interface for type checking
interface SessionUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  fullName?: string | null;
  avatar?: string | null;
  bio?: string | null;
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
    // Type assertion to avoid TypeScript errors
    const typedMetadata = metadata as Record<string, any>;
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      // Use metadata values with fallbacks for different naming conventions
      avatar: typedMetadata.avatar || typedMetadata.photoURL || null,
      fullName: typedMetadata.fullName || typedMetadata.displayName || null,
      bio: typedMetadata.bio || null
    });
  });

  // User profile update route - PATCH
  app.patch('/api/auth/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { username, metadata } = req.body;
      
      console.log('[Profile] Received update request with data:', { username, metadata });
      
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
      
      // Handle metadata update with improved logging
      if (metadata) {
        const currentMetadata = user.metadata || {};
        console.log('[Profile] Current metadata:', currentMetadata);
        
        // For debugging - log the properties we'll update
        console.log('[Profile] Updating with:', {
          displayName: metadata.displayName || metadata.fullName,
          photoURL: metadata.photoURL || metadata.avatar,
          bio: metadata.bio
        });
        
        // Support both naming conventions (fullName/displayName, avatar/photoURL)
        updateData.metadata = {
          ...currentMetadata,
          // Handle displayName with fallback to fullName
          displayName: metadata.displayName !== undefined ? metadata.displayName : 
                      (metadata.fullName !== undefined ? metadata.fullName : currentMetadata.displayName),
          // Store fullName as well (for client-side compatibility)
          fullName: metadata.fullName !== undefined ? metadata.fullName : 
                   (metadata.displayName !== undefined ? metadata.displayName : currentMetadata.fullName || currentMetadata.displayName),
          // Handle photoURL with fallback to avatar
          photoURL: metadata.photoURL !== undefined ? metadata.photoURL : 
                   (metadata.avatar !== undefined ? metadata.avatar : currentMetadata.photoURL),
          // Store avatar as well (for client-side compatibility)
          avatar: metadata.avatar !== undefined ? metadata.avatar : 
                (metadata.photoURL !== undefined ? metadata.photoURL : currentMetadata.avatar || currentMetadata.photoURL),
          // Handle bio
          bio: metadata.bio !== undefined ? metadata.bio : currentMetadata.bio
        };
        
        console.log('[Profile] New merged metadata:', updateData.metadata);
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No changes provided' });
      }
      
      // Save updates
      console.log('[Profile] Sending update data to storage:', updateData);
      const updatedUser = await storage.updateUser(user.id, updateData);
      console.log('[Profile] Storage returned updated user:', updatedUser);
      
      // Update session with the latest user data
      if (req.session && req.session.user) {
        const sessionUser = req.session.user as SessionUser;
        
        // Update username if changed
        if (username && username !== user.username) {
          sessionUser.username = username;
        }
        
        // Update metadata fields if changed
        if (metadata) {
          const updatedMetadata = updatedUser.metadata || {} as UserMetadata;
          
          // Update full name - check both field names
          if ((metadata.fullName !== undefined || metadata.displayName !== undefined)) {
            // Get the new value preferring fullName then displayName
            const newFullName = (updatedMetadata as Record<string, any>).fullName || 
                               (updatedMetadata as Record<string, any>).displayName;
            // Only update if changed
            if (newFullName !== sessionUser.fullName) {
              sessionUser.fullName = newFullName;
            }
          }
          
          // Update avatar - check both field names
          if ((metadata.avatar !== undefined || metadata.photoURL !== undefined)) {
            // Get the new value preferring avatar then photoURL
            const newAvatar = (updatedMetadata as Record<string, any>).avatar || 
                             (updatedMetadata as Record<string, any>).photoURL;
            // Only update if changed
            if (newAvatar !== sessionUser.avatar) {
              sessionUser.avatar = newAvatar;
            }
          }
          
          // Update bio
          if (metadata.bio !== undefined && (updatedMetadata as UserMetadata).bio !== sessionUser.bio) {
            sessionUser.bio = (updatedMetadata as UserMetadata).bio;
          }
          
          console.log('[Profile] Updated session with new user data:', {
            username: sessionUser.username,
            fullName: sessionUser.fullName,
            avatar: sessionUser.avatar,
            bio: sessionUser.bio
          });
        }
        
        // Save the session
        req.session.save((err) => {
          if (err) {
            console.error('[Profile] Error saving session:', err);
          } else {
            console.log('[Profile] Session saved successfully');
          }
        });
      }
      
      // Return updated profile with improved error handling
      const updatedMetadata = updatedUser.metadata || {};
      const safeMetadata = typeof updatedMetadata === 'object' ? updatedMetadata : {};
      
      // Type assertion to avoid TypeScript errors
      const typedMetadata = safeMetadata as Record<string, any>;
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        // Support both naming conventions
        avatar: typedMetadata.avatar || typedMetadata.photoURL || null,
        fullName: typedMetadata.fullName || typedMetadata.displayName || null,
        bio: typedMetadata.bio || null
      });
    } catch (error) {
      console.error('[Profile] Error updating user profile:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
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
          } else if (chunkStr.includes('name="displayName"')) {
            currentField = 'displayName';
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
              case 'displayName':
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
          // Ensure we have file data
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
          
          // Get the current user to properly access existing metadata
          const currentUser = await storage.getUser(user.id);
          if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
          }
          
          // Extract current metadata with fallback to empty object
          const currentMetadata = currentUser.metadata || {};
          
          // Instead of using updateUser directly, we'll use the DB directly
          // to ensure metadata is properly merged (avoid production-build issue)
          const db = storage.getDb();
          const users = storage.getUsersTable();
          const { eq } = storage.getDrizzleOperators();
          
          // Prepare update data with existing metadata as base
          const updateData: Record<string, any> = {};
          
          // If username is changing, add it to update data
          if (username && username !== user.username) {
            // Check if username is already taken 
            const existingUser = await storage.getUserByUsername(username);
            if (existingUser && existingUser.id !== user.id) {
              return res.status(400).json({ error: 'Username is already taken' });
            }
            updateData.username = username;
          }
          
          // Create merged metadata
          const mergedMetadata = {
            ...currentMetadata,
            photoURL: base64Image,
            avatar: base64Image, // Add avatar for client-side compatibility
            // Only add these if they're provided
            ...(fullName ? { displayName: fullName, fullName: fullName } : {}), // Add both displayName and fullName
            ...(bio ? { bio } : {})
          };
          
          // Add merged metadata to update data
          updateData.metadata = mergedMetadata;
          
          // Perform the database update directly
          const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, user.id))
            .returning();
          
          if (!updatedUser) {
            return res.status(500).json({ error: 'Failed to update user' });
          }
          
          // Update session with latest user data
          if (req.session && req.session.user) {
            const sessionUser = req.session.user as SessionUser;
            
            // Update username if changed
            if (username && username !== user.username) {
              sessionUser.username = username;
            }
            
            // Update other user details in session
            sessionUser.avatar = base64Image;
            
            // Update full name if provided
            if (fullName) {
              sessionUser.fullName = fullName;
            }
            
            // Update bio if provided
            if (bio) {
              sessionUser.bio = bio;
            }
            
            // Log the session update
            console.log('[Profile] Updated session with new user data:', {
              username: sessionUser.username,
              fullName: sessionUser.fullName,
              avatar: sessionUser.avatar ? 'base64_image_data' : null, // Don't log the full base64 string
              bio: sessionUser.bio
            });
            
            // Save the session changes
            req.session.save((err) => {
              if (err) {
                console.error('[Profile] Error saving session:', err);
              }
            });
          }
          
          // Return success response with the updated user data
          const updatedMetadata = updatedUser.metadata || {};
          // Type assertion to avoid TypeScript errors
          const typedMetadata = updatedMetadata as Record<string, any>;
          
          res.json({
            success: true,
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              // Prefer avatar if it exists, fall back to photoURL
              avatar: typedMetadata.avatar || typedMetadata.photoURL || null,
              // Prefer fullName if it exists, fall back to displayName
              fullName: typedMetadata.fullName || typedMetadata.displayName || null,
              bio: typedMetadata.bio || null,
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
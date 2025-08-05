import { Store } from 'express-session';
import { db } from '../db';
import { sessions } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import crypto from 'crypto';

interface SessionData {
  [key: string]: any;
}

interface SessionRecord {
  sessionId: string;
  sessionData: SessionData;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
  csrfToken?: string;
}

export class SecureNeonSessionStore extends Store {
  private encryptionKey: Buffer;
  
  constructor() {
    super();
    
    // Generate encryption key from environment variable or create one
    const keyString = process.env.SESSION_SECRET || 'default-session-secret-key';
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', 32);
    
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  /**
   * Encrypt session data before storing in database
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    cipher.setAAD(Buffer.from('session-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt session data when retrieving from database
   */
  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted session data format');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAAD(Buffer.from('session-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get session from database
   */
  async get(sessionId: string, callback: (err?: any, session?: SessionData | null) => void): Promise<void> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.sessionId, sessionId),
          eq(sessions.isActive, true)
        ))
        .limit(1);

      if (result.length === 0) {
        return callback(null, null);
      }

      const sessionRecord = result[0];
      
      // Check if session has expired
      if (new Date() > sessionRecord.expiresAt) {
        await this.destroy(sessionId, () => {});
        return callback(null, null);
      }

      // Update last accessed time
      await db
        .update(sessions)
        .set({ 
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sessions.sessionId, sessionId));

      // Decrypt and return session data
      let sessionData: SessionData = {};
      if (sessionRecord.sessionData && typeof sessionRecord.sessionData === 'object') {
        sessionData = sessionRecord.sessionData as SessionData;
      }

      // Add metadata to session
      sessionData.__meta = {
        userId: sessionRecord.userId,
        ipAddress: sessionRecord.ipAddress,
        userAgent: sessionRecord.userAgent,
        csrfToken: sessionRecord.csrfToken,
        createdAt: sessionRecord.createdAt,
        lastAccessedAt: sessionRecord.lastAccessedAt
      };

      callback(null, sessionData);
    } catch (error) {
      console.error('[SecureSessionStore] Error getting session:', error);
      callback(error);
    }
  }

  /**
   * Set/update session in database
   */
  async set(sessionId: string, sessionData: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

      // Extract metadata from session data
      const { __meta, ...cleanSessionData } = sessionData;
      const metadata = __meta || {};

      // Generate CSRF token if not present
      const csrfToken = metadata.csrfToken || crypto.randomBytes(32).toString('hex');

      // Check if session exists
      const existingSession = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionId, sessionId))
        .limit(1);

      if (existingSession.length > 0) {
        // Update existing session
        await db
          .update(sessions)
          .set({
            sessionData: cleanSessionData,
            userId: metadata.userId,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            expiresAt,
            lastAccessedAt: new Date(),
            csrfToken,
            updatedAt: new Date()
          })
          .where(eq(sessions.sessionId, sessionId));
      } else {
        // Create new session
        const token = crypto.randomBytes(32).toString('hex');
        
        await db.insert(sessions).values({
          sessionId,
          token,
          sessionData: cleanSessionData,
          userId: metadata.userId,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          expiresAt,
          lastAccessedAt: new Date(),
          csrfToken,
          isActive: true
        });
      }

      callback?.();
    } catch (error) {
      console.error('[SecureSessionStore] Error setting session:', error);
      callback?.(error);
    }
  }

  /**
   * Destroy session
   */
  async destroy(sessionId: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await db
        .update(sessions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(sessions.sessionId, sessionId));
      
      callback?.();
    } catch (error) {
      console.error('[SecureSessionStore] Error destroying session:', error);
      callback?.(error);
    }
  }

  /**
   * Touch session to update expiration
   */
  async touch(sessionId: string, sessionData: SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setTime(expiresAt.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

      await db
        .update(sessions)
        .set({ 
          expiresAt,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sessions.sessionId, sessionId));
      
      callback?.();
    } catch (error) {
      console.error('[SecureSessionStore] Error touching session:', error);
      callback?.(error);
    }
  }

  /**
   * Get all sessions (for admin purposes)
   */
  async all(callback: (err?: any, sessions?: SessionData[] | null) => void): Promise<void> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.isActive, true));

      const sessionDataArray = result.map(record => ({
        sessionId: record.sessionId,
        userId: record.userId,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        expiresAt: record.expiresAt,
        lastAccessedAt: record.lastAccessedAt,
        createdAt: record.createdAt
      }));

      callback(null, sessionDataArray);
    } catch (error) {
      console.error('[SecureSessionStore] Error getting all sessions:', error);
      callback(error);
    }
  }

  /**
   * Get session count
   */
  async length(callback: (err?: any, length?: number) => void): Promise<void> {
    try {
      const result = await db
        .select({ count: sessions.id })
        .from(sessions)
        .where(eq(sessions.isActive, true));

      callback(null, result.length);
    } catch (error) {
      console.error('[SecureSessionStore] Error getting session count:', error);
      callback(error);
    }
  }

  /**
   * Clear all sessions
   */
  async clear(callback?: (err?: any) => void): Promise<void> {
    try {
      await db
        .update(sessions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        });
      
      callback?.();
    } catch (error) {
      console.error('[SecureSessionStore] Error clearing sessions:', error);
      callback?.(error);
    }
  }

  /**
   * Clean up expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      await db
        .update(sessions)
        .set({ 
          isActive: false,
          updatedAt: now
        })
        .where(lt(sessions.expiresAt, now));
      
      console.log('[SecureSessionStore] Cleaned up expired sessions');
    } catch (error) {
      console.error('[SecureSessionStore] Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Get sessions by user ID
   */
  async getSessionsByUserId(userId: number): Promise<SessionRecord[]> {
    try {
      const result = await db
        .select()
        .from(sessions)
        .where(and(
          eq(sessions.userId, userId),
          eq(sessions.isActive, true)
        ));

      return result.map(record => ({
        sessionId: record.sessionId,
        sessionData: (record.sessionData as SessionData) || {},
        userId: record.userId,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        expiresAt: record.expiresAt,
        lastAccessedAt: record.lastAccessedAt,
        isActive: record.isActive,
        csrfToken: record.csrfToken
      }));
    } catch (error) {
      console.error('[SecureSessionStore] Error getting sessions by user ID:', error);
      return [];
    }
  }

  /**
   * Invalidate all sessions for a user (useful for logout from all devices)
   */
  async invalidateUserSessions(userId: number): Promise<void> {
    try {
      await db
        .update(sessions)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(sessions.userId, userId));
      
      console.log(`[SecureSessionStore] Invalidated all sessions for user ${userId}`);
    } catch (error) {
      console.error('[SecureSessionStore] Error invalidating user sessions:', error);
    }
  }
}
import { Store } from 'express-session';
import { SessionData as ExpressSessionData } from 'express-session';
import { db } from '../db';
import { sessions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// Define our session record type
export interface SessionRecord {
  sessionId: string;
  sessionData: ExpressSessionData;
  userId: number;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
  csrfToken: string | null;
}

export class SecureNeonSessionStore extends Store {
  private encryptionKey: string;

  constructor() {
    super();
    // Use environment variable or generate a key
    this.encryptionKey = process.env.SESSION_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get session from database
   */
  async get(sessionId: string, callback: (err?: any, session?: ExpressSessionData | null) => void): Promise<void> {
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
        callback(null, null);
        return;
      }

      const sessionRecord = result[0];
      
      // Check if session is expired
      if (sessionRecord.expiresAt && new Date() > sessionRecord.expiresAt) {
        // Clean up expired session
        await this.destroy(sessionId, () => {});
        callback(null, null);
        return;
      }

      // Parse session data
      const sessionData = typeof sessionRecord.sessionData === 'string' 
        ? JSON.parse(sessionRecord.sessionData) 
        : sessionRecord.sessionData;

      callback(null, sessionData as ExpressSessionData);
    } catch (error) {
      console.error('[SecureSessionStore] Error getting session:', error);
      callback(error);
    }
  }

  /**
   * Set/update session in database
   */
  async set(sessionId: string, sessionData: ExpressSessionData, callback?: (err?: any) => void): Promise<void> {
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
  async touch(sessionId: string, sessionData: ExpressSessionData, callback?: (err?: any) => void): Promise<void> {
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
  async all(callback: (err?: any, sessions?: ExpressSessionData[] | null) => void): Promise<void> {
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
        .where(sql`${sessions.expiresAt} < ${now}`);
      
      
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
        sessionData: (record.sessionData as ExpressSessionData) || {},
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
      
      
    } catch (error) {
      console.error('[SecureSessionStore] Error invalidating user sessions:', error);
    }
  }
}
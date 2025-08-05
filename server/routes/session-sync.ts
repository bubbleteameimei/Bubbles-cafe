import { Router } from 'express';
import { db } from '../db';
import { sessions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Sync session data between client and server
 */
router.post('/sync', async (req, res) => {
  try {
    if (!req.sessionID) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { keys, data } = req.body;

    // Get current session from database
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, req.sessionID))
      .limit(1);

    if (sessionRecord.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentSession = sessionRecord[0];
    let sessionData = (currentSession.sessionData as any) || {};

    // If client is sending data to sync to server
    if (data && typeof data === 'object') {
      // Merge client data with server data
      sessionData = { ...sessionData, ...data };

      // Update session in database
      await db
        .update(sessions)
        .set({
          sessionData,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sessions.sessionId, req.sessionID));

      return res.json({ success: true, message: 'Session data synced to server' });
    }

    // If client is requesting specific keys or all data
    let responseData = sessionData;
    if (keys && Array.isArray(keys)) {
      responseData = {};
      keys.forEach(key => {
        if (sessionData[key] !== undefined) {
          responseData[key] = sessionData[key];
        }
      });
    }

    return res.json({
      success: true,
      data: responseData,
      metadata: {
        sessionId: currentSession.sessionId,
        userId: currentSession.userId,
        lastAccessed: currentSession.lastAccessedAt,
        expiresAt: currentSession.expiresAt
      }
    });

  } catch (error) {
    console.error('[SessionSync] Error syncing session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Store specific data in server-side session
 */
router.post('/store', async (req, res) => {
  try {
    if (!req.sessionID) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { key, value, options = {} } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    // Get current session from database
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, req.sessionID))
      .limit(1);

    if (sessionRecord.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentSession = sessionRecord[0];
    let sessionData = (currentSession.sessionData as any) || {};

    // Store the data with optional metadata
    const storageItem = {
      value,
      timestamp: Date.now(),
      ...options
    };

    sessionData[key] = storageItem;

    // Update session in database
    await db
      .update(sessions)
      .set({
        sessionData,
        lastAccessedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sessions.sessionId, req.sessionID));

    return res.json({ success: true, message: `Data stored for key: ${key}` });

  } catch (error) {
    console.error('[SessionSync] Error storing session data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Retrieve specific data from server-side session
 */
router.get('/retrieve/:key', async (req, res) => {
  try {
    if (!req.sessionID) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { key } = req.params;

    // Get current session from database
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, req.sessionID))
      .limit(1);

    if (sessionRecord.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentSession = sessionRecord[0];
    const sessionData = (currentSession.sessionData as any) || {};

    if (sessionData[key]) {
      const item = sessionData[key];
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        // Remove expired item
        delete sessionData[key];
        await db
          .update(sessions)
          .set({
            sessionData,
            updatedAt: new Date()
          })
          .where(eq(sessions.sessionId, req.sessionID));

        return res.status(404).json({ error: 'Data expired' });
      }

      return res.json({ success: true, data: item.value, metadata: item });
    } else {
      return res.status(404).json({ error: 'Key not found' });
    }

  } catch (error) {
    console.error('[SessionSync] Error retrieving session data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Remove specific data from server-side session
 */
router.delete('/remove/:key', async (req, res) => {
  try {
    if (!req.sessionID) {
      return res.status(401).json({ error: 'No active session' });
    }

    const { key } = req.params;

    // Get current session from database
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, req.sessionID))
      .limit(1);

    if (sessionRecord.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentSession = sessionRecord[0];
    let sessionData = (currentSession.sessionData as any) || {};

    if (sessionData[key]) {
      delete sessionData[key];

      // Update session in database
      await db
        .update(sessions)
        .set({
          sessionData,
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sessions.sessionId, req.sessionID));

      return res.json({ success: true, message: `Data removed for key: ${key}` });
    } else {
      return res.status(404).json({ error: 'Key not found' });
    }

  } catch (error) {
    console.error('[SessionSync] Error removing session data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get session health and storage info
 */
router.get('/health', async (req, res) => {
  try {
    if (!req.sessionID) {
      return res.status(401).json({ error: 'No active session' });
    }

    // Get current session from database
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, req.sessionID))
      .limit(1);

    if (sessionRecord.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const currentSession = sessionRecord[0];
    const sessionData = (currentSession.sessionData as any) || {};

    // Calculate storage usage
    const dataSize = JSON.stringify(sessionData).length;
    const keyCount = Object.keys(sessionData).length;

    // Check for expired items
    const now = Date.now();
    let expiredCount = 0;
    Object.values(sessionData).forEach((item: any) => {
      if (item.expiresAt && now > item.expiresAt) {
        expiredCount++;
      }
    });

    return res.json({
      success: true,
      health: {
        sessionId: currentSession.sessionId,
        userId: currentSession.userId,
        isActive: currentSession.isActive,
        createdAt: currentSession.createdAt,
        lastAccessedAt: currentSession.lastAccessedAt,
        expiresAt: currentSession.expiresAt,
        storage: {
          keyCount,
          dataSize,
          expiredCount
        },
        security: {
          ipAddress: currentSession.ipAddress,
          userAgent: currentSession.userAgent,
          csrfToken: !!currentSession.csrfToken
        }
      }
    });

  } catch (error) {
    console.error('[SessionSync] Error getting session health:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
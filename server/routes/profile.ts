/**
 * GET/PATCH /api/auth/profile — the signed-in user's own profile.
 * Mounted at /api/auth in server/index.ts.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '@shared/schema';
import { verifyAuthToken } from '../auth-google';

const profilePatchSchema = z.object({
  username: z.string().trim().min(2, 'Username must be at least 2 characters').max(50).optional(),
  metadata: z
    .object({
      displayName: z.string().trim().max(100).optional(),
      fullName: z.string().trim().max(100).optional(),
      bio: z.string().trim().max(1000).optional(),
    })
    .optional(),
});

export function toProfile(user: any) {
  const meta = (user.metadata ?? {}) as Record<string, any>;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: meta.displayName || meta.fullName || null,
    bio: meta.bio || null,
    avatar: meta.photoURL || meta.avatar || null,
    isAdmin: !!user.isAdmin,
    createdAt: user.createdAt,
  };
}

export function registerProfileRoutes() {
  const router = Router();

  router.get('/profile', verifyAuthToken as any, async (req: Request, res: Response) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, (req as any).user.userId)).limit(1);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(toProfile(user));
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  const updateProfile = async (req: Request, res: Response) => {
    // Accept both { username, metadata: { displayName, bio } } and the flat
    // { username, fullName, bio } shape sent by the settings page.
    const raw = req.body ?? {};
    const body = raw.metadata
      ? raw
      : { username: raw.username, metadata: { displayName: raw.fullName, bio: raw.bio } };
    const parsed = profilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid profile data' });
    }

    try {
      const userId = (req as any).user.userId;
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Merge only the editable keys so provider data (photoURL, socialId, ...) survives.
      const incoming = parsed.data.metadata ?? {};
      const name = incoming.displayName ?? incoming.fullName;
      const metadata = {
        ...((user.metadata ?? {}) as Record<string, unknown>),
        ...(name !== undefined ? { displayName: name, fullName: name } : {}),
        ...(incoming.bio !== undefined ? { bio: incoming.bio } : {}),
      };

      const [updated] = await db
        .update(users)
        .set({ username: parsed.data.username ?? user.username, metadata })
        .where(eq(users.id, userId))
        .returning();
      return res.json(toProfile(updated));
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  };
  router.patch('/profile', verifyAuthToken as any, updateProfile);
  router.post('/update-profile', verifyAuthToken as any, updateProfile);

  return router;
}

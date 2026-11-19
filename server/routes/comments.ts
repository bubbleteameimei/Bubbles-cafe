/**
 * Story comments. Mounted at /api in server/index.ts.
 *
 *   GET    /api/posts/:postId/comments     list (array), approved + the caller's own
 *   POST   /api/posts/:postId/comments     create; signed-in OR anonymous
 *   GET    /api/comments?postId=           legacy list ({ comments })
 *   PATCH  /api/comments/:id               edit (owner or admin)
 *   DELETE /api/comments/:id               delete (owner or admin)
 *   POST   /api/comments/:id/vote          { isUpvote }
 *   POST   /api/comments/:id/flag          { reason }
 *   POST   /api/comments/:id/approve       admin
 *   POST   /api/comments/:id/reject        admin
 *
 * Ownership: signed-in users own comments by user id. Anonymous commenters get a
 * signed, HttpOnly `anon_comment_id` cookie; their comments store ownerKey
 * "anon:<id>" so they can edit/delete them later (same scheme the Worker used).
 */
import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { commentVotes, comments, posts, reportedContent } from '@shared/schema';
import { getOptionalUser, requireAdmin, type TokenPayload } from '../auth-google';

const COOKIE_NAME = 'anon_comment_id';
const COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

function cookieSecret(): string {
  return (
    process.env.COMMENT_COOKIE_SECRET ||
    process.env.CSRF_SECRET ||
    process.env.JWT_SECRET ||
    'dev-only-comment-cookie-secret'
  );
}

function sign(id: string): string {
  const mac = crypto.createHmac('sha256', cookieSecret()).update(id).digest('base64url');
  return `${id}.${mac}`;
}

function verify(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot <= 0) return null;
  const id = value.slice(0, dot);
  const expected = sign(id);
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? id : null;
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

function setAnonCookie(res: Response, id: string) {
  const prod = process.env.NODE_ENV === 'production';
  // SameSite=None so Vercel preview domains (cross-site) also work; requires Secure.
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(sign(id))}`,
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE_S}`,
    'HttpOnly',
    prod ? 'SameSite=None' : 'SameSite=Lax',
    prod ? 'Secure' : '',
  ].filter(Boolean);
  res.append('Set-Cookie', attrs.join('; '));
}

interface Caller {
  user: TokenPayload | null;
  /** "<userId>" for signed-in users, "anon:<id>" for anonymous, or null. */
  key: string | null;
  anonId: string | null;
}

async function identify(req: Request): Promise<Caller> {
  const user = await getOptionalUser(req).catch(() => null);
  const anonId = verify(readCookie(req, COOKIE_NAME));
  return { user, anonId, key: user ? String(user.userId) : anonId ? `anon:${anonId}` : null };
}

function ownerKeyOf(row: any): string | null {
  const meta = (row.metadata ?? {}) as Record<string, any>;
  if (meta.ownerKey != null) return String(meta.ownerKey);
  return row.userId != null ? String(row.userId) : null;
}

function isOwner(row: any, caller: Caller): boolean {
  const owner = ownerKeyOf(row);
  return !!caller.key && !!owner && owner === caller.key;
}

/** Shape the reader UI (SimpleCommentSection) expects. */
function present(row: any, caller: Caller) {
  const meta = (row.metadata ?? {}) as Record<string, any>;
  const own = isOwner(row, caller);
  const { ownerKey: _ownerKey, ...publicMeta } = meta; // don't leak other people's owner keys
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    postId: row.postId,
    userId: row.userId ?? null,
    parentId: row.parentId ?? null,
    edited: !!row.edited,
    editedAt: row.editedAt ?? null,
    is_approved: !!row.is_approved,
    approved: !!row.is_approved || own,
    isOwner: own,
    metadata: {
      author: 'Guest',
      isAnonymous: row.userId == null,
      moderated: false,
      originalContent: row.content,
      replyCount: 0,
      upvotes: 0,
      downvotes: 0,
      ...publicMeta,
    },
  };
}

function cleanText(input: string): string {
  // Plain text only (the UI renders it as text). Strip control chars except newlines/tabs.
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

const createSchema = z.object({
  content: z.string().max(5000),
  author: z.string().trim().max(60).optional(),
  parentId: z.coerce.number().int().positive().nullable().optional(),
  needsModeration: z.boolean().optional(),
  moderationStatus: z.string().max(30).optional(),
  selectionText: z.string().max(2000).optional(),
  selectionStart: z.coerce.number().optional(),
  selectionEnd: z.coerce.number().optional(),
  anchorParagraphIndex: z.coerce.number().optional(),
});

const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'You are commenting too quickly. Please wait a few minutes.' },
});
const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

const idOf = (v: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

async function listForPost(postId: number) {
  return db
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt))
    .limit(500);
}

export function registerCommentsRoutes() {
  const router = Router();

  router.get('/posts/:postId/comments', async (req, res) => {
    const postId = idOf(req.params.postId);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    try {
      const caller = await identify(req);
      const rows = await listForPost(postId);
      const visible = rows.filter((r: any) => r.is_approved || isOwner(r, caller) || caller.user?.isAdmin);
      return res.json(visible.map((r: any) => present(r, caller)));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  router.post('/posts/:postId/comments', createLimiter, async (req, res) => {
    const postId = idOf(req.params.postId);
    if (!postId) return res.status(400).json({ error: 'Invalid post id' });
    const parsed = createSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid comment' });
    const body = parsed.data;
    const content = cleanText(body.content);
    if (!content) return res.status(400).json({ error: 'Comment cannot be empty' });

    try {
      const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post) return res.status(404).json({ error: 'Story not found' });

      if (body.parentId) {
        const [parent] = await db
          .select({ id: comments.id, postId: comments.postId })
          .from(comments)
          .where(eq(comments.id, body.parentId))
          .limit(1);
        if (!parent || parent.postId !== postId) return res.status(400).json({ error: 'Invalid parent comment' });
      }

      const caller = await identify(req);
      let anonId = caller.anonId;
      if (!caller.user && !anonId) {
        anonId = crypto.randomUUID();
        setAnonCookie(res, anonId);
      }
      const ownerKey = caller.user ? String(caller.user.userId) : `anon:${anonId}`;

      const status = (body.moderationStatus || '').toLowerCase();
      const hold = body.needsModeration === true || status === 'flagged' || status === 'under_review';
      const author = cleanText(body.author || '') || (caller.user ? caller.user.email.split('@')[0] : 'Guest');

      const metadata: Record<string, unknown> = {
        author,
        isAnonymous: !caller.user,
        moderated: hold,
        originalContent: content,
        replyCount: 0,
        upvotes: 0,
        downvotes: 0,
        ownerKey,
      };
      if (body.selectionText && body.selectionStart != null && body.selectionEnd != null) {
        metadata.selectionAnchor = {
          startOffset: body.selectionStart,
          endOffset: body.selectionEnd,
          paragraphIndex: body.anchorParagraphIndex,
          text: body.selectionText,
        };
      }

      const [row] = await db
        .insert(comments)
        .values({
          postId,
          content,
          userId: caller.user?.userId ?? null,
          parentId: body.parentId ?? null,
          is_approved: !hold,
          metadata,
        })
        .returning();

      if (body.parentId) {
        await db
          .update(comments)
          .set({
            metadata: sql`jsonb_set(coalesce(${comments.metadata}, '{}'::jsonb), '{replyCount}',
              to_jsonb(coalesce((${comments.metadata}->>'replyCount')::int, 0) + 1))`,
          })
          .where(eq(comments.id, body.parentId));
      }

      return res.status(201).json(present(row, { ...caller, key: ownerKey, anonId }));
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  });

  // Legacy list shape used by older components.
  router.get('/comments', async (req, res) => {
    const postId = idOf(String(req.query.postId ?? ''));
    if (!postId) return res.status(400).json({ error: 'postId is required' });
    try {
      const caller = await identify(req);
      const rows = await listForPost(postId);
      return res.json({
        comments: rows.filter((r: any) => r.is_approved || isOwner(r, caller)).map((r: any) => present(r, caller)),
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  async function loadForWrite(req: Request, res: Response) {
    const id = idOf(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Invalid comment id' });
      return null;
    }
    const [row] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!row) {
      res.status(404).json({ error: 'Comment not found' });
      return null;
    }
    const caller = await identify(req);
    if (!isOwner(row, caller) && !caller.user?.isAdmin) {
      res.status(403).json({ error: 'You can only change your own comments' });
      return null;
    }
    return { row, caller };
  }

  router.patch('/comments/:id', actionLimiter, async (req, res) => {
    const content = cleanText(String(req.body?.content ?? ''));
    if (!content || content.length > 5000) return res.status(400).json({ error: 'Invalid comment' });
    try {
      const found = await loadForWrite(req, res);
      if (!found) return undefined;
      const [updated] = await db
        .update(comments)
        .set({ content, edited: true, editedAt: new Date() })
        .where(eq(comments.id, found.row.id))
        .returning();
      return res.json(present(updated, found.caller));
    } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  router.delete('/comments/:id', actionLimiter, async (req, res) => {
    try {
      const found = await loadForWrite(req, res);
      if (!found) return undefined;
      await db.delete(comments).where(eq(comments.id, found.row.id));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  router.post('/comments/:id/vote', actionLimiter, async (req, res) => {
    const id = idOf(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid comment id' });
    const isUpvote = req.body?.isUpvote !== false;
    try {
      const caller = await identify(req);
      let voterKey = caller.key;
      if (!voterKey) {
        const anonId = crypto.randomUUID();
        setAnonCookie(res, anonId);
        voterKey = `anon:${anonId}`;
      }

      const [row] = await db.select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Comment not found' });

      // One vote per voter: voting the same way again removes it, the other way switches it.
      const [existing] = await db
        .select()
        .from(commentVotes)
        .where(and(eq(commentVotes.commentId, id), eq(commentVotes.userId, voterKey)))
        .limit(1);
      if (existing && existing.isUpvote === isUpvote) {
        await db.delete(commentVotes).where(eq(commentVotes.id, existing.id));
      } else if (existing) {
        await db.update(commentVotes).set({ isUpvote }).where(eq(commentVotes.id, existing.id));
      } else {
        await db.insert(commentVotes).values({ commentId: id, userId: voterKey, isUpvote });
      }

      const [counts] = await db
        .select({
          upvotes: sql<number>`count(*) filter (where ${commentVotes.isUpvote})::int`,
          downvotes: sql<number>`count(*) filter (where not ${commentVotes.isUpvote})::int`,
        })
        .from(commentVotes)
        .where(eq(commentVotes.commentId, id));
      const upvotes = Number(counts?.upvotes ?? 0);
      const downvotes = Number(counts?.downvotes ?? 0);

      await db
        .update(comments)
        .set({
          metadata: sql`coalesce(${comments.metadata}, '{}'::jsonb) || ${JSON.stringify({ upvotes, downvotes })}::jsonb`,
        })
        .where(eq(comments.id, id));

      return res.json({ success: true, upvotes, downvotes, userVote: existing?.isUpvote === isUpvote ? null : isUpvote });
    } catch (error) {
      console.error('Error voting on comment:', error);
      return res.status(500).json({ error: 'Failed to record vote' });
    }
  });

  router.post('/comments/:id/flag', actionLimiter, async (req, res) => {
    const id = idOf(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid comment id' });
    const reason = cleanText(String(req.body?.reason ?? 'inappropriate content')).slice(0, 500) || 'inappropriate content';
    try {
      const caller = await identify(req);
      const [row] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Comment not found' });

      const meta = (row.metadata ?? {}) as Record<string, any>;
      const flags = Array.isArray(meta.flags) ? meta.flags : [];
      const flaggerKey = caller.key ?? `ip:${crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 16)}`;
      if (!flags.some((f: any) => f?.by === flaggerKey)) {
        flags.push({ by: flaggerKey, reason, at: new Date().toISOString() });
      }
      await db
        .update(comments)
        .set({ metadata: { ...meta, flags, flagCount: flags.length } })
        .where(eq(comments.id, id));

      // Signed-in reporters also land in the moderation queue.
      if (caller.user) {
        await db.insert(reportedContent).values({
          contentType: 'comment',
          contentId: id,
          reporterId: caller.user.userId,
          reason,
        });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error('Error flagging comment:', error);
      return res.status(500).json({ error: 'Failed to report comment' });
    }
  });

  router.post('/comments/:id/:decision(approve|reject)', requireAdmin as any, async (req, res) => {
    const id = idOf(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid comment id' });
    try {
      const approve = req.params.decision === 'approve';
      const [row] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Comment not found' });
      const [updated] = await db
        .update(comments)
        .set({
          is_approved: approve,
          metadata: { ...((row.metadata ?? {}) as object), moderated: !approve, moderationDecision: req.params.decision },
        })
        .where(eq(comments.id, id))
        .returning();
      return res.json({ success: true, comment: updated });
    } catch (error) {
      console.error('Error moderating comment:', error);
      return res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  return router;
}

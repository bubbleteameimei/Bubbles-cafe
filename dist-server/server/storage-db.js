import { db } from "./db";
import { users, posts, comments, sessions, resetTokens, bookmarks, analytics, authorStats, userFeedback, contactMessages, newsletterSubscriptions, readingProgress, secretProgress } from '@shared/schema';
import { eq, desc, and, or, sql, like } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
export class DatabaseStorage {
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async createUser(insertUser) {
        const hashedPassword = await bcrypt.hash(insertUser.password_hash, 10);
        const [user] = await db
            .insert(users)
            .values({
            username: insertUser.username,
            email: insertUser.email,
            password_hash: hashedPassword,
            isAdmin: insertUser.isAdmin || false,
            metadata: insertUser.metadata || {}
        })
            .returning();
        return user;
    }
    async updateUser(id, updates) {
        const [user] = await db
            .update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();
        return user || undefined;
    }
    async updateUserPassword(id, newPasswordHash) {
        await db
            .update(users)
            .set({ password_hash: newPasswordHash })
            .where(eq(users.id, id));
    }
    async getPosts(filters) {
        const limit = filters?.limit || 10;
        const offset = filters?.offset || 0;
        const baseQuery = db.select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            excerpt: posts.excerpt,
            slug: posts.slug,
            authorId: posts.authorId,
            isSecret: posts.isSecret,
            isAdminPost: posts.isAdminPost,
            matureContent: posts.matureContent,
            themeCategory: posts.themeCategory,
            readingTimeMinutes: posts.readingTimeMinutes,
            likesCount: posts.likesCount,
            dislikesCount: posts.dislikesCount,
            metadata: posts.metadata,
            createdAt: posts.createdAt
        }).from(posts);
        const conditions = [];
        if (filters?.authorId) {
            conditions.push(eq(posts.authorId, filters.authorId));
        }
        if (filters?.isSecret !== undefined) {
            conditions.push(eq(posts.isSecret, filters.isSecret));
        }
        if (filters?.isAdminPost !== undefined) {
            conditions.push(eq(posts.isAdminPost, filters.isAdminPost));
        }
        if (filters?.themeCategory) {
            conditions.push(eq(posts.themeCategory, filters.themeCategory));
        }
        if (filters?.search) {
            conditions.push(or(like(posts.title, `%${filters.search}%`), like(posts.content, `%${filters.search}%`)));
        }
        const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
        const results = await query
            .orderBy(desc(posts.createdAt))
            .limit(limit + 1)
            .offset(offset);
        const hasMore = results.length > limit;
        const sliced = hasMore ? results.slice(0, -1) : results;
        const posts_result = sliced.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            excerpt: p.excerpt,
            slug: p.slug,
            authorId: p.authorId,
            isSecret: p.isSecret,
            isAdminPost: p.isAdminPost,
            matureContent: p.matureContent,
            themeCategory: p.themeCategory,
            readingTimeMinutes: p.readingTimeMinutes,
            likesCount: p.likesCount,
            dislikesCount: p.dislikesCount,
            metadata: p.metadata,
            createdAt: p.createdAt
        }));
        return { posts: posts_result, hasMore };
    }
    async getPost(id) {
        const [post] = await db.select().from(posts).where(eq(posts.id, id));
        return post || undefined;
    }
    async getPostBySlug(slug) {
        const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
        return post || undefined;
    }
    async createPost(insertPost) {
        const [post] = await db
            .insert(posts)
            .values(insertPost)
            .returning();
        return post;
    }
    async updatePost(id, updates) {
        const [post] = await db
            .update(posts)
            .set(updates)
            .where(eq(posts.id, id))
            .returning();
        return post || undefined;
    }
    async deletePost(id) {
        const result = await db.delete(posts).where(eq(posts.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
    }
    async getComments(postId) {
        return await db
            .select()
            .from(comments)
            .where(eq(comments.postId, postId))
            .orderBy(desc(comments.createdAt));
    }
    async getComment(id) {
        const [comment] = await db.select().from(comments).where(eq(comments.id, id));
        return comment || undefined;
    }
    async createComment(insertComment) {
        const [comment] = await db
            .insert(comments)
            .values({
            ...insertComment,
            is_approved: insertComment.is_approved !== undefined ? insertComment.is_approved : false
        })
            .returning();
        return comment;
    }
    async updateComment(id, updates) {
        const [comment] = await db
            .update(comments)
            .set(updates)
            .where(eq(comments.id, id))
            .returning();
        return comment || undefined;
    }
    async deleteComment(id) {
        const result = await db.delete(comments).where(eq(comments.id, id));
        return result.rowCount ? result.rowCount > 0 : false;
    }
    async createSession(insertSession) {
        const [session] = await db
            .insert(sessions)
            .values(insertSession)
            .returning();
        return session;
    }
    async getSession(token) {
        const [session] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token));
        return session || undefined;
    }
    async deleteSession(token) {
        const result = await db.delete(sessions).where(eq(sessions.token, token));
        return result.rowCount ? result.rowCount > 0 : false;
    }
    async cleanupExpiredSessions() {
        await db.delete(sessions).where(sql `expires_at < NOW()`);
    }
    async createResetToken(insertToken) {
        const [token] = await db
            .insert(resetTokens)
            .values(insertToken)
            .returning();
        return token;
    }
    async getResetToken(token) {
        const [resetToken] = await db
            .select()
            .from(resetTokens)
            .where(and(eq(resetTokens.token, token), eq(resetTokens.used, false), sql `expires_at > NOW()`));
        return resetToken || undefined;
    }
    async useResetToken(token) {
        const result = await db
            .update(resetTokens)
            .set({ used: true })
            .where(eq(resetTokens.token, token));
        return result.rowCount ? result.rowCount > 0 : false;
    }
    async createBookmark(insertBookmark) {
        const [bookmark] = await db
            .insert(bookmarks)
            .values(insertBookmark)
            .returning();
        return bookmark;
    }
    async getUserBookmarks(userId) {
        return await db
            .select()
            .from(bookmarks)
            .where(eq(bookmarks.userId, userId))
            .orderBy(desc(bookmarks.createdAt));
    }
    async deleteBookmark(userId, postId) {
        await db
            .delete(bookmarks)
            .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
    }
    async createContactMessage(insertMessage) {
        const [message] = await db
            .insert(contactMessages)
            .values(insertMessage)
            .returning();
        return message;
    }
    async getContactMessages() {
        return await db
            .select()
            .from(contactMessages)
            .orderBy(desc(contactMessages.createdAt));
    }
    async subscribeNewsletter(insertSubscription) {
        const [subscription] = await db
            .insert(newsletterSubscriptions)
            .values(insertSubscription)
            .returning();
        return subscription;
    }
    async unsubscribeNewsletter(email) {
        const result = await db
            .update(newsletterSubscriptions)
            .set({ status: 'unsubscribed' })
            .where(eq(newsletterSubscriptions.email, email));
        return result.rowCount ? result.rowCount > 0 : false;
    }
    async updateReadingProgress(insertProgress) {
        // Use upsert (INSERT ... ON CONFLICT)
        const [progress] = await db
            .insert(readingProgress)
            .values(insertProgress)
            .onConflictDoUpdate({
            target: [readingProgress.userId, readingProgress.postId],
            set: {
                progress: insertProgress.progress,
                lastReadAt: sql `NOW()`
            }
        })
            .returning();
        return progress;
    }
    async getReadingProgress(userId, postId) {
        const [progress] = await db
            .select()
            .from(readingProgress)
            .where(and(eq(readingProgress.userId, userId), eq(readingProgress.postId, postId)));
        return progress || undefined;
    }
    async recordSecretDiscovery(insertDiscovery) {
        const [discovery] = await db
            .insert(secretProgress)
            .values(insertDiscovery)
            .returning();
        return discovery;
    }
    async getSecretProgress(userId) {
        return await db
            .select()
            .from(secretProgress)
            .where(eq(secretProgress.userId, userId))
            .orderBy(desc(secretProgress.discoveryDate));
    }
    async getAuthorStats(authorId) {
        const [stats] = await db
            .select()
            .from(authorStats)
            .where(eq(authorStats.authorId, authorId));
        return stats || undefined;
    }
    async updateAuthorStats(authorId, updates) {
        await db
            .update(authorStats)
            .set(updates)
            .where(eq(authorStats.authorId, authorId));
    }
    async recordAnalytics(postId, data) {
        await db
            .insert(analytics)
            .values({
            postId,
            pageViews: data.pageViews || 0,
            uniqueVisitors: data.uniqueVisitors || 0,
            averageReadTime: data.averageReadTime || 0,
            bounceRate: data.bounceRate || 0,
            deviceStats: data.deviceStats || {}
        })
            .onConflictDoUpdate({
            target: [analytics.postId],
            set: {
                pageViews: sql `${analytics.pageViews} + ${data.pageViews || 0}`,
                uniqueVisitors: sql `${analytics.uniqueVisitors} + ${data.uniqueVisitors || 0}`,
                averageReadTime: data.averageReadTime || analytics.averageReadTime,
                bounceRate: data.bounceRate || analytics.bounceRate,
                deviceStats: data.deviceStats || analytics.deviceStats,
                updatedAt: sql `NOW()`
            }
        });
    }
    async getPostAnalytics(postId) {
        const [analytics_result] = await db
            .select()
            .from(analytics)
            .where(eq(analytics.postId, postId));
        return analytics_result || undefined;
    }
    async createUserFeedback(insertFeedback) {
        const [feedback] = await db
            .insert(userFeedback)
            .values(insertFeedback)
            .returning();
        return feedback;
    }
    async getUserFeedback() {
        return await db
            .select()
            .from(userFeedback)
            .orderBy(desc(userFeedback.createdAt));
    }
}
export const storage = new DatabaseStorage();

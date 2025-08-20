import { createSecureLogger } from '../utils/secure-logger';
import { createError } from '../utils/error-handler';
import { handleDatabaseError } from './post-service';
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
const userLogger = createSecureLogger('UserService');
export class UserService {
    // Get user by ID
    async getUser(id) {
        try {
            const [user] = await db.select({
                id: users.id,
                username: users.username,
                email: users.email,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            }).from(users).where(eq(users.id, id)).limit(1);
            return user || null;
        }
        catch (error) {
            userLogger.error('Error fetching user by ID', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
    // Get user by email
    async getUserByEmail(email) {
        try {
            const [user] = await db.select({
                id: users.id,
                username: users.username,
                email: users.email,
                password_hash: users.password_hash,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            }).from(users).where(eq(sql `LOWER(${users.email})`, email.toLowerCase())).limit(1);
            return user || null;
        }
        catch (error) {
            userLogger.error('Error fetching user by email', { error });
            throw handleDatabaseError(error);
        }
    }
    // Get user with password hash (for authentication)
    async getUserWithPassword(id) {
        try {
            const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
            return user || null;
        }
        catch (error) {
            userLogger.error('Error fetching user with password', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
    // Create new user
    async createUser(userData) {
        try {
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                throw createError.conflict('User with this email already exists');
            }
            const [newUser] = await db.insert(users).values({
                username: userData.username,
                email: userData.email.toLowerCase(),
                password_hash: userData.password_hash,
                isAdmin: userData.isAdmin ?? false,
                metadata: userData.metadata || {}
            }).returning({
                id: users.id,
                username: users.username,
                email: users.email,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            });
            userLogger.info('User created successfully', { userId: newUser.id });
            return newUser;
        }
        catch (error) {
            userLogger.error('Error creating user', { email: userData.email, error });
            throw handleDatabaseError(error);
        }
    }
    // Update user
    async updateUser(id, userData) {
        try {
            const existingUser = await this.getUser(id);
            if (!existingUser) {
                throw createError.notFound('User not found');
            }
            const updateData = { ...userData };
            if (updateData.email) {
                updateData.email = updateData.email.toLowerCase();
            }
            const [updatedUser] = await db.update(users)
                .set(updateData)
                .where(eq(users.id, id))
                .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            });
            userLogger.info('User updated successfully', { userId: id });
            return updatedUser;
        }
        catch (error) {
            userLogger.error('Error updating user', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
    // Update user password
    async updateUserPassword(id, hashedPassword) {
        try {
            await db.update(users)
                .set({ password_hash: hashedPassword })
                .where(eq(users.id, id));
            userLogger.info('User password updated successfully', { userId: id });
        }
        catch (error) {
            userLogger.error('Error updating user password', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
    // Delete user (soft delete by updating metadata)
    async deleteUser(id) {
        try {
            const existingUser = await this.getUser(id);
            if (!existingUser) {
                throw createError.notFound('User not found');
            }
            await db.update(users)
                .set({
                metadata: {
                    ...(existingUser.metadata || {}),
                    deleted: true,
                    deletedAt: new Date().toISOString()
                }
            })
                .where(eq(users.id, id));
            userLogger.info('User soft deleted successfully', { userId: id });
        }
        catch (error) {
            userLogger.error('Error deleting user', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
    // Get user count
    async getUserCount() {
        try {
            const [result] = await db.select({ count: sql `count(*)` }).from(users);
            return result.count;
        }
        catch (error) {
            userLogger.error('Error getting user count', { error });
            throw handleDatabaseError(error);
        }
    }
    // Get admin users
    async getAdminUsers() {
        try {
            const adminUsers = await db.select({
                id: users.id,
                username: users.username,
                email: users.email,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            }).from(users).where(eq(users.isAdmin, true));
            return adminUsers;
        }
        catch (error) {
            userLogger.error('Error fetching admin users', { error });
            throw handleDatabaseError(error);
        }
    }
    // Check if user is admin by email
    async isUserAdmin(email) {
        try {
            const [user] = await db.select({ isAdmin: users.isAdmin })
                .from(users)
                .where(and(eq(sql `LOWER(${users.email})`, email.toLowerCase()), eq(users.isAdmin, true)))
                .limit(1);
            return !!user?.isAdmin;
        }
        catch (error) {
            userLogger.error('Error checking admin status', { error });
            return false;
        }
    }
    // Get users with pagination
    async getUsers(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const [usersData, totalResult] = await Promise.all([
                db.select({
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    isAdmin: users.isAdmin,
                    metadata: users.metadata,
                    createdAt: users.createdAt
                })
                    .from(users)
                    .orderBy(users.createdAt)
                    .limit(limit)
                    .offset(offset),
                db.select({ count: sql `count(*)` }).from(users)
            ]);
            return { users: usersData, total: totalResult[0].count };
        }
        catch (error) {
            userLogger.error('Error fetching users', { error });
            throw handleDatabaseError(error);
        }
    }
    // Update user metadata
    async updateUserMetadata(id, metadata) {
        try {
            const existingUser = await this.getUser(id);
            if (!existingUser) {
                throw createError.notFound('User not found');
            }
            const mergedMetadata = { ...(existingUser.metadata || {}), ...metadata };
            const [updatedUser] = await db.update(users)
                .set({ metadata: mergedMetadata })
                .where(eq(users.id, id))
                .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                isAdmin: users.isAdmin,
                metadata: users.metadata,
                createdAt: users.createdAt
            });
            userLogger.info('User metadata updated successfully', { userId: id });
            return updatedUser;
        }
        catch (error) {
            userLogger.error('Error updating user metadata', { userId: id, error });
            throw handleDatabaseError(error);
        }
    }
}
// Export singleton instance
export const userService = new UserService();

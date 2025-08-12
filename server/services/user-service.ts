import { createSecureLogger } from '../utils/secure-logger';
import { createError } from '../utils/error-handler';
import { handleDatabaseError } from './post-service';
import { db } from "../db";
import { users, type User, type InsertUser } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import * as bcrypt from 'bcryptjs';

const userLogger = createSecureLogger('UserService');

export class UserService {
  // Get user by ID
  async getUser(id: number): Promise<User | null> {
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
    } catch (error) {
      userLogger.error('Error fetching user by ID', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password_hash: users.password_hash,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt
      }).from(users).where(eq(sql`LOWER(${users.email})`, email.toLowerCase())).limit(1);

      return user || null;
    } catch (error) {
      userLogger.error('Error fetching user by email', { error });
      throw handleDatabaseError(error);
    }
  }

  // Get user with password hash (for authentication)
  async getUserWithPassword(id: number): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return user || null;
    } catch (error) {
      userLogger.error('Error fetching user with password', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Create new user
  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw createError.conflict('User with this email already exists');
      }

      const [newUser] = await db.insert(users).values({
        ...userData,
        email: userData.email.toLowerCase(),
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
    } catch (error) {
      userLogger.error('Error creating user', { email: userData.email, error });
      throw handleDatabaseError(error);
    }
  }

  // Update user
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
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
    } catch (error) {
      userLogger.error('Error updating user', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Update user password
  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    try {
      await db.update(users)
        .set({ password_hash: hashedPassword })
        .where(eq(users.id, id));

      userLogger.info('User password updated successfully', { userId: id });
    } catch (error) {
      userLogger.error('Error updating user password', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Delete user (soft delete by updating metadata)
  async deleteUser(id: number): Promise<void> {
    try {
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        throw createError.notFound('User not found');
      }

      await db.update(users)
        .set({ 
          metadata: { 
            ...existingUser.metadata, 
            deleted: true, 
            deletedAt: new Date().toISOString() 
          } 
        })
        .where(eq(users.id, id));

      userLogger.info('User soft deleted successfully', { userId: id });
    } catch (error) {
      userLogger.error('Error deleting user', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user count
  async getUserCount(): Promise<number> {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` }).from(users);
      return result.count;
    } catch (error) {
      userLogger.error('Error getting user count', { error });
      throw handleDatabaseError(error);
    }
  }

  // Get admin users
  async getAdminUsers(): Promise<User[]> {
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
    } catch (error) {
      userLogger.error('Error fetching admin users', { error });
      throw handleDatabaseError(error);
    }
  }

  // Check if user is admin by email
  async isUserAdmin(email: string): Promise<boolean> {
    try {
      const [user] = await db.select({ isAdmin: users.isAdmin })
        .from(users)
        .where(and(
          eq(sql`LOWER(${users.email})`, email.toLowerCase()),
          eq(users.isAdmin, true)
        ))
        .limit(1);

      return !!user?.isAdmin;
    } catch (error) {
      userLogger.error('Error checking admin status', { error });
      return false;
    }
  }

  // Get users with pagination
  async getUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number; }> {
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
        }).from(users)
          .limit(limit)
          .offset(offset)
          .orderBy(users.createdAt),
        db.select({ count: sql<number>`count(*)` }).from(users)
      ]);

      return {
        users: usersData as unknown as User[],
        total: totalResult[0].count
      };
    } catch (error) {
      userLogger.error('Error fetching users with pagination', { page, limit, error });
      throw handleDatabaseError(error);
    }
  }

  // Update user metadata
  async updateUserMetadata(id: number, metadata: Record<string, any>): Promise<User> {
    try {
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        throw createError.notFound('User not found');
      }

      const mergedMetadata = { ...existingUser.metadata, ...metadata };

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
    } catch (error) {
      userLogger.error('Error updating user metadata', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
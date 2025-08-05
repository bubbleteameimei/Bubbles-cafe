import { db } from '../db';
import { users, type InsertUser } from "@shared/schema";
import { eq, sql, desc, like, or } from "drizzle-orm";

import { userLogger } from '../utils/debug-logger';
import { handleDatabaseError } from '../utils/error-handler';

// Define proper return types for different query contexts
type UserProfile = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  metadata: unknown;
  createdAt: Date;
  firebaseUid: string | null;
  avatar: string | null;
  fullName: string | null;
  isVerified: boolean;
  password_hash: string | null;
};

type UserPublicProfile = Omit<UserProfile, 'password_hash' | 'email'> & {
  email?: string;
  password_hash?: string;
};

type UserAuthData = {
  id: number;
  username: string;
  email: string;
  password_hash: string | null;
  isAdmin: boolean;
  metadata: unknown;
  createdAt: Date;
  firebaseUid: string | null;
  avatar: string | null;
  fullName: string | null;
  isVerified: boolean;
};

export class UserService {
  // Get user by ID
  async getUserById(id: number, includePrivateInfo: boolean = false): Promise<UserProfile | UserPublicProfile | null> {
    try {
      const selectFields = {
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified,
        ...(includePrivateInfo ? { password_hash: users.password_hash } : {})
      };

      const [user] = await db.select(selectFields)
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) return null;

      if (includePrivateInfo) {
        return user as UserProfile;
      } else {
        return user as UserPublicProfile;
      }
    } catch (error) {
      userLogger.error('Error fetching user by ID', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user by email for authentication
  async getUserByEmail(email: string): Promise<UserAuthData | null> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        password_hash: users.password_hash,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified
      })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user || null;
    } catch (error) {
      userLogger.error('Error fetching user by email', { email, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<UserPublicProfile | null> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified
      })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return user as UserPublicProfile || null;
    } catch (error) {
      userLogger.error('Error fetching user by username', { username, error });
      throw handleDatabaseError(error);
    }
  }

  // Create user
  async createUser(userData: InsertUser & { password?: string }): Promise<UserProfile> {
    try {
      // Handle password hashing if password is provided
      let insertData = { ...userData };
      if (userData.password) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        insertData = {
          ...userData,
          password_hash: hashedPassword
        };
        delete insertData.password;
      }

      const [newUser] = await db.insert(users)
        .values({
          ...insertData,
          metadata: insertData.metadata || {},
          isAdmin: insertData.isAdmin || false,
          isVerified: insertData.isVerified || false
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          isAdmin: users.isAdmin,
          metadata: users.metadata,
          createdAt: users.createdAt,
          firebaseUid: users.firebaseUid,
          avatar: users.avatar,
          fullName: users.fullName,
          isVerified: users.isVerified,
          password_hash: users.password_hash
        });

      userLogger.info('User created successfully', { userId: newUser.id, username: newUser.username });
      return newUser as UserProfile;
    } catch (error) {
      userLogger.error('Error creating user', { userData: { ...userData, password: '[REDACTED]' }, error });
      throw handleDatabaseError(error);
    }
  }

  // Update user
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<UserProfile | null> {
    try {
      // Get existing user to merge metadata properly
      const existingUser = await this.getUserById(id, true);
      if (!existingUser) {
        return null;
      }

      // Merge metadata if provided
      const updatedData = {
        ...userData,
        metadata: userData.metadata ? 
          { ...(existingUser.metadata as Record<string, unknown> || {}), ...userData.metadata } : 
          existingUser.metadata
      };

      const [updatedUser] = await db.update(users)
        .set(updatedData)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          isAdmin: users.isAdmin,
          metadata: users.metadata,
          createdAt: users.createdAt,
          firebaseUid: users.firebaseUid,
          avatar: users.avatar,
          fullName: users.fullName,
          isVerified: users.isVerified,
          password_hash: users.password_hash
        });

      if (!updatedUser) {
        return null;
      }

      userLogger.info('User updated successfully', { userId: id });
      return updatedUser as UserProfile;
    } catch (error) {
      userLogger.error('Error updating user', { userId: id, userData, error });
      throw handleDatabaseError(error);
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<boolean> {
    try {
      const [deletedUser] = await db.delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });

      const success = !!deletedUser;
      if (success) {
        userLogger.info('User deleted successfully', { userId: id });
      }

      return success;
    } catch (error) {
      userLogger.error('Error deleting user', { userId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get admin users
  async getAdminUsers(): Promise<UserProfile[]> {
    try {
      const adminUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified,
        password_hash: users.password_hash
      })
        .from(users)
        .where(eq(users.isAdmin, true))
        .orderBy(desc(users.createdAt));

      return adminUsers as UserProfile[];
    } catch (error) {
      userLogger.error('Error fetching admin users', { error });
      throw handleDatabaseError(error);
    }
  }

  // Get users with pagination
  async getUsers(options: { page?: number; limit?: number } = {}): Promise<{ users: UserProfile[]; total: number }> {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      // Get users
      const usersData = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified,
        password_hash: users.password_hash
      })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(users);

      return {
        users: usersData as UserProfile[],
        total: count
      };
    } catch (error) {
      userLogger.error('Error fetching users', { options, error });
      throw handleDatabaseError(error);
    }
  }

  // Update user metadata
  async updateUserMetadata(id: number, metadata: Record<string, unknown>): Promise<UserProfile | null> {
    try {
      const existingUser = await this.getUserById(id, true);
      if (!existingUser) {
        return null;
      }

      const mergedMetadata = { ...(existingUser.metadata as Record<string, unknown> || {}), ...metadata };

      const [updatedUser] = await db.update(users)
        .set({ metadata: mergedMetadata })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          isAdmin: users.isAdmin,
          metadata: users.metadata,
          createdAt: users.createdAt,
          firebaseUid: users.firebaseUid,
          avatar: users.avatar,
          fullName: users.fullName,
          isVerified: users.isVerified,
          password_hash: users.password_hash
        });

      if (!updatedUser) {
        return null;
      }

      userLogger.info('User metadata updated successfully', { userId: id });
      return updatedUser as UserProfile;
    } catch (error) {
      userLogger.error('Error updating user metadata', { userId: id, metadata, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user count
  async getUserCount(): Promise<number> {
    try {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(users);

      return count;
    } catch (error) {
      userLogger.error('Error fetching user count', { error });
      throw handleDatabaseError(error);
    }
  }

  // Search users
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<{ users: UserPublicProfile[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const searchCondition = or(
        like(users.username, `%${query}%`),
        like(users.fullName, `%${query}%`)
      );

      // Get users
      const usersData = await db.select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified
      })
        .from(users)
        .where(searchCondition)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(searchCondition);

      return {
        users: usersData as UserPublicProfile[],
        total: count
      };
    } catch (error) {
      userLogger.error('Error searching users', { query, error });
      throw handleDatabaseError(error);
    }
  }

  // Get user by Firebase UID
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    try {
      const [user] = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        metadata: users.metadata,
        createdAt: users.createdAt,
        firebaseUid: users.firebaseUid,
        avatar: users.avatar,
        fullName: users.fullName,
        isVerified: users.isVerified,
        password_hash: users.password_hash
      })
        .from(users)
        .where(eq(users.firebaseUid, firebaseUid))
        .limit(1);

      return user as UserProfile || null;
    } catch (error) {
      userLogger.error('Error fetching user by Firebase UID', { firebaseUid, error });
      throw handleDatabaseError(error);
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
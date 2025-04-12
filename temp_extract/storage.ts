import { users, type User, type InsertUser, gameSaves, type GameSave, type InsertGameSave } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game save operations
  getGameSaves(userId: number): Promise<GameSave[]>;
  getGameSaveBySlot(userId: number, slot: number): Promise<GameSave | undefined>;
  saveGame(save: InsertGameSave): Promise<GameSave>;
  deleteGameSave(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameSaves: Map<number, GameSave>;
  private currentUserId: number;
  private currentGameSaveId: number;

  constructor() {
    this.users = new Map();
    this.gameSaves = new Map();
    this.currentUserId = 1;
    this.currentGameSaveId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Game save operations
  async getGameSaves(userId: number): Promise<GameSave[]> {
    return Array.from(this.gameSaves.values()).filter(
      (save) => save.userId === userId
    );
  }

  async getGameSaveBySlot(userId: number, slot: number): Promise<GameSave | undefined> {
    return Array.from(this.gameSaves.values()).find(
      (save) => save.userId === userId && save.slot === slot
    );
  }

  async saveGame(insertSave: InsertGameSave): Promise<GameSave> {
    // Check if there's an existing save in this slot
    const existingSave = await this.getGameSaveBySlot(
      insertSave.userId,
      insertSave.slot
    );

    if (existingSave) {
      // Update existing save
      const updatedSave: GameSave = {
        ...existingSave,
        saveData: insertSave.saveData,
        createdAt: new Date().toISOString(),
      };
      this.gameSaves.set(existingSave.id, updatedSave);
      return updatedSave;
    } else {
      // Create new save
      const id = this.currentGameSaveId++;
      const save: GameSave = {
        ...insertSave,
        id,
        createdAt: new Date().toISOString(),
      };
      this.gameSaves.set(id, save);
      return save;
    }
  }

  async deleteGameSave(id: number): Promise<boolean> {
    return this.gameSaves.delete(id);
  }
}

// Export a storage instance
export const storage = new MemStorage();

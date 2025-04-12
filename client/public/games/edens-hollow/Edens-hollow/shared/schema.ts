import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Game saves schema
export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  saveData: jsonb("save_data").notNull(),
  createdAt: text("created_at").notNull().default("NOW()"),
  slot: integer("slot").notNull().default(1),
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).pick({
  userId: true,
  saveData: true,
  slot: true,
});

// Define types 
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type GameSave = typeof gameSaves.$inferSelect;

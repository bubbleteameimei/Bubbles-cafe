import { pgTable, text, serial, integer, boolean, timestamp, index, unique, json, decimal, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  usernameIdx: index("username_idx").on(table.username)
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;

export type User = typeof users.$inferSelect;
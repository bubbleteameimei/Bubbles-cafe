import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  slug: text("slug").notNull().unique(),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  progress: integer("progress").notNull().default(0)
});

export const secretProgress = pgTable("secret_progress", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  discoveryDate: timestamp("discovery_date").defaultNow().notNull(),
  unlockedBy: text("unlocked_by").notNull()
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  showEmail: boolean("show_email").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Update the schema to handle dates as strings in the API
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).extend({
  createdAt: z.string().optional()
}).omit({ id: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });

// Define the types
export type Post = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  isSecret: boolean;
  slug: string;
  authorId: number;
  createdAt: string; // Changed to string for API responses
};

export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type SecretProgress = typeof secretProgress.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertSecretProgress = z.infer<typeof insertSecretProgressSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;
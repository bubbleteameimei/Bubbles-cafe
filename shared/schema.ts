import { pgTable, text, serial, integer, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password_hash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  usernameIdx: index("username_idx").on(table.username)
}));

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull()
}, (table) => ({
  tokenIdx: index("token_idx").on(table.token),
  userIdIdx: index("session_user_id_idx").on(table.userId)
}));

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  slug: text("slug").notNull().unique(),
  authorId: integer("author_id").notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  dislikesCount: integer("dislikes_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // New fields for WordPress import
  originalSource: text("original_source"),
  originalAuthor: text("original_author"),
  originalPublishDate: timestamp("original_publish_date"),
  // Horror-specific fields
  atmosphericSound: text("atmospheric_sound"), // Path to sound file
  readingTimeMinutes: integer("reading_time_minutes"),
  matureContent: boolean("mature_content").default(false).notNull(),
  triggerWarnings: text("trigger_warnings").array()
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  authorIdIdx: index("post_author_id_idx").on(table.authorId)
}));

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  postUserIdx: unique().on(table.postId, table.userId),
  postIdIdx: index("post_likes_post_id_idx").on(table.postId),
  userIdIdx: index("post_likes_user_id_idx").on(table.userId)
}));

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

// Schema types and insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, likesCount: true, dislikesCount: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true, lastAccessedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });

// Type exports
export type Post = typeof posts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type SecretProgress = typeof secretProgress.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertSecretProgress = z.infer<typeof insertSecretProgressSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  slug: text("slug").notNull().unique()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull()
});

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  progress: integer("progress").notNull().default(0)
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true });
export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });

export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

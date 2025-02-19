import { pgTable, text, serial, integer, boolean, timestamp, index, unique, json, decimal, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  usernameIdx: index("username_idx").on(table.username)
}));

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: text("slug").notNull().unique(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  matureContent: boolean("mature_content").default(false).notNull(),
  themeCategory: text("theme_category"),
  readingTimeMinutes: integer("reading_time_minutes"),
  likesCount: integer("likes_count").default(0),
  dislikesCount: integer("dislikes_count").default(0),
  metadata: json("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  approved: boolean("approved").default(false).notNull(),
  metadata: json("metadata").$type<CommentMetadata>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Reading Progress
export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  progress: decimal("progress").notNull(),
  lastReadAt: timestamp("last_read_at").defaultNow().notNull()
});

// Secret Progress
export const secretProgress = pgTable("secret_progress", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  discoveryDate: timestamp("discovery_date").defaultNow().notNull()
});

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastAccessedAt: timestamp("last_accessed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Post Likes
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isLike: boolean("is_like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Comment Votes
export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comments.id).notNull(),
  userId: text("user_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Comment Replies
export const commentReplies = pgTable("comment_replies", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").default(false).notNull(),
  metadata: json("metadata").$type<CommentMetadata>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});


// Author Stats
export const authorStats = pgTable("author_stats", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  totalPosts: integer("total_posts").default(0).notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  avgFearRating: doublePrecision("avg_fear_rating").default(0).notNull(),
  totalTips: text("total_tips").default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Writing Challenges
export const writingChallenges = pgTable("writing_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Challenge Entries
export const challengeEntries = pgTable("challenge_entries", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => writingChallenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  submissionDate: timestamp("submission_date").defaultNow().notNull()
});

// Content Protection
export const contentProtection = pgTable("content_protection", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  hash: text("hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Reported Content
export const reportedContent = pgTable("reported_content", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  reporterId: integer("reporter_id").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Author Tips
export const authorTips = pgTable("author_tips", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  amount: text("amount").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  events: text("events").array().notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Analytics
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  pageViews: integer("page_views").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  averageReadTime: doublePrecision("average_read_time").default(0).notNull(),
  bounceRate: doublePrecision("bounce_rate").default(0).notNull(),
  deviceStats: json("device_stats").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: json("details").default({}).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Admin Notifications
export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'error'
  isRead: boolean("is_read").default(false).notNull(),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const registrationSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegistrationCredentials = z.infer<typeof registrationSchema>;

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  password_hash: true 
}).extend({
  password: z.string()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;


export const insertPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1, "Slug is required"),
  authorId: z.number(),
  excerpt: z.string().optional(),
  isSecret: z.boolean().optional(),
  matureContent: z.boolean().optional(),
  themeCategory: z.string().optional(),
  readingTimeMinutes: z.number().optional(),
  metadata: z.object({
    isCommunityPost: z.boolean().optional(),
    isApproved: z.boolean().optional(),
    status: z.enum(['pending', 'approved']).optional(),
    triggerWarnings: z.array(z.string()).optional(),
    themeCategory: z.string().optional(),
  }).optional(),
});

export type PostMetadata = {
  isCommunityPost?: boolean;
  isApproved?: boolean;
  status?: 'pending' | 'approved';
  triggerWarnings?: string[];
  themeCategory?: string;
};

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export type InsertSecretProgress = z.infer<typeof insertSecretProgressSchema>;
export type SecretProgress = typeof secretProgress.$inferSelect;

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type PostLike = typeof postLikes.$inferSelect;
export type CommentVote = typeof commentVotes.$inferSelect;

export const insertCommentReplySchema = createInsertSchema(commentReplies).omit({ id: true, createdAt: true });
export type InsertCommentReply = z.infer<typeof insertCommentReplySchema>;
export type CommentReply = typeof commentReplies.$inferSelect;


export type AuthorStats = typeof authorStats.$inferSelect;

export const insertWritingChallengeSchema = createInsertSchema(writingChallenges).omit({ id: true, createdAt: true });
export type InsertWritingChallenge = z.infer<typeof insertWritingChallengeSchema>;
export type WritingChallenge = typeof writingChallenges.$inferSelect;

export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).omit({ id: true, submissionDate: true });
export type InsertChallengeEntry = z.infer<typeof insertChallengeEntrySchema>;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;

export const insertContentProtectionSchema = createInsertSchema(contentProtection).omit({ id: true, createdAt: true });
export type InsertContentProtection = z.infer<typeof insertContentProtectionSchema>;
export type ContentProtection = typeof contentProtection.$inferSelect;

export const insertReportedContentSchema = createInsertSchema(reportedContent).omit({ id: true, createdAt: true });
export type InsertReportedContent = z.infer<typeof insertReportedContentSchema>;
export type ReportedContent = typeof reportedContent.$inferSelect;

export const insertAuthorTipSchema = createInsertSchema(authorTips).omit({ id: true, createdAt: true });
export type InsertAuthorTip = z.infer<typeof insertAuthorTipSchema>;
export type AuthorTip = typeof authorTips.$inferSelect;


export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true });
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;

export type Analytics = typeof analytics.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({ id: true, createdAt: true });
export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
export type AdminNotification = typeof adminNotifications.$inferSelect;

export interface CommentMetadata {
  moderated?: boolean;
  originalContent?: string;
}
import { pgTable, text, serial, integer, boolean, timestamp, index, unique, json, jsonb, decimal, doublePrecision, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with social auth fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  // Profile data stored in metadata
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  usernameIdx: index("username_idx").on(table.username)
}));

// Posts table - removed fear rating system
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: text("slug").notNull().unique(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  isAdminPost: boolean("isAdminPost").default(false),
  matureContent: boolean("mature_content").default(false).notNull(),
  themeCategory: text("theme_category"),
  readingTimeMinutes: integer("reading_time_minutes"),
  likesCount: integer("likesCount").default(0),
  dislikesCount: integer("dislikesCount").default(0),
  metadata: json("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  // Indexes for frequently accessed columns
  authorIdIdx: index("post_author_idx").on(table.authorId),
  createdAtIdx: index("post_created_at_idx").on(table.createdAt),
  themeCategoryIdx: index("post_theme_category_idx").on(table.themeCategory),
  titleIdx: index("post_title_idx").on(table.title)
}));

// Author Stats - removed fear rating
export const authorStats = pgTable("author_stats", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  totalPosts: integer("total_posts").default(0).notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  totalTips: text("total_tips").default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Unified comments table with self-referencing structure
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").references(() => posts.id),
  parentId: integer("parent_id"), // Remove circular reference temporarily
  userId: integer("user_id").references(() => users.id), // Optional for anonymous users
  is_approved: boolean("is_approved").default(false).notNull(),
  edited: boolean("edited").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  metadata: json("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => {
  return {
    // Add the foreign key constraint after table creation
    parentIdFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id]
    }),
    // Add performance indexes for frequently queried fields
    postIdIdx: index("comment_post_id_idx").on(table.postId),
    userIdIdx: index("comment_user_id_idx").on(table.userId),
    parentIdIdx: index("comment_parent_id_idx").on(table.parentId),
    createdAtIdx: index("comment_created_at_idx").on(table.createdAt),
    approvedIdx: index("comment_approved_idx").on(table.is_approved)
  };
});

// Keeping this for backwards compatibility, will be deprecated
export const commentReplies = comments;

// Add comment reactions table
export const commentReactions = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comments.id).notNull(),
  userId: text("user_id").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userReactionUnique: unique().on(table.commentId, table.userId, table.emoji)
}));

// Update comment votes table
export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").references(() => comments.id).notNull(),
  userId: text("user_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userVoteUnique: unique().on(table.commentId, table.userId)
}));

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
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Newsletter subscribers table
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status").default("active").notNull(), // active, unsubscribed, bounced
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

// Password Reset Tokens
export const resetTokens = pgTable("reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Keep post likes table intact
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isLike: boolean("is_like").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
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
}, (table) => ({
  // Add indexes for analytics queries
  postIdIdx: index("analytics_post_id_idx").on(table.postId),
  updatedAtIdx: index("analytics_updated_at_idx").on(table.updatedAt)
}));

// Add performance metrics table definition after the analytics table
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  value: doublePrecision("value").notNull(),
  identifier: text("identifier").notNull(),
  navigationType: text("navigation_type"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  url: text("url").notNull(),
  userAgent: text("user_agent"),
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

// Achievement system tables removed

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  progressType: text("progress_type").notNull(), // 'reading' or 'writing'
  postId: integer("post_id").references(() => posts.id),
  progress: decimal("progress").notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull()
});

export const siteAnalytics = pgTable("site_analytics", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  pageViews: integer("page_views").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  averageReadTime: doublePrecision("average_read_time").default(0).notNull(),
  bounceRate: doublePrecision("bounce_rate").default(0).notNull(),
  deviceStats: json("device_stats").default({}).notNull()
});

// Story Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => posts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"), // Optional user notes about the bookmark
  lastPosition: decimal("last_position").default("0").notNull(), // Reading position
  tags: text("tags").array(), // User-defined tags for organizing bookmarks
}, (table) => ({
  userPostUnique: unique().on(table.userId, table.postId), // A user can bookmark a post only once
  // Add indexes for better performance
  userIdIdx: index("bookmark_user_id_idx").on(table.userId),
  postIdIdx: index("bookmark_post_id_idx").on(table.postId),
  createdAtIdx: index("bookmark_created_at_idx").on(table.createdAt)
}));

// User Feedback
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  type: text("type").default("general").notNull(), // general, bug, feature, etc.
  content: text("content").notNull(),
  // rating field removed
  page: text("page").default("unknown"),
  status: text("status").default("pending").notNull(), // pending, reviewed, resolved, rejected
  userId: integer("user_id").references(() => users.id), // Optional, as feedback can be anonymous
  browser: text("browser").default("unknown"),
  operatingSystem: text("operating_system").default("unknown"),
  screenResolution: text("screen_resolution").default("unknown"),
  userAgent: text("user_agent").default("unknown"),
  category: text("category").default("general"),
  metadata: json("metadata").default({}), // For storing additional info
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User Privacy Settings
export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  profileVisible: boolean("profile_visible").default(true).notNull(),
  shareReadingHistory: boolean("share_reading_history").default(false).notNull(),
  anonymousCommenting: boolean("anonymous_commenting").default(false).notNull(),
  twoFactorAuthEnabled: boolean("two_factor_auth_enabled").default(false).notNull(),
  loginNotifications: boolean("login_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});


// Update login schema to use email instead of username
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Enhanced registration schema with password confirmation
export const registrationSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  password_hash: true
}).extend({
  password: z.string(),
  // Still keep email in the schema for backward compatibility
  email: z.string().email().optional(),
  // Profile data to be stored in metadata
  fullName: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Update PostMetadata type to include WordPress fields
export type PostMetadata = {
  isCommunityPost?: boolean;
  isApproved?: boolean;
  isAdminPost?: boolean; // Added to explicitly mark admin posts
  isHidden?: boolean; // Added to control visibility
  status?: 'pending' | 'approved' | 'publish';
  triggerWarnings?: string[];
  themeCategory?: string;
  themeIcon?: string; // Added explicit support for themeIcon in metadata
  // WordPress specific fields
  wordpressId?: number;
  modified?: string;
  type?: string;
  originalAuthor?: number;
  featuredMedia?: number;
  categories?: number[];
  [key: string]: any; // Allow for any additional properties
};

// Update insertPostSchema to accept WordPress fields and add validation
export const insertPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
  content: z.string().min(1, "Content is required").max(65535, "Content is too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug cannot exceed 255 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  authorId: z.number(),
  excerpt: z.string().max(500, "Excerpt cannot exceed 500 characters").optional(),
  isSecret: z.boolean().optional(),
  isAdminPost: z.boolean().optional(),
  matureContent: z.boolean().optional(),
  themeCategory: z.string().max(50, "Theme category cannot exceed 50 characters").optional(),
  readingTimeMinutes: z.number().int("Reading time must be a whole number").optional(),
  metadata: z.object({
    isCommunityPost: z.boolean().optional(),
    isApproved: z.boolean().optional(),
    isAdminPost: z.boolean().optional(),
    isHidden: z.boolean().optional(),
    status: z.enum(['pending', 'approved', 'publish']).optional(),
    triggerWarnings: z.array(z.string()).optional(),
    themeCategory: z.string().optional(),
    themeIcon: z.string().optional(),
    // WordPress specific fields
    wordpressId: z.number().optional(),
    modified: z.string().optional(),
    type: z.string().optional(),
    originalAuthor: z.number().optional(),
    featuredMedia: z.number().optional(),
    categories: z.array(z.number()).optional(),
  }).optional(),
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, edited: true, editedAt: true }).extend({
  approved: z.boolean().optional()
});
export const insertCommentReactionSchema = createInsertSchema(commentReactions).omit({ id: true, createdAt: true });
export const insertCommentVoteSchema = createInsertSchema(commentVotes).omit({ id: true, createdAt: true });

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type CommentReaction = typeof commentReactions.$inferSelect;
export type InsertCommentReaction = z.infer<typeof insertCommentReactionSchema>;
export type CommentVote = typeof commentVotes.$inferSelect;
export type InsertCommentVote = z.infer<typeof insertCommentVoteSchema>;


export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export type InsertSecretProgress = z.infer<typeof insertSecretProgressSchema>;
export type SecretProgress = typeof secretProgress.$inferSelect;

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true }).extend({
  metadata: z.record(z.any()).optional()
});
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Newsletter subscription schema
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true 
});
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Reset Token Schema
export const insertResetTokenSchema = createInsertSchema(resetTokens).omit({ id: true, createdAt: true });
export type InsertResetToken = z.infer<typeof insertResetTokenSchema>;
export type ResetToken = typeof resetTokens.$inferSelect;

export type PostLike = typeof postLikes.$inferSelect;

// Update the insert schema for comment replies
export const insertCommentReplySchema = createInsertSchema(commentReplies)
  .omit({ id: true, createdAt: true })
  .extend({
    content: z.string().min(3, "Reply must be at least 3 characters"),
    userId: z.number().nullable(),
    metadata: z.object({
      author: z.string(),
      isAnonymous: z.boolean().default(true),
      moderated: z.boolean().default(false),
      originalContent: z.string(),
      upvotes: z.number().default(0),
      downvotes: z.number().default(0)
    })
  });

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

// Add new insert schemas and types
// Achievement system schemas removed

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ 
  id: true,
  lastActivityAt: true 
});

export const insertSiteAnalyticsSchema = createInsertSchema(siteAnalytics).omit({ 
  id: true,
  timestamp: true 
});

// Streak-related schemas removed

// Achievement types removed

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type SiteAnalytics = typeof siteAnalytics.$inferSelect;
export type InsertSiteAnalytics = z.infer<typeof insertSiteAnalyticsSchema>;

// Streak types removed (previously for backward compatibility)
// Define custom streak type replacements as needed
export type ReadingStreak = {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date;
};
export type InsertReadingStreak = Omit<ReadingStreak, 'id' | 'lastActivityAt'>;
export type WriterStreak = ReadingStreak;
export type InsertWriterStreak = InsertReadingStreak;

// Update CommentMetadata interface
export interface CommentMetadata {
  moderated?: boolean;
  originalContent?: string;
  editHistory?: Array<{
    content: string;
    editedAt: string;
  }>;
  isAnonymous?: boolean;
  author?: string;
  upvotes?: number;
  downvotes?: number;
  replyCount?: number;
  sanitized?: boolean; // Flag to indicate content was sanitized
}

// Add insert schema and types for performance metrics
export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({ 
  id: true,
  timestamp: true 
});

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;

// Bookmark schema and types
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// User Feedback schema and types
export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  browser: z.string().optional(),
  operatingSystem: z.string().optional(),
  screenResolution: z.string().optional(),
  userAgent: z.string().optional()
});
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

// User Privacy Settings schema and types
export const insertUserPrivacySettingsSchema = createInsertSchema(userPrivacySettings).omit({ 
  id: true, 
  updatedAt: true 
});
export type InsertUserPrivacySettings = z.infer<typeof insertUserPrivacySettingsSchema>;

export type UserPrivacySettings = typeof userPrivacySettings.$inferSelect;
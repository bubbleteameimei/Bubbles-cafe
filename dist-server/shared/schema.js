import { pgTable, text, serial, integer, boolean, timestamp, index, unique, json, jsonb, decimal, doublePrecision, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Enhanced validation schemas for security
const emailSchema = z.string().email().min(1).max(255).transform(s => s.toLowerCase().trim());
const usernameSchema = z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");
const passwordSchema = z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number");
const titleSchema = z.string().min(1).max(200).trim();
const contentSchema = z.string().min(1).max(50000).trim();
const slugSchema = z.string().min(1).max(255).regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores");
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
// Enhanced validation for user operations
export const insertUserSchema = createInsertSchema(users, {
    email: emailSchema,
    username: usernameSchema,
    password_hash: z.string().min(1), // Already hashed
    metadata: z.record(z.unknown()).optional().default({})
}).omit({
    id: true,
    createdAt: true
});
export const updateUserSchema = insertUserSchema.partial().omit({
    password_hash: true // Separate endpoint for password changes
});
export const userRegistrationSchema = z.object({
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema
});
export const userLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(128),
    rememberMe: z.boolean().optional()
});
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
    likesCount: integer("likes_count").default(0),
    dislikesCount: integer("dislikes_count").default(0),
    metadata: json("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
    // Indexes for frequently accessed columns
    authorIdIdx: index("post_author_idx").on(table.authorId),
    createdAtIdx: index("post_created_at_idx").on(table.createdAt),
    themeCategoryIdx: index("post_theme_category_idx").on(table.themeCategory),
    titleIdx: index("post_title_idx").on(table.title)
}));
// Enhanced validation for post operations
export const insertPostSchema = createInsertSchema(posts, {
    title: titleSchema,
    content: contentSchema,
    excerpt: z.string().max(500).trim().optional(),
    slug: slugSchema,
    authorId: z.number().int().positive(),
    themeCategory: z.string().max(50).optional(),
    readingTimeMinutes: z.number().int().min(1).max(999).optional(),
    metadata: z.record(z.unknown()).optional().default({})
}).omit({
    id: true,
    createdAt: true,
    likesCount: true,
    dislikesCount: true
});
export const updatePostSchema = insertPostSchema.partial().omit({
    authorId: true, // Cannot change author
    slug: true // Cannot change slug after creation
});
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
// Enhanced validation for comment operations
export const insertCommentSchema = createInsertSchema(comments, {
    content: z.string().min(1).max(2000).trim(),
    postId: z.number().int().positive(),
    parentId: z.number().int().positive().optional(),
    userId: z.number().int().positive().optional(),
    metadata: z.record(z.unknown()).optional().default({})
}).omit({
    id: true,
    createdAt: true,
    is_approved: true,
    edited: true,
    editedAt: true
});
export const updateCommentSchema = z.object({
    content: z.string().min(1).max(2000).trim()
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
// Use the insertPostSchema from above (already defined at line 82)
// Use the insertCommentSchema from above (already defined at line 142)
export const insertCommentReactionSchema = createInsertSchema(commentReactions).omit({ id: true, createdAt: true });
export const insertCommentVoteSchema = createInsertSchema(commentVotes).omit({ id: true, createdAt: true });
export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true }).extend({
    metadata: z.record(z.any()).optional()
});
// Newsletter subscription schema
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true
});
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
// Reset Token Schema
export const insertResetTokenSchema = createInsertSchema(resetTokens).omit({ id: true, createdAt: true });
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
export const insertWritingChallengeSchema = createInsertSchema(writingChallenges).omit({ id: true, createdAt: true });
export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).omit({ id: true, submissionDate: true });
export const insertContentProtectionSchema = createInsertSchema(contentProtection).omit({ id: true, createdAt: true });
export const insertReportedContentSchema = createInsertSchema(reportedContent).omit({ id: true, createdAt: true });
export const insertAuthorTipSchema = createInsertSchema(authorTips).omit({ id: true, createdAt: true });
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertAdminNotificationSchema = createInsertSchema(adminNotifications).omit({ id: true, createdAt: true });
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
// Add insert schema and types for performance metrics
export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
    id: true,
    timestamp: true
});
// Bookmark schema and types
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
    id: true,
    createdAt: true
});
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
// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
    bookmarks: many(bookmarks),
    sessions: many(sessions),
    resetTokens: many(resetTokens),
    postLikes: many(postLikes),
    challengeEntries: many(challengeEntries),
    authorTips: many(authorTips),
    activityLogs: many(activityLogs),
    userProgress: many(userProgress),
    userFeedback: many(userFeedback),
    authorStats: many(authorStats),
    readingProgress: many(readingProgress),
    secretProgress: many(secretProgress),
    reportedContent: many(reportedContent),
    userPrivacySettings: many(userPrivacySettings),
}));
export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    comments: many(comments),
    bookmarks: many(bookmarks),
    postLikes: many(postLikes),
    analytics: many(analytics),
    readingProgress: many(readingProgress),
    secretProgress: many(secretProgress),
    userProgress: many(userProgress),
}));
export const commentsRelations = relations(comments, ({ one, many }) => ({
    post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
    }),
    replies: many(comments),
    reactions: many(commentReactions),
    votes: many(commentVotes),
}));
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
    user: one(users, {
        fields: [bookmarks.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [bookmarks.postId],
        references: [posts.id],
    }),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
export const resetTokensRelations = relations(resetTokens, ({ one }) => ({
    user: one(users, {
        fields: [resetTokens.userId],
        references: [users.id],
    }),
}));
export const postLikesRelations = relations(postLikes, ({ one }) => ({
    post: one(posts, {
        fields: [postLikes.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [postLikes.userId],
        references: [users.id],
    }),
}));
export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
    comment: one(comments, {
        fields: [commentReactions.commentId],
        references: [comments.id],
    }),
}));
export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
    comment: one(comments, {
        fields: [commentVotes.commentId],
        references: [comments.id],
    }),
}));
export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
    post: one(posts, {
        fields: [readingProgress.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [readingProgress.userId],
        references: [users.id],
    }),
}));
export const secretProgressRelations = relations(secretProgress, ({ one }) => ({
    post: one(posts, {
        fields: [secretProgress.postId],
        references: [posts.id],
    }),
    user: one(users, {
        fields: [secretProgress.userId],
        references: [users.id],
    }),
}));
export const analyticsRelations = relations(analytics, ({ one }) => ({
    post: one(posts, {
        fields: [analytics.postId],
        references: [posts.id],
    }),
}));
export const authorStatsRelations = relations(authorStats, ({ one }) => ({
    author: one(users, {
        fields: [authorStats.authorId],
        references: [users.id],
    }),
}));
export const writingChallengesRelations = relations(writingChallenges, ({ many }) => ({
    entries: many(challengeEntries),
}));
export const challengeEntriesRelations = relations(challengeEntries, ({ one }) => ({
    challenge: one(writingChallenges, {
        fields: [challengeEntries.challengeId],
        references: [writingChallenges.id],
    }),
    user: one(users, {
        fields: [challengeEntries.userId],
        references: [users.id],
    }),
}));
export const reportedContentRelations = relations(reportedContent, ({ one }) => ({
    reporter: one(users, {
        fields: [reportedContent.reporterId],
        references: [users.id],
    }),
}));
export const authorTipsRelations = relations(authorTips, ({ one }) => ({
    author: one(users, {
        fields: [authorTips.authorId],
        references: [users.id],
    }),
}));
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
}));
export const userProgressRelations = relations(userProgress, ({ one }) => ({
    user: one(users, {
        fields: [userProgress.userId],
        references: [users.id],
    }),
    post: one(posts, {
        fields: [userProgress.postId],
        references: [posts.id],
    }),
}));
export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
    user: one(users, {
        fields: [userFeedback.userId],
        references: [users.id],
    }),
}));
export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
    user: one(users, {
        fields: [userPrivacySettings.userId],
        references: [users.id],
    }),
}));
// User Privacy Settings schema and types
export const insertUserPrivacySettingsSchema = createInsertSchema(userPrivacySettings).omit({
    id: true,
    updatedAt: true
});

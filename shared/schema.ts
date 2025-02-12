import { pgTable, text, serial, integer, boolean, timestamp, index, unique, json, decimal, doublePrecision } from "drizzle-orm/pg-core";
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
  themeCategory: text("theme_category"),
  triggerWarnings: text("trigger_warnings").array(),
  matureContent: boolean("mature_content").default(false).notNull(),
  readingTimeMinutes: integer("reading_time_minutes").default(0).notNull()
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  authorIdIdx: index("post_author_id_idx").on(table.authorId)
}));

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  isLike: boolean("is_like").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approved: boolean("approved").default(false).notNull()
});

export const commentReplies = pgTable("comment_replies", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approved: boolean("approved").default(false).notNull()
});

export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: text("user_id").notNull(),
  isUpvote: boolean("is_upvote").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  commentUserIdx: unique().on(table.commentId, table.userId)
}));

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

// Story ratings and engagement
export const storyRatings = pgTable("story_ratings", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  fearRating: integer("fear_rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  postUserIdx: unique().on(table.postId, table.userId)
}));

export const authorStats = pgTable("author_stats", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  totalPosts: integer("total_posts").default(0).notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  avgFearRating: doublePrecision("avg_fear_rating").default(0).notNull(),
  totalTips: decimal("total_tips", { precision: 10, scale: 2 }).default("0").notNull(),
  rank: integer("rank").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  authorIdIdx: unique().on(table.authorId)
}));

export const writingChallenges = pgTable("writing_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  prizeTier: text("prize_tier"),
  rules: text("rules").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const challengeEntries = pgTable("challenge_entries", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  postId: integer("post_id").notNull(),
  authorId: integer("author_id").notNull(),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  status: text("status").default("pending").notNull()
});

export const contentProtection = pgTable("content_protection", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  contentHash: text("content_hash").notNull(),
  ipAddress: text("ip_address").notNull(),
  fingerprintData: json("fingerprint_data"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const reportedContent = pgTable("reported_content", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  reporterId: integer("reporter_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at")
});

export const authorTips = pgTable("author_tips", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  senderId: integer("sender_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  preferences: json("preferences").default({}).notNull(),
  confirmed: boolean("confirmed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastEmailSentAt: timestamp("last_email_sent_at")
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").array().notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at")
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  pageViews: integer("page_views").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  averageReadTime: integer("average_read_time").default(0).notNull(),
  bounceRate: doublePrecision("bounce_rate").default(0).notNull(),
  deviceStats: json("device_stats").default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts)
  .omit({
    id: true,
    createdAt: true,
    likesCount: true,
    dislikesCount: true,
    readingTimeMinutes: true
  })
  .extend({
    themeCategory: z.enum([
      'PSYCHOLOGICAL', 'TECHNOLOGICAL', 'COSMIC', 'FOLK_HORROR',
      'BODY_HORROR', 'SURVIVAL', 'SUPERNATURAL', 'GOTHIC',
      'APOCALYPTIC', 'LOVECRAFTIAN', 'ISOLATION', 'AQUATIC',
      'VIRAL', 'URBAN_LEGEND', 'TIME_HORROR', 'DREAMSCAPE'
    ]),
    triggerWarnings: z.array(z.string()).optional()
  });

export const insertCommentSchema = createInsertSchema(comments)
  .omit({ id: true, createdAt: true })
  .extend({
    author: z.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .transform(val => val.trim()),
    content: z.string()
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment cannot exceed 500 characters")
      .transform(val => val.trim()),
    approved: z.boolean().optional().default(false)
  });

export const insertCommentReplySchema = createInsertSchema(commentReplies)
  .omit({ id: true, createdAt: true })
  .extend({
    author: z.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .transform(val => val.trim()),
    content: z.string()
      .min(3, "Reply must be at least 3 characters")
      .max(500, "Reply cannot exceed 500 characters")
      .transform(val => val.trim()),
    approved: z.boolean().optional().default(false)
  });

export const insertCommentVoteSchema = createInsertSchema(commentVotes)
  .omit({ id: true, createdAt: true });

export const insertProgressSchema = createInsertSchema(readingProgress).omit({ id: true });
export const insertSecretProgressSchema = createInsertSchema(secretProgress).omit({ id: true, discoveryDate: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true, lastAccessedAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });

// Add insert schemas for new tables
export const insertStoryRatingSchema = createInsertSchema(storyRatings).omit({ id: true, createdAt: true });
export const insertAuthorStatsSchema = createInsertSchema(authorStats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWritingChallengeSchema = createInsertSchema(writingChallenges).omit({ id: true, createdAt: true });
export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).omit({ id: true });
export const insertContentProtectionSchema = createInsertSchema(contentProtection).omit({ id: true, createdAt: true });
export const insertReportedContentSchema = createInsertSchema(reportedContent).omit({ id: true, createdAt: true, resolvedAt: true });
export const insertAuthorTipSchema = createInsertSchema(authorTips).omit({ id: true, createdAt: true });
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ id: true, createdAt: true, lastEmailSentAt: true });
export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true, lastTriggeredAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, updatedAt: true });

export type Post = typeof posts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type SecretProgress = typeof secretProgress.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type CommentReply = typeof commentReplies.$inferSelect;
export type CommentVote = typeof commentVotes.$inferSelect;

// Add select types for new tables
export type StoryRating = typeof storyRatings.$inferSelect;
export type AuthorStats = typeof authorStats.$inferSelect;
export type WritingChallenge = typeof writingChallenges.$inferSelect;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;
export type ContentProtection = typeof contentProtection.$inferSelect;
export type ReportedContent = typeof reportedContent.$inferSelect;
export type AuthorTip = typeof authorTips.$inferSelect;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type InsertSecretProgress = z.infer<typeof insertSecretProgressSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type InsertCommentReply = z.infer<typeof insertCommentReplySchema>;
export type InsertCommentVote = z.infer<typeof insertCommentVoteSchema>;

// Add insert types for new tables
export type InsertStoryRating = z.infer<typeof insertStoryRatingSchema>;
export type InsertAuthorStats = z.infer<typeof insertAuthorStatsSchema>;
export type InsertWritingChallenge = z.infer<typeof insertWritingChallengeSchema>;
export type InsertChallengeEntry = z.infer<typeof insertChallengeEntrySchema>;
export type InsertContentProtection = z.infer<typeof insertContentProtectionSchema>;
export type InsertReportedContent = z.infer<typeof insertReportedContentSchema>;
export type InsertAuthorTip = z.infer<typeof insertAuthorTipSchema>;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;
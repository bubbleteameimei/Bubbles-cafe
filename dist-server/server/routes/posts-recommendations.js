import { db } from "../db";
import { posts } from "@shared/schema";
import { desc, eq, and, ne, or, sql } from "drizzle-orm";
/**
 * Register routes specifically for post recommendations
 */
export function registerPostRecommendationsRoutes(app) {
    console.log("Registering post recommendations routes");
    /**
     * GET /api/posts/recommendations
     * Get story recommendations based on a given post ID and theme categories
     */
    app.get("/api/posts/recommendations", async (req, res) => {
        console.log("Post recommendations endpoint called:", req.url);
        try {
            const postId = req.query.postId ? Number(req.query.postId) : null;
            const limit = Number(req.query.limit) || 3;
            console.log(`Fetching recommendations for postId: ${postId}, limit: ${limit}`);
            // If no postId provided, just return recent posts
            if (!postId) {
                console.log('No postId provided, returning recent posts');
                const recentPosts = await fetchRecentPosts(limit);
                const enhancedPosts = enhancePostsWithMetadata(recentPosts);
                return res.json(enhancedPosts);
            }
            // Get source post details
            const sourcePostResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
            if (sourcePostResult.length === 0) {
                return res.status(404).json({ error: 'Source post not found' });
            }
            const sourcePost = sourcePostResult[0];
            console.log(`Found source post: ${sourcePost.title}`);
            // Extract metadata for theme-based recommendations
            const metadata = sourcePost.metadata;
            // Extract theme category if available
            let themeCategory = null;
            if (typeof metadata === 'string') {
                try {
                    const parsedMetadata = JSON.parse(metadata);
                    themeCategory = parsedMetadata?.themeCategory || null;
                }
                catch (e) {
                    console.log('Error parsing metadata string:', e);
                }
            }
            else if (metadata && typeof metadata === 'object') {
                // Using any here to avoid TypeScript errors with dynamic properties
                const metadataObj = metadata;
                themeCategory = metadataObj.themeCategory || null;
            }
            // Try to find posts with the same theme category if available
            let recommendedPosts = [];
            if (themeCategory) {
                console.log(`Finding posts with theme: ${themeCategory}`);
                recommendedPosts = await db.select({
                    id: posts.id,
                    title: posts.title,
                    slug: posts.slug,
                    excerpt: posts.excerpt,
                    createdAt: posts.createdAt
                })
                    .from(posts)
                    .where(and(ne(posts.id, postId), or(sql `${posts.metadata}->>'themeCategory' = ${themeCategory}`, sql `${posts.title} ILIKE ${`%${sourcePost.title.split(' ')[0]}%`}`)))
                    .orderBy(desc(posts.createdAt))
                    .limit(limit);
            }
            else {
                // Fallback to keyword matching
                console.log('No theme category found, using keyword matching');
                // Extract keywords from title for matching
                const titleKeywords = sourcePost.title
                    .toLowerCase()
                    .split(' ')
                    .filter((word) => word.length > 3)
                    .slice(0, 3);
                if (titleKeywords.length > 0) {
                    console.log(`Using keywords: ${titleKeywords.join(', ')}`);
                    const conditions = titleKeywords.map((keyword) => sql `${posts.title} ILIKE ${`%${keyword}%`} OR ${posts.excerpt} ILIKE ${`%${keyword}%`}`);
                    recommendedPosts = await db.select({
                        id: posts.id,
                        title: posts.title,
                        slug: posts.slug,
                        excerpt: posts.excerpt,
                        createdAt: posts.createdAt
                    })
                        .from(posts)
                        .where(and(ne(posts.id, postId), or(...conditions)))
                        .orderBy(desc(posts.createdAt))
                        .limit(limit);
                }
                else {
                    // If no meaningful keywords, just get recent posts
                    recommendedPosts = await fetchRecentPosts(limit, postId);
                }
            }
            // If we didn't find enough posts, supplement with recent ones
            if (recommendedPosts.length < limit) {
                console.log(`Only found ${recommendedPosts.length} related posts, supplementing with recent posts`);
                if (recommendedPosts.length === 0) {
                    // If no related posts found, just get recent posts
                    recommendedPosts = await fetchRecentPosts(limit, postId);
                }
                else {
                    // Otherwise, add more posts to reach the limit
                    const existingIds = recommendedPosts.map((p) => p.id);
                    // Only try to supplement if we have existing posts and there are at least 2 ids
                    if (existingIds.length > 0) {
                        try {
                            const additionalPosts = await db.select({
                                id: posts.id,
                                title: posts.title,
                                slug: posts.slug,
                                excerpt: posts.excerpt,
                                createdAt: posts.createdAt
                            })
                                .from(posts)
                                .where(and(ne(posts.id, postId), sql `${posts.id} NOT IN (${existingIds.join(',')})`))
                                .orderBy(desc(posts.createdAt))
                                .limit(limit - recommendedPosts.length);
                            recommendedPosts = [...recommendedPosts, ...additionalPosts];
                        }
                        catch (err) {
                            console.error("Error supplementing posts:", err);
                            // Fallback if the NOT IN clause fails
                            const fallbackPosts = await fetchRecentPosts(limit - recommendedPosts.length, postId);
                            recommendedPosts = [...recommendedPosts, ...fallbackPosts];
                        }
                    }
                }
            }
            console.log(`Found ${recommendedPosts.length} recommended posts`);
            // Add estimated reading time and other metadata
            const enhancedPosts = enhancePostsWithMetadata(recommendedPosts);
            return res.json(enhancedPosts);
        }
        catch (error) {
            console.error("Error getting post recommendations:", error);
            return res.status(500).json({
                message: "An error occurred while fetching recommendations",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
/**
 * Fetch recent posts, excluding a specific post if needed
 */
async function fetchRecentPosts(limit, excludeId) {
    try {
        const query = db.select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            createdAt: posts.createdAt
        })
            .from(posts)
            .orderBy(desc(posts.createdAt))
            .limit(limit);
        if (excludeId) {
            query.where(ne(posts.id, excludeId));
        }
        return await query;
    }
    catch (error) {
        console.error("Error fetching recent posts:", error);
        return [];
    }
}
/**
 * Add metadata to posts for frontend display
 */
function enhancePostsWithMetadata(posts) {
    return posts.map(post => {
        // Estimate reading time based on excerpt length
        const wordCount = post.excerpt ? post.excerpt.split(' ').length : 0;
        const readingTime = Math.max(2, Math.ceil(wordCount / 200)); // Assume 200 words per minute
        return {
            ...post,
            readingTime,
            authorName: 'Anonymous', // Default author
            views: Math.floor(Math.random() * 100) + 10, // Random view count 
            likes: Math.floor(Math.random() * 20) + 1 // Random like count
        };
    });
}

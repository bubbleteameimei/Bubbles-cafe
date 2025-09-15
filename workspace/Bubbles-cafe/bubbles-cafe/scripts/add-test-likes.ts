import { db } from "../server/db";
import { posts } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * This script adds test likes to specific posts to test the 
 * featured story selection algorithm. 
 * This only updates the likesCount directly without creating individual likes.
 */
async function addTestLikes() {
  try {
    console.log("Starting to add test likes to posts...");
    
    // First get all posts
    const allPosts = await db.select().from(posts);
    console.log(`Found ${allPosts.length} posts`);
    
    // Reset all posts like counts to zero first
    for (const post of allPosts) {
      await db.update(posts)
        .set({ 
          likesCount: 0,
          dislikesCount: 0
        })
        .where(eq(posts.id, post.id));
      console.log(`Reset counts for post ${post.id} (${post.title})`);
    }
    
    // Add specific likes to different posts
    // We'll give most likes to post with ID 3 (HUNGER) to make it featured
    const likeCounts = {
      3: 20,   // HUNGER - Most likes
      7: 15,   // CAVE - Second most likes
      10: 10,  // MACHINE - Third most likes
      5: 5,    // JOURNAL - Some likes
      12: 5    // DRIVE - Some likes
    };
    
    // Update like counts directly for each post
    for (const [postId, count] of Object.entries(likeCounts)) {
      const id = parseInt(postId);
      
      // Update the post's like count
      await db.update(posts)
        .set({ likesCount: count })
        .where(eq(posts.id, id));
      
      console.log(`Set ${count} likes for post ${id}`);
    }
    
    // Add page views to metadata for some posts (simulate engagement)
    const viewCounts = {
      3: 100,  // HUNGER
      7: 80,   // CAVE
      10: 60,  // MACHINE
      5: 30,   // JOURNAL
      12: 25   // DRIVE
    };
    
    for (const [postId, views] of Object.entries(viewCounts)) {
      const id = parseInt(postId);
      const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      
      if (post.length > 0) {
        let metadata = post[0].metadata || {};
        
        // If metadata is a string, parse it
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch (e) {
            metadata = {};
          }
        }
        
        // Ensure metadata is an object
        if (!metadata || typeof metadata !== 'object') {
          metadata = {};
        }
        
        // Add or update pageViews - use type assertion to avoid TS errors
        (metadata as any).pageViews = views;
        
        console.log(`Setting metadata for post ${id}:`, metadata);
        
        // Update the post with the new metadata
        await db.update(posts)
          .set({ metadata })
          .where(eq(posts.id, id));
          
        console.log(`Updated metadata with ${views} pageViews for post ${id}`);
      }
    }
    
    // Verify the like counts and metadata
    const updatedPosts = await db.select({
      id: posts.id,
      title: posts.title,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      metadata: posts.metadata
    }).from(posts).orderBy(posts.likesCount);
    
    console.log("\nUpdated post metrics:");
    for (const post of updatedPosts) {
      const views = post.metadata && typeof post.metadata === 'object' && 
        'pageViews' in post.metadata ? post.metadata.pageViews : 0;
        
      console.log(`Post ${post.id} (${post.title}): ${post.likesCount} likes, ${post.dislikesCount} dislikes, ${views} views`);
    }
    
    console.log("\nTest metrics added successfully!");
  } catch (error) {
    console.error("Error adding test metrics:", error);
  } finally {
    process.exit(0);
  }
}

addTestLikes();
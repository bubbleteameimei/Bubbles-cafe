import { db } from "../server/db";
import { posts } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * This script checks the current state of post metrics
 * that would influence the featured story selection.
 */
async function checkFeaturedStory() {
  try {
    console.log("Checking current post metrics for featured story selection...");
    
    // Fetch all posts with metrics, ordered by likes
    const allPosts = await db.select({
      id: posts.id,
      title: posts.title,
      likesCount: posts.likesCount,
      dislikesCount: posts.dislikesCount,
      createdAt: posts.createdAt,
      metadata: posts.metadata
    }).from(posts).orderBy(posts.likesCount);
    
    console.log(`\nFound ${allPosts.length} posts\n`);
    console.log("POST METRICS (ordered by likes count):");
    console.log("---------------------------------------");
    
    // Display all posts and their metrics
    allPosts.forEach(post => {
      const views = post.metadata && typeof post.metadata === 'object' && 
        'pageViews' in (post.metadata as Record<string, unknown>) ? 
        Number((post.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      // Calculate a simple score based on likes and views
      const score = (post.likesCount || 0) * 3 + views;
      
      // Format for display
      console.log(`Post ${post.id} (${post.title}):`);
      console.log(`  Likes: ${post.likesCount || 0}`);
      console.log(`  Dislikes: ${post.dislikesCount || 0}`);
      console.log(`  Page Views: ${views || 0}`);
      console.log(`  Created: ${post.createdAt}`);
      console.log(`  Simple Score: ${score}`);
      console.log("---------------------------------------");
    });
    
    // Calculate which posts should be in the top 5
    console.log("\nTOP 5 POSTS BY SCORE:");
    console.log("---------------------");
    
    const scoredPosts = allPosts.map(post => {
      const views = post.metadata && typeof post.metadata === 'object' && 
        'pageViews' in (post.metadata as Record<string, unknown>) ? 
        Number((post.metadata as Record<string, unknown>).pageViews || 0) : 0;
      
      // Calculate score using same formula as in the frontend
      const score = (post.likesCount || 0) * 3 + views;
      
      return {
        id: post.id,
        title: post.title,
        score,
        likes: post.likesCount || 0,
        views: views || 0
      };
    }).sort((a, b) => b.score - a.score);
    
    // Display top 5 posts
    scoredPosts.slice(0, 5).forEach((post, index) => {
      console.log(`#${index + 1}: "${post.title}" (ID: ${post.id}) - Score: ${post.score} [${post.likes} likes, ${post.views} views]`);
    });
    
    // Calculate which post would be featured today based on daily rotation
    const dayOfYear = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const rotationIndex = dayOfYear % 5; // 0-4 based on day of year
    
    console.log(`\nToday's rotation index: ${rotationIndex} (based on day of year ${dayOfYear})`);
    
    if (scoredPosts.length >= 5) {
      console.log(`\nTODAY'S FEATURED STORY SHOULD BE:`);
      console.log(`"${scoredPosts[rotationIndex].title}" (ID: ${scoredPosts[rotationIndex].id})`);
      console.log(`With ${scoredPosts[rotationIndex].likes} likes and ${scoredPosts[rotationIndex].views} views`);
    } else {
      console.log(`\nTODAY'S FEATURED STORY SHOULD BE (less than 5 posts total):`);
      console.log(`"${scoredPosts[0].title}" (ID: ${scoredPosts[0].id})`);
    }
    
  } catch (error) {
    console.error("Error checking featured story:", error);
  } finally {
    process.exit(0);
  }
}

checkFeaturedStory();
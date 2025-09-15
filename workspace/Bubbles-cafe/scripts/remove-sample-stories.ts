#!/usr/bin/env tsx
/**
 * Remove Sample Stories Script
 * 
 * This script removes sample/demo stories from the database, keeping only
 * the WordPress API stories. It identifies sample stories by their metadata
 * and content patterns.
 */

import { db } from '../server/db';
import { posts } from '../shared/schema';
import { eq, like, or, and, isNull } from 'drizzle-orm';

const logger = {
  info: (msg: string) => console.log(`[Remove Sample Stories] ${msg}`),
  error: (msg: string) => console.error(`[Remove Sample Stories ERROR] ${msg}`),
  success: (msg: string) => console.log(`[Remove Sample Stories SUCCESS] ✅ ${msg}`),
  warn: (msg: string) => console.warn(`[Remove Sample Stories WARNING] ⚠️ ${msg}`)
};

async function identifySampleStories() {
  logger.info('Identifying sample stories...');
  
  try {
    // Get all posts to analyze
    const allPosts = await db.select().from(posts);
    
    logger.info(`Found ${allPosts.length} total posts`);
    
    // Identify sample stories by common patterns
    const sampleStories = allPosts.filter(post => {
      // Check for typical sample story titles
      const sampleTitlePatterns = [
        'Building Your First Interactive Story',
        'The Art of Interactive Storytelling', 
        'Welcome to Our Digital Storytelling Platform',
        'Getting Started',
        'Sample Story',
        'Demo Story',
        'Test Story',
        'Example Story'
      ];
      
      // Check if title matches sample patterns
      const isSampleTitle = sampleTitlePatterns.some(pattern => 
        post.title.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // Check for sample content patterns
      const sampleContentPatterns = [
        'This is a sample',
        'This is an example',
        'Welcome to our platform',
        'Getting started with',
        'Lorem ipsum',
        'placeholder content'
      ];
      
      const isSampleContent = sampleContentPatterns.some(pattern =>
        post.content.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // WordPress stories typically have shorter, single-word titles
      const isWordPressStyle = post.title.length <= 15 && 
                              post.title.toUpperCase() === post.title &&
                              !post.title.includes(' ');
      
      // Consider it a sample story if it matches sample patterns and isn't WordPress style
      return (isSampleTitle || isSampleContent) && !isWordPressStyle;
    });
    
    logger.info(`Identified ${sampleStories.length} sample stories:`);
    sampleStories.forEach(story => {
      logger.info(`- ID: ${story.id}, Title: "${story.title}"`);
    });
    
    return sampleStories;
    
  } catch (error) {
    logger.error('Failed to identify sample stories');
    logger.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function removeSampleStories() {
  logger.info('Starting sample story removal...');
  
  try {
    // First, identify sample stories
    const sampleStories = await identifySampleStories();
    
    if (sampleStories.length === 0) {
      logger.success('No sample stories found to remove');
      return;
    }
    
    // Ask for confirmation (in a real scenario)
    logger.warn(`About to remove ${sampleStories.length} sample stories`);
    
    // Remove each sample story
    let removedCount = 0;
    for (const story of sampleStories) {
      try {
        await db.delete(posts).where(eq(posts.id, story.id));
        logger.info(`Removed: "${story.title}" (ID: ${story.id})`);
        removedCount++;
      } catch (error) {
        logger.error(`Failed to remove story ID ${story.id}: ${error}`);
      }
    }
    
    logger.success(`Successfully removed ${removedCount} sample stories`);
    
    // Show remaining posts
    const remainingPosts = await db.select({
      id: posts.id,
      title: posts.title,
      isAdminPost: posts.isAdminPost
    }).from(posts);
    
    logger.info(`Remaining ${remainingPosts.length} stories:`);
    remainingPosts.forEach(post => {
      const type = post.isAdminPost ? '(WordPress)' : '(Community)';
      logger.info(`- ID: ${post.id}, Title: "${post.title}" ${type}`);
    });
    
  } catch (error) {
    logger.error('Failed to remove sample stories');
    logger.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  removeSampleStories().catch((error) => {
    logger.error('Unhandled error during sample story removal');
    logger.error(error);
    process.exit(1);
  });
}

export { removeSampleStories, identifySampleStories };
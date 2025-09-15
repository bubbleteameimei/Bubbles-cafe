// Test script to create an admin user and analytics data
import { db } from './server/db.js';
import { analytics, users, postsTable } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Creating test admin user and analytics data...');
  
  try {
    // Create admin user if it doesn't exist
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.username, 'testadmin')
    });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('testadmin', salt);
      
      await db.insert(users).values({
        username: 'testadmin',
        email: 'testadmin@example.com',
        password_hash: passwordHash,
        isAdmin: true,
        createdAt: new Date()
      });
      
      console.log('Created test admin user: testadmin / testadmin');
    } else {
      console.log('Test admin user already exists');
    }
    
    // Create analytics data
    const existingAnalytics = await db.select().from(analytics).limit(1);
    
    if (existingAnalytics.length === 0) {
      // Get some posts to use for trending posts
      const somePosts = await db.select({
        id: postsTable.id,
        title: postsTable.title,
        slug: postsTable.slug
      })
      .from(postsTable)
      .limit(5);
      
      // Add fake analytics data
      await db.insert(analytics).values({
        pageViews: 1500,
        uniqueVisitors: 750,
        averageReadTime: 180,
        bounceRate: 0.35,
        postId: somePosts[0]?.id || 1,
        deviceStats: JSON.stringify({
          desktop: 450,
          mobile: 250,
          tablet: 50
        })
      });
      
      console.log('Created test analytics data');
    } else {
      console.log('Analytics data already exists');
    }
    
    console.log('Test data setup complete!');
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    process.exit(0);
  }
}

main();
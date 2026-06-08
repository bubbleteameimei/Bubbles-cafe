import { db } from '../server/db.js';
import { users, posts, comments, authorStats, siteSettings, bookmarks } from '../shared/schema.js';
import { sql } from 'drizzle-orm';
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Verify admin user presence (do not create automatically)
    console.log('Verifying admin user presence...');
    const existingAdmin = await db.select().from(users).where(sql`is_admin = true`).limit(1);
    
    let adminUserId: number | null = null;
    if (existingAdmin.length === 0) {
      console.log('⚠️ No admin user found. Please create one securely via a controlled process.');
    } else {
      adminUserId = existingAdmin[0].id;
      console.log('✅ Admin user exists');
    }

    // Create author stats for admin
    console.log('Setting up author stats...');
    const existingStats = await db.select().from(authorStats).where(sql`author_id = ${adminUserId}`).limit(1);
    if (existingStats.length === 0) {
      await db.insert(authorStats).values({
        authorId: adminUserId,
        totalPosts: 0,
        totalLikes: 0,
        totalTips: '0'
      });
      console.log('✅ Author stats created');
    }

    // Skip creating sample posts - WordPress API sync will provide authentic content
    console.log('Skipping sample posts - WordPress API sync will populate stories...');

    // Initialize site settings
    console.log('Setting up site configuration...');
    const defaultSettings = [
      { key: 'site_name', value: 'Bubbles Cafe', category: 'general', description: 'The name of the website' },
      { key: 'site_description', value: 'Interactive horror and gothic storytelling platform', category: 'general', description: 'Site description for SEO' },
      { key: 'enable_comments', value: 'true', category: 'features', description: 'Allow comments on posts' },
      { key: 'enable_bookmarks', value: 'true', category: 'features', description: 'Allow users to bookmark posts' },
      { key: 'max_upload_size', value: '10485760', category: 'limits', description: 'Maximum upload size in bytes' },
      { key: 'theme_color', value: '#dc2626', category: 'appearance', description: 'Primary theme color - red for horror theme' }
    ];

    for (const setting of defaultSettings) {
      const existing = await db.select().from(siteSettings).where(sql`key = ${setting.key}`).limit(1);
      if (existing.length === 0) {
        await db.insert(siteSettings).values(setting);
      }
    }
    console.log('✅ Site settings configured');

    // Update author stats
    if (adminUserId) {
      const postCount = await db.select().from(posts).where(sql`author_id = ${adminUserId}`);
      await db.update(authorStats)
        .set({ totalPosts: postCount.length })
        .where(sql`author_id = ${adminUserId}`);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 No sample posts created - WordPress API will sync authentic content');
    } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

export { initializeDatabase };

import { db } from '../server/db.js';
import { users, posts, comments, authorStats, siteSettings, bookmarks } from '../shared/schema.js';
import { sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Create admin user
    console.log('Setting up admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if vandalison@gmail.com admin user already exists
    const existingAdmin = await db.select().from(users).where(sql`email = 'vandalison@gmail.com'`).limit(1);
    
    let adminUserId: number;
    if (existingAdmin.length === 0) {
      const [adminUser] = await db.insert(users).values({
        username: 'vandalison',
        email: 'vandalison@gmail.com',
        password_hash: hashedPassword,
        isAdmin: true,
        metadata: {
          fullName: 'Site Administrator',
          bio: 'Welcome to our digital storytelling platform',
          avatar: '/images/admin-avatar.jpg'
        }
      }).returning();
      adminUserId = adminUser.id;
      console.log('✅ Admin user created: vandalison@gmail.com');
    } else {
      adminUserId = existingAdmin[0].id;
      console.log('✅ Admin user exists: vandalison@gmail.com');
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
      { key: 'site_name', value: 'Bubbles Cafe', type: 'string', description: 'The name of the website' },
      { key: 'site_description', value: 'Interactive horror and gothic storytelling platform', type: 'string', description: 'Site description for SEO' },
      { key: 'enable_comments', value: 'true', type: 'boolean', description: 'Allow comments on posts' },
      { key: 'enable_bookmarks', value: 'true', type: 'boolean', description: 'Allow users to bookmark posts' },
      { key: 'max_upload_size', value: '10485760', type: 'number', description: 'Maximum upload size in bytes' },
      { key: 'theme_color', value: '#dc2626', type: 'string', description: 'Primary theme color - red for horror theme' }
    ];

    for (const setting of defaultSettings) {
      const existing = await db.select().from(siteSettings).where(sql`key = ${setting.key}`).limit(1);
      if (existing.length === 0) {
        await db.insert(siteSettings).values(setting);
      }
    }
    console.log('✅ Site settings configured');

    // Update author stats
    const postCount = await db.select().from(posts).where(sql`author_id = ${adminUserId}`);
    await db.update(authorStats)
      .set({ totalPosts: postCount.length })
      .where(sql`author_id = ${adminUserId}`);

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 No sample posts created - WordPress API will sync authentic content');
    console.log('👤 Admin user ready (email: vandalison@gmail.com, password: admin123)');
    
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
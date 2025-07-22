import { db } from '../server/db';
import { 
  users, 
  posts, 
  comments, 
  sessions,
  resetTokens,
  postLikes,
  bookmarks,
  analytics,
  authorStats,
  writingChallenges,
  challengeEntries,
  reportedContent,
  authorTips,
  activityLogs,
  userProgress,
  siteAnalytics,
  userFeedback,
  userPrivacySettings,
  contactMessages,
  newsletterSubscriptions,
  readingProgress,
  secretProgress,
  commentReactions,
  commentVotes,
  contentProtection,
  webhooks,
  adminNotifications,
  siteSettings,
  performanceMetrics
} from '@shared/schema';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

async function initializeDatabase() {
  console.log('🚀 Initializing database...');
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

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

    // Create sample author stats
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

    // Create sample posts to seed the database
    console.log('Creating sample posts...');
    
    const samplePosts = [
      {
        title: 'Welcome to Our Digital Storytelling Platform',
        content: `# Welcome to the Future of Storytelling

Welcome to our advanced AI-powered digital storytelling platform! This is where creativity meets technology to create immersive and interactive narrative experiences.

## What Makes Us Special

Our platform combines cutting-edge technologies:
- **React** with advanced state management
- **TypeScript** for robust development  
- **Tailwind CSS** for responsive design
- **PostgreSQL** for persistent story data
- **Framer Motion** for sophisticated animations
- **Phaser** for interactive storytelling elements

## Features You'll Love

- 📚 **Interactive Stories**: Engage with narratives that respond to your choices
- 🎨 **Beautiful Design**: Responsive layouts that work on any device
- 💾 **Progress Tracking**: Never lose your place in a story
- 🔖 **Bookmarks**: Save your favorite moments
- 💬 **Community**: Comment and discuss with other readers
- 🌟 **Personalization**: Stories adapt to your preferences

## Getting Started

Explore our growing collection of stories, create your own narratives, or simply enjoy the immersive reading experience we've crafted for you.

Happy reading! 📖✨`,
        excerpt: 'Discover our advanced AI-powered digital storytelling platform where creativity meets technology.',
        slug: 'welcome-to-digital-storytelling',
        authorId: adminUserId,
        isSecret: false,
        isAdminPost: true,
        matureContent: false,
        themeCategory: 'introduction',
        readingTimeMinutes: 3,
        likesCount: 0,
        dislikesCount: 0,
        metadata: {
          isAdminPost: true,
          isCommunityPost: false,
          status: 'publish',
          themeCategory: 'introduction',
          themeIcon: '🚀'
        }
      },
      {
        title: 'The Art of Interactive Storytelling',
        content: `# The Art of Interactive Storytelling

Interactive storytelling represents a revolutionary approach to narrative experiences, where readers become active participants in shaping the story's direction and outcome.

## The Evolution of Narrative

Traditional storytelling has evolved from cave paintings to books, from theater to cinema, and now to interactive digital experiences. Each medium has brought new possibilities for engaging audiences.

### What Makes Stories Interactive?

Interactive stories differ from traditional narratives in several key ways:

- **Reader Choice**: Decisions that impact story progression
- **Multiple Paths**: Different routes through the narrative
- **Dynamic Content**: Stories that adapt based on reader preferences
- **Multimedia Integration**: Combining text, audio, visual, and interactive elements

## Technology Behind the Magic

Our platform leverages modern web technologies to create seamless interactive experiences:

\`\`\`typescript
// Example of dynamic story progression
const StoryBranch = ({ userChoice, onNextScene }) => {
  const handleChoice = (choice) => {
    // Process user decision
    onNextScene(determineNextScene(choice));
  };
  
  return (
    <div className="story-choice">
      {choices.map(choice => (
        <button onClick={() => handleChoice(choice)}>
          {choice.text}
        </button>
      ))}
    </div>
  );
};
\`\`\`

## The Psychology of Engagement

Interactive stories work because they tap into fundamental human psychology:

1. **Agency**: Feeling of control over outcomes
2. **Investment**: Emotional connection through participation
3. **Curiosity**: Desire to explore different possibilities
4. **Personalization**: Stories that feel uniquely yours

## Creating Memorable Experiences

The best interactive stories balance structure with freedom, guiding readers while giving them meaningful choices that matter to the narrative outcome.`,
        excerpt: 'Explore how interactive storytelling revolutionizes narrative experiences through reader participation and choice.',
        slug: 'art-of-interactive-storytelling',
        authorId: adminUserId,
        isSecret: false,
        isAdminPost: true,
        matureContent: false,
        themeCategory: 'education',
        readingTimeMinutes: 7,
        likesCount: 0,
        dislikesCount: 0,
        metadata: {
          isAdminPost: true,
          isCommunityPost: false,
          status: 'publish',
          themeCategory: 'education',
          themeIcon: '🎭'
        }
      },
      {
        title: 'Building Your First Interactive Story',
        content: `# Building Your First Interactive Story

Ready to create your own interactive narrative? This guide will walk you through the process of crafting engaging stories that respond to reader choices.

## Planning Your Story

Before diving into writing, consider these foundational elements:

### Story Structure
- **Beginning**: Hook your readers immediately
- **Middle**: Present meaningful choices and consequences
- **End**: Multiple satisfying conclusions

### Character Development
Create characters that readers can relate to and care about:
- Clear motivations and goals
- Distinct personalities and voices
- Character growth through story progression

## Writing Interactive Elements

### Choice Points
Design choices that feel meaningful:

\`\`\`markdown
**You stand at the crossroads. Which path do you choose?**

A) Take the forest path - mysterious but potentially dangerous
B) Follow the mountain trail - longer but safer
C) Stay and wait for help - risk the approaching storm
\`\`\`

### Branching Narratives
Create paths that reconverge when possible:
- Maintain story coherence
- Avoid exponential complexity
- Ensure all paths have value

## Technical Implementation

Our platform provides tools to make story creation intuitive:

### Story Editor Features
- Visual branching diagram
- Choice consequence preview
- Character tracking across paths
- Reading time estimation

### Interactive Elements
- Embedded media support
- Custom styling options
- Reader progress tracking
- Bookmark integration

## Best Practices

1. **Start Simple**: Begin with 2-3 choice points
2. **Test Early**: Get feedback on story flow
3. **Plan Paths**: Map out major story branches
4. **Character Consistency**: Maintain voice across paths
5. **Meaningful Choices**: Ensure decisions matter

## Publishing Your Story

Once complete, our platform helps you:
- Preview your interactive story
- Test all narrative paths
- Gather reader feedback
- Track engagement metrics

## Community and Collaboration

Join our community of storytellers:
- Share writing tips and techniques
- Collaborate on larger projects
- Participate in writing challenges
- Get feedback from fellow creators

Start your storytelling journey today! 🚀`,
        excerpt: 'Learn how to create compelling interactive stories with our comprehensive guide for new storytellers.',
        slug: 'building-first-interactive-story',
        authorId: adminUserId,
        isSecret: false,
        isAdminPost: true,
        matureContent: false,
        themeCategory: 'tutorial',
        readingTimeMinutes: 12,
        likesCount: 0,
        dislikesCount: 0,
        metadata: {
          isAdminPost: true,
          isCommunityPost: false,
          status: 'publish',
          themeCategory: 'tutorial',
          themeIcon: '📝'
        }
      }
    ];

    // Check if posts already exist before inserting
    for (const postData of samplePosts) {
      const existingPost = await db.select().from(posts).where(sql`slug = ${postData.slug}`).limit(1);
      if (existingPost.length === 0) {
        await db.insert(posts).values(postData);
        console.log(`✅ Created post: ${postData.title}`);
      } else {
        console.log(`📝 Post already exists: ${postData.title}`);
      }
    }

    // Initialize site settings
    console.log('Setting up site configuration...');
    const defaultSettings = [
      { key: 'site_name', value: 'Digital Storytelling Platform', category: 'general', description: 'The name of the website' },
      { key: 'site_description', value: 'An advanced AI-powered digital storytelling platform', category: 'general', description: 'Site description for SEO' },
      { key: 'enable_comments', value: 'true', category: 'features', description: 'Allow comments on posts' },
      { key: 'enable_bookmarks', value: 'true', category: 'features', description: 'Allow users to bookmark posts' },
      { key: 'max_upload_size', value: '10485760', category: 'uploads', description: 'Maximum upload size in bytes' },
      { key: 'theme_color', value: '#3b82f6', category: 'appearance', description: 'Primary theme color' }
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
    console.log(`📊 Created ${samplePosts.length} sample posts`);
    console.log('👤 Admin user ready (email: admin@storytelling.com, password: admin123)');
    
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
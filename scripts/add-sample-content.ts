import { db } from '../server/db';
import { posts, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const samplePosts = [
  {
    title: "BLOOD",
    content: "The crimson liquid flows through ancient veins, carrying secrets darker than midnight. In the depths of the old manor, where shadows dance with forgotten memories, something stirs. The blood remembers what the mind forgets, and tonight, it seeks its rightful place in the circle of eternity.",
    excerpt: "The crimson liquid flows through ancient veins, carrying secrets darker than midnight...",
    slug: "blood",
    themeCategory: "Horror",
    readingTime: 2
  },
  {
    title: "WORD",
    content: "Whispered in the dead of night, the word carries power beyond mortal comprehension. It echoes through empty halls, reverberating off walls that have witnessed unspeakable horrors. Those who speak it invite darkness into their souls, and those who hear it are forever changed.",
    excerpt: "Whispered in the dead of night, the word carries power beyond mortal comprehension...",
    slug: "word",
    themeCategory: "Supernatural",
    readingTime: 2
  },
  {
    title: "HUNGER",
    content: "An insatiable appetite that consumes from within, growing stronger with each passing moment. The hunger knows no bounds, respects no barriers, and shows no mercy. It feeds on fear, thrives on desperation, and demands sacrifice from those who dare to venture into its domain.",
    excerpt: "An insatiable appetite that consumes from within, growing stronger with each passing moment...",
    slug: "hunger",
    themeCategory: "Horror",
    readingTime: 2
  },
  {
    title: "SILENCE",
    content: "In the absence of sound, terror finds its voice. The silence speaks louder than any scream, more terrifying than any cry for help. It wraps around you like a shroud, suffocating hope and extinguishing the light of reason. In the silence, you are truly alone.",
    excerpt: "In the absence of sound, terror finds its voice...",
    slug: "silence",
    themeCategory: "Psychological",
    readingTime: 2
  },
  {
    title: "SHADOW",
    content: "It follows where light cannot reach, exists where hope dares not tread. The shadow knows your deepest fears, your darkest secrets, your most vulnerable moments. It waits patiently, growing stronger with each doubt, each fear, each moment of despair.",
    excerpt: "It follows where light cannot reach, exists where hope dares not tread...",
    slug: "shadow",
    themeCategory: "Horror",
    readingTime: 2
  }
];

async function addSampleContent() {
  try {
    console.log('🚀 Adding sample content to database...');
    
    // Get admin user
    const [admin] = await db.select()
      .from(users)
      .where(eq(users.email, 'admin@storytelling.local'))
      .limit(1);
    
    if (!admin) {
      throw new Error('Admin user not found. Please run database setup first.');
    }
    
    console.log('✅ Admin user found:', admin.id);
    
    let createdCount = 0;
    
    for (const post of samplePosts) {
      try {
        // Check if post already exists
        const [existingPost] = await db.select()
          .from(posts)
          .where(eq(posts.slug, post.slug))
          .limit(1);
        
        if (!existingPost) {
          await db.insert(posts).values({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            authorId: admin.id,
            isAdminPost: true,
            matureContent: false,
            themeCategory: post.themeCategory,
            readingTimeMinutes: post.readingTime,
            metadata: {
              source: 'sample-content',
              type: 'horror-story'
            }
          });
          
          createdCount++;
          console.log(`✅ Created post: ${post.title}`);
        } else {
          console.log(`ℹ️  Post already exists: ${post.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating post ${post.title}:`, error);
      }
    }
    
    console.log(`✅ Sample content added: ${createdCount} posts created`);
    
    // Verify posts were created
    const [postCount] = await db.select().from(posts);
    console.log(`📊 Total posts in database: ${postCount ? 'Available' : 'None'}`);
    
  } catch (error) {
    console.error('❌ Error adding sample content:', error);
    throw error;
  }
}

// Run the function
addSampleContent().catch((error) => {
  console.error('Critical error:', error);
  process.exit(1);
});
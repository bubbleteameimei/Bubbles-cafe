import { pool, waitForPoolInitialization } from "./db-connect";
import { log as viteLog } from "./vite";

// Create a properly typed log function for migrations
function log(message: string, error?: unknown): void {
  if (error !== undefined) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    viteLog(`${message} ${errorMessage}`);
  } else {
    viteLog(message);
  }
}

/**
 * Run database migrations to ensure all required tables exist
 * This function checks if tables exist and creates them if they don't
 */
export async function runMigrations() {
  try {
    log("[Migrations] Starting database migrations check");
    
    // Wait for the pool to be initialized before proceeding
    const poolReady = await waitForPoolInitialization(15000); // Wait up to 15 seconds
    if (!poolReady) {
      throw new Error('Database pool initialization timed out');
    }
    
    // Check existing tables
    let client;
    try {
      client = await pool.connect();
      const tablesResult = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const existingTables = tablesResult.rows.map((row: any) => row.table_name as string);
      log(`[Migrations] Found existing tables: ${existingTables.join(', ')}`);
      
      // Create missing tables based on schema definitions
      await createMissingTables(existingTables, client);
      
      // Fix isAdminPost column naming in posts table
      await fixPostsTableColumns(client);
      
      log("[Migrations] Database migrations completed successfully");
      return true;
    } finally {
      if (client) client.release();
    }
  } catch (error) {
    log("[Migrations] Error running migrations:", error);
    return false;
  }
}

async function createMissingTables(existingTables: string[], client: any) {
  // Track which tables were attempted and successfully created
  const creationAttempts: Record<string, boolean> = {};

  // Proactively create session table used by connect-pg-simple to avoid runtime DDL on startup
  try {
    if (!existingTables.includes('session')) {
      log("[Migrations] Creating session table used by session store");
      await client.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" VARCHAR NOT NULL PRIMARY KEY,
          "sess" JSON NOT NULL,
          "expire" TIMESTAMP NOT NULL
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
      `);
      log("[Migrations] session table created or already present");
      creationAttempts['session'] = true;
    } else {
      // Ensure expire index exists even if table is present
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
      `);
    }
  } catch (error) {
    log("[Migrations] Error creating session table/index:", error);
    creationAttempts['session'] = false;
  }
  
  // Create newsletter_subscriptions table if it doesn't exist
  if (!existingTables.includes('newsletter_subscriptions')) {
    try {
      log("[Migrations] Creating newsletter_subscriptions table");
      await client.query(`
        CREATE TABLE newsletter_subscriptions (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'active',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      log("[Migrations] newsletter_subscriptions table created");
      creationAttempts['newsletter_subscriptions'] = true;
    } catch (error) {
      log("[Migrations] Error creating newsletter_subscriptions table:", error);
      creationAttempts['newsletter_subscriptions'] = false;
    }
  }
  // Create performance_metrics table if it doesn't exist
  if (!existingTables.includes('performance_metrics')) {
    try {
      log("[Migrations] Creating performance_metrics table");
      await client.query(`
        CREATE TABLE performance_metrics (
          id SERIAL PRIMARY KEY,
          metric_name TEXT NOT NULL,
          value DOUBLE PRECISION NOT NULL,
          identifier TEXT NOT NULL,
          navigation_type TEXT,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          url TEXT NOT NULL,
          user_agent TEXT
        )
      `);
      log("[Migrations] performance_metrics table created");
      creationAttempts['performance_metrics'] = true;
    } catch (error) {
      log("[Migrations] Error creating performance_metrics table:", error);
      creationAttempts['performance_metrics'] = false;
    }
  }
  
  // Create reading_streaks table if it doesn't exist (depends on users)
  if (!existingTables.includes('reading_streaks')) {
    if (!existingTables.includes('users')) {
      log("[Migrations] Skipping reading_streaks table: users table missing");
      creationAttempts['reading_streaks'] = false;
    } else {
      try {
        log("[Migrations] Creating reading_streaks table");
        await client.query(`
          CREATE TABLE reading_streaks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_read_at TIMESTAMP NOT NULL DEFAULT NOW(),
            total_reads INTEGER NOT NULL DEFAULT 0
          )
        `);
        log("[Migrations] reading_streaks table created");
        creationAttempts['reading_streaks'] = true;
      } catch (error) {
        log("[Migrations] Error creating reading_streaks table:", error);
        creationAttempts['reading_streaks'] = false;
      }
    }
  }
  
  // Create author_stats table if it doesn't exist (depends on users)
  if (!existingTables.includes('author_stats')) {
    if (!existingTables.includes('users')) {
      log("[Migrations] Skipping author_stats table: users table missing");
      creationAttempts['author_stats'] = false;
    } else {
      try {
        log("[Migrations] Creating author_stats table");
        await client.query(`
          CREATE TABLE author_stats (
            id SERIAL PRIMARY KEY,
            author_id INTEGER NOT NULL REFERENCES users(id),
            total_posts INTEGER NOT NULL DEFAULT 0,
            total_likes INTEGER NOT NULL DEFAULT 0,
            total_tips TEXT NOT NULL DEFAULT '0',
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] author_stats table created");
        creationAttempts['author_stats'] = true;
      } catch (error) {
        log("[Migrations] Error creating author_stats table:", error);
        creationAttempts['author_stats'] = false;
      }
    }
  }
  
  // Create post_likes table if it doesn't exist (depends on posts, users)
  if (!existingTables.includes('post_likes')) {
    if (!existingTables.includes('posts') || !existingTables.includes('users')) {
      log("[Migrations] Skipping post_likes table: posts/users table missing");
      creationAttempts['post_likes'] = false;
    } else {
      try {
        log("[Migrations] Creating post_likes table");
        await client.query(`
          CREATE TABLE post_likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            is_like BOOLEAN NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] post_likes table created");
        creationAttempts['post_likes'] = true;
      } catch (error) {
        log("[Migrations] Error creating post_likes table:", error);
        creationAttempts['post_likes'] = false;
      }
    }
  }
  
  // Create reading_progress table if it doesn't exist (depends on posts, users)
  if (!existingTables.includes('reading_progress')) {
    if (!existingTables.includes('posts') || !existingTables.includes('users')) {
      log("[Migrations] Skipping reading_progress table: posts/users table missing");
      creationAttempts['reading_progress'] = false;
    } else {
      try {
        log("[Migrations] Creating reading_progress table");
        await client.query(`
          CREATE TABLE reading_progress (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            progress DECIMAL NOT NULL,
            last_read_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] reading_progress table created");
        creationAttempts['reading_progress'] = true;
      } catch (error) {
        log("[Migrations] Error creating reading_progress table:", error);
        creationAttempts['reading_progress'] = false;
      }
    }
  }
  
  // Create comment_votes table if it doesn't exist (depends on comments)
  if (!existingTables.includes('comment_votes')) {
    if (!existingTables.includes('comments')) {
      log("[Migrations] Skipping comment_votes table: comments table missing");
      creationAttempts['comment_votes'] = false;
    } else {
      try {
        log("[Migrations] Creating comment_votes table");
        await client.query(`
          CREATE TABLE comment_votes (
            id SERIAL PRIMARY KEY,
            comment_id INTEGER NOT NULL REFERENCES comments(id),
            user_id TEXT NOT NULL,
            is_upvote BOOLEAN NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE(comment_id, user_id)
          )
        `);
        log("[Migrations] comment_votes table created");
        creationAttempts['comment_votes'] = true;
      } catch (error) {
        log("[Migrations] Error creating comment_votes table:", error);
        creationAttempts['comment_votes'] = false;
      }
    }
  }
  
  // Create comment_reactions table if it doesn't exist (depends on comments)
  if (!existingTables.includes('comment_reactions')) {
    if (!existingTables.includes('comments')) {
      log("[Migrations] Skipping comment_reactions table: comments table missing");
      creationAttempts['comment_reactions'] = false;
    } else {
      try {
        log("[Migrations] Creating comment_reactions table");
        await client.query(`
          CREATE TABLE comment_reactions (
            id SERIAL PRIMARY KEY,
            comment_id INTEGER NOT NULL REFERENCES comments(id),
            user_id TEXT NOT NULL,
            emoji TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE(comment_id, user_id, emoji)
          )
        `);
        log("[Migrations] comment_reactions table created");
        creationAttempts['comment_reactions'] = true;
      } catch (error) {
        log("[Migrations] Error creating comment_reactions table:", error);
        creationAttempts['comment_reactions'] = false;
      }
    }
  }
  
  // Create user_feedback table if it doesn't exist (depends on users for FK)
  if (!existingTables.includes('user_feedback')) {
    if (!existingTables.includes('users')) {
      log("[Migrations] Skipping user_feedback table: users table missing");
      creationAttempts['user_feedback'] = false;
    } else {
      try {
        log("[Migrations] Creating user_feedback table");
        await client.query(`
          CREATE TABLE user_feedback (
            id SERIAL PRIMARY KEY,
            type TEXT NOT NULL DEFAULT 'general',
            content TEXT NOT NULL,
            page TEXT DEFAULT 'unknown',
            status TEXT NOT NULL DEFAULT 'pending',
            user_id INTEGER REFERENCES users(id),
            browser TEXT DEFAULT 'unknown',
            operating_system TEXT DEFAULT 'unknown',
            screen_resolution TEXT DEFAULT 'unknown',
            user_agent TEXT DEFAULT 'unknown', 
            category TEXT DEFAULT 'general',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] user_feedback table created");
        creationAttempts['user_feedback'] = true;
      } catch (error) {
        log("[Migrations] Error creating user_feedback table:", error);
        creationAttempts['user_feedback'] = false;
      }
    }
  }
  
  // Create analytics table if it doesn't exist (depends on posts)
  if (!existingTables.includes('analytics')) {
    if (!existingTables.includes('posts')) {
      log("[Migrations] Skipping analytics table: posts table missing");
      creationAttempts['analytics'] = false;
    } else {
      try {
        log("[Migrations] Creating analytics table");
        await client.query(`
          CREATE TABLE analytics (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            page_views INTEGER NOT NULL DEFAULT 0,
            unique_visitors INTEGER NOT NULL DEFAULT 0,
            average_read_time DOUBLE PRECISION NOT NULL DEFAULT 0,
            bounce_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
            device_stats JSONB NOT NULL DEFAULT '{}',
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] analytics table created");
        creationAttempts['analytics'] = true;
      } catch (error) {
        log("[Migrations] Error creating analytics table:", error);
        creationAttempts['analytics'] = false;
      }
    }
  }
  
  // Create user_notifications table if it doesn't exist (depends on users)
  if (!existingTables.includes('user_notifications')) {
    if (!existingTables.includes('users')) {
      log("[Migrations] Skipping user_notifications table: users table missing");
      creationAttempts['user_notifications'] = false;
    } else {
      try {
        log("[Migrations] Creating user_notifications table");
        await client.query(`
          CREATE TABLE user_notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN NOT NULL DEFAULT false,
            data JSONB DEFAULT '{}',
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] user_notifications table created");
        creationAttempts['user_notifications'] = true;
      } catch (error) {
        log("[Migrations] Error creating user_notifications table:", error);
        creationAttempts['user_notifications'] = false;
      }
    }
  }

  // Create tag_relations table if it doesn't exist (depends on posts)
  if (!existingTables.includes('tag_relations')) {
    if (!existingTables.includes('posts')) {
      log("[Migrations] Skipping tag_relations table: posts table missing");
      creationAttempts['tag_relations'] = false;
    } else {
      try {
        log("[Migrations] Creating tag_relations table");
        await client.query(`
          CREATE TABLE tag_relations (
            id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL REFERENCES posts(id),
            tag_name TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        log("[Migrations] tag_relations table created");
        creationAttempts['tag_relations'] = true;
      } catch (error) {
        log("[Migrations] Error creating tag_relations table:", error);
        creationAttempts['tag_relations'] = false;
      }
    }
  }

  // Create user_preferences table if it doesn't exist (depends on users)
  if (!existingTables.includes('user_preferences')) {
    if (!existingTables.includes('users')) {
      log("[Migrations] Skipping user_preferences table: users table missing");
      creationAttempts['user_preferences'] = false;
    } else {
      try {
        log("[Migrations] Creating user_preferences table");
        await client.query(`
          CREATE TABLE user_preferences (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            preference_name TEXT NOT NULL,
            preference_value TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, preference_name)
          )
        `);
        log("[Migrations] user_preferences table created");
        creationAttempts['user_preferences'] = true;
      } catch (error) {
        log("[Migrations] Error creating user_preferences table:", error);
        creationAttempts['user_preferences'] = false;
      }
    }
  }
  
  // Log migration summary
  const successful = Object.entries(creationAttempts).filter(([_, success]) => success).map(([table]) => table);
  const failed = Object.entries(creationAttempts).filter(([_, success]) => !success).map(([table]) => table);
  
  if (successful.length > 0) {
    log(`[Migrations] Successfully created tables: ${successful.join(', ')}`);
  }
  
  if (failed.length > 0) {
    log(`[Migrations] Failed to create tables: ${failed.join(', ')}`);
  }
  
  // Add more tables as needed from the schema definition
  // This implements the most critical tables first
}

/**
 * Fix the isAdminPost column in the posts table
 * This function checks if is_admin_post column exists and renames it to isAdminPost
 * or creates the isAdminPost column if neither exists
 */
async function fixPostsTableColumns(client: any) {
  try {
    log("[Migrations] Checking posts table columns for isAdminPost naming issue");

    // Ensure posts table exists before attempting column operations
    const postsTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'posts'
      ) AS exists
    `;
    const existsResult = await client.query(postsTableExistsQuery);
    const postsTableExists = !!existsResult.rows?.[0]?.exists;
    if (!postsTableExists) {
      log("[Migrations] Posts table does not exist. Skipping isAdminPost column fix.");
      return false;
    }
    
    // First check if is_admin_post column exists
    const checkOldColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'is_admin_post'
    `;
    
    const oldColumnResult = await client.query(checkOldColumnQuery);
    const oldColumnExists = oldColumnResult.rows.length > 0;
    
    // Then check if isAdminPost column exists
    const checkNewColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'isAdminPost'
    `;
    
    const newColumnResult = await client.query(checkNewColumnQuery);
    const newColumnExists = newColumnResult.rows.length > 0;
    
    if (oldColumnExists && !newColumnExists) {
      // Only is_admin_post exists, rename it to isAdminPost
      log("[Migrations] Renaming is_admin_post column to isAdminPost");
      await client.query(`ALTER TABLE posts RENAME COLUMN is_admin_post TO "isAdminPost"`);
      log("[Migrations] Successfully renamed is_admin_post to isAdminPost");
    } else if (oldColumnExists && newColumnExists) {
      // Both columns exist, migrate data and drop is_admin_post
      log("[Migrations] Both columns exist. Migrating data and dropping is_admin_post");
      await client.query(`
        UPDATE posts 
        SET "isAdminPost" = is_admin_post 
        WHERE "isAdminPost" IS NULL
      `);
      
      await client.query(`ALTER TABLE posts DROP COLUMN is_admin_post`);
      log("[Migrations] Successfully migrated data and dropped is_admin_post column");
    } else if (!oldColumnExists && !newColumnExists) {
      // Neither column exists, create isAdminPost
      log("[Migrations] Creating isAdminPost column in posts table");
      await client.query(`ALTER TABLE posts ADD COLUMN "isAdminPost" BOOLEAN DEFAULT FALSE`);
      log("[Migrations] Successfully created isAdminPost column");
    } else {
      // Only isAdminPost exists, which is what we want
      log("[Migrations] Column isAdminPost already exists. No changes needed.");
    }

    // Ensure baseline columns exist
    const checkBaselineLikes = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'baseline_likes'
    `;
    const checkBaselineDislikes = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'baseline_dislikes'
    `;
    const blRes = await client.query(checkBaselineLikes);
    const bdRes = await client.query(checkBaselineDislikes);
    const blExists = blRes.rows.length > 0;
    const bdExists = bdRes.rows.length > 0;

    if (!blExists) {
      log("[Migrations] Adding baseline_likes column");
      await client.query(`ALTER TABLE posts ADD COLUMN baseline_likes INTEGER NOT NULL DEFAULT 0`);
    }
    if (!bdExists) {
      log("[Migrations] Adding baseline_dislikes column");
      await client.query(`ALTER TABLE posts ADD COLUMN baseline_dislikes INTEGER NOT NULL DEFAULT 0`);
    }

    // Initialize baseline values once, for rows that are still zero
    // Baseline logic mirrors client deterministic generation but stored permanently
    const rowsRes = await client.query(`SELECT id, slug FROM posts`);
    const rows = rowsRes.rows || [];

    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    const hashSlug = (slug: string): number => {
      let hash = 0;
      for (let i = 0; i < slug.length; i++) {
        hash = (hash << 5) - hash + slug.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    for (const row of rows) {
      const id = Number(row.id);
      const slug = String(row.slug || '');
      const seedNumber = slug ? hashSlug(slug) : id;
      const seed = seedNumber * 12345;
      const likesBase = Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80; // 80–200
      const dislikesBase = Math.floor(seededRandom(seed + 999) * (13 - 2 + 1)) + 2; // 2–13

      await client.query(
        `UPDATE posts SET baseline_likes = CASE WHEN baseline_likes = 0 THEN $1 ELSE baseline_likes END,
                          baseline_dislikes = CASE WHEN baseline_dislikes = 0 THEN $2 ELSE baseline_dislikes END
         WHERE id = $3`,
        [likesBase, dislikesBase, id]
      );
    }

    log("[Migrations] Baseline columns verified and initialized where needed.");
    
    return true;
  } catch (error) {
    log("[Migrations] Error fixing posts table columns:", error);
    return false;
  }
}
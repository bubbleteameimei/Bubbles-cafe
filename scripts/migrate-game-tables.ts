import { db } from "../server/db";
import { gameScenes, gameItems, gameDialogs, gamePuzzles, gameSaves, gameProgress, gameStats } from "../shared/schema";
import { sql } from "drizzle-orm";

// Function to create tables using Drizzle client without drizzle-kit
async function createGameTables() {
  console.log("Starting game tables migration...");
  
  try {
    // First, check if game_scenes exists
    const checkResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_scenes'
      );
    `);
    
    const tableExists = checkResult.rows[0]?.exists === true;
    
    if (tableExists) {
      console.log("Game tables already exist, skipping creation");
      return;
    }
    
    // Create each of the game-related tables
    console.log("Creating game_scenes table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_scenes" (
        "id" SERIAL PRIMARY KEY,
        "scene_id" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "background_image" TEXT,
        "type" TEXT,
        "data" JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_items table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_items" (
        "id" SERIAL PRIMARY KEY,
        "item_id" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "type" TEXT,
        "data" JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_dialogs table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_dialogs" (
        "id" SERIAL PRIMARY KEY,
        "dialog_id" TEXT NOT NULL UNIQUE,
        "character" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_puzzles table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_puzzles" (
        "id" SERIAL PRIMARY KEY,
        "puzzle_id" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "data" JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_saves table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_saves" (
        "id" SERIAL PRIMARY KEY,
        "save_id" TEXT NOT NULL UNIQUE,
        "user_id" INTEGER,
        "name" TEXT NOT NULL,
        "game_state" JSONB NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_progress table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_progress" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "current_scene" TEXT,
        "inventory" JSONB,
        "flags" JSONB,
        "game_time" INTEGER DEFAULT 0,
        "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log("Creating game_stats table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "game_stats" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "games_started" INTEGER DEFAULT 0,
        "games_completed" INTEGER DEFAULT 0,
        "total_playtime" INTEGER DEFAULT 0,
        "last_played" TIMESTAMP
      )
    `);
    
    console.log("All game tables created successfully!");
    
    // Add some default game scenes
    console.log("Adding default game scenes...");
    
    await db.insert(gameScenes).values([
      {
        sceneId: 'village_entrance',
        name: "Village Entrance",
        description: "A dilapidated wooden sign reading 'Eden's Hollow' creaks in the wind.",
        backgroundImage: "/assets/eden/scenes/village_entrance.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Enter the village" }
          ],
          items: [],
          characters: []
        }
      },
      {
        sceneId: 'village_square',
        name: "Village Square",
        description: "A once-bustling village square now stands eerily empty.",
        backgroundImage: "/assets/eden/scenes/village_square.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_entrance", label: "Return to entrance" },
            { target: "abandoned_church", label: "Visit the church" },
            { target: "old_tavern", label: "Enter the tavern" }
          ],
          items: [],
          characters: []
        }
      },
      {
        sceneId: 'abandoned_church',
        name: "Abandoned Church",
        description: "The church's wooden pews are covered in a thick layer of dust. Faded murals depict strange rituals.",
        backgroundImage: "/assets/eden/scenes/abandoned_church.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Return to the square" },
            { target: "church_altar", label: "Approach the altar" }
          ],
          items: [
            { itemId: "dusty_bible", label: "Dusty Bible", interactable: true }
          ],
          characters: []
        }
      },
      {
        sceneId: 'old_tavern',
        name: "Old Tavern",
        description: "Broken bottles and overturned chairs litter the floor. A chill draft blows through the shattered windows.",
        backgroundImage: "/assets/eden/scenes/old_tavern.jpg",
        type: "exploration",
        data: {
          exits: [
            { target: "village_square", label: "Exit to the square" },
            { target: "tavern_cellar", label: "Check the cellar" }
          ],
          items: [
            { itemId: "old_photograph", label: "Old Photograph", interactable: true }
          ],
          characters: []
        }
      }
    ]);
    
    console.log("Default game scenes added successfully!");
    
  } catch (error) {
    console.error("Error during game tables migration:", error);
    throw error;
  }
}

// Execute the migration
createGameTables()
  .then(() => {
    console.log("Game tables migration completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Game tables migration failed:", error);
    process.exit(1);
  });
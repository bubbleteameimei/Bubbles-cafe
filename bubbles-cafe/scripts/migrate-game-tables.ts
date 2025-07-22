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
    
    // Check if we have data in game_scenes
    let hasData = false;
    if (tableExists) {
      const dataResult = await db.execute(sql`
        SELECT COUNT(*) FROM game_scenes;
      `);
      
      hasData = parseInt(dataResult.rows[0]?.count, 10) > 0;
      
      if (hasData) {
        console.log("Game tables already exist with data, skipping");
        return;
      }
      
      console.log("Game tables exist but have no data, will add default game content");
    } else {
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
      
      // Add default game items
      console.log("Adding default game items...");
      
      await db.insert(gameItems).values([
        {
          itemId: "dusty_bible",
          name: "Dusty Bible",
          description: "An ancient bible with strange markings in the margins. Some pages appear to be missing.",
          image: "/assets/eden/items/dusty_bible.jpg",
          type: "readable",
          data: {
            readable: true,
            content: "...and the town shall know darkness when the seal is broken. Seven marks upon the land shall herald their return...",
            canTake: true,
            useEffects: {
              revealClue: "bible_prophecy"
            }
          }
        },
        {
          itemId: "old_photograph",
          name: "Old Photograph",
          description: "A faded photograph showing a group of villagers standing in front of the church. Their faces are oddly blurred.",
          image: "/assets/eden/items/old_photograph.jpg",
          type: "clue",
          data: {
            examinable: true,
            canTake: true,
            examineText: "Upon closer inspection, you notice a date scrawled on the back: 'May 17, 1924 - The Day of Ascension'",
            useEffects: {
              revealClue: "village_history"
            }
          }
        },
        {
          itemId: "rusty_key",
          name: "Rusty Key",
          description: "A heavy iron key covered in rust. It looks very old.",
          image: "/assets/eden/items/rusty_key.jpg",
          type: "key",
          data: {
            canTake: true,
            useEffects: {
              unlocks: "cellar_chest"
            }
          }
        }
      ]);
      
      console.log("Default game items added successfully!");
      
      // Add default game dialogs
      console.log("Adding default game dialogs...");
      
      await db.insert(gameDialogs).values([
        {
          dialogId: "intro_narration",
          character: "Narrator",
          content: "The road to Eden's Hollow stretches before you, winding through mist-shrouded pines. Your car broke down three miles back, and darkness is falling fast.",
          data: {
            type: "narration",
            triggers: {
              onGameStart: true
            },
            effects: {
              setFlag: "game_started"
            }
          }
        },
        {
          dialogId: "church_whispers",
          character: "Whispers",
          content: "Join us... below... where the true church awaits...",
          data: {
            type: "ambient",
            triggers: {
              locationId: "abandoned_church",
              requires: {
                itemsExamined: ["dusty_bible"]
              }
            },
            effects: {
              revealLocation: "church_crypt"
            }
          }
        },
        {
          dialogId: "tavern_encounter",
          character: "Old Man",
          content: "You shouldn't be here, stranger. No one comes to Eden's Hollow anymore. Not since that night...",
          data: {
            type: "npc",
            triggers: {
              locationId: "old_tavern",
              firstVisit: true
            },
            responses: [
              {
                text: "What night?",
                leadsTo: "tavern_encounter_response1"
              },
              {
                text: "Who are you?",
                leadsTo: "tavern_encounter_response2"
              }
            ]
          }
        }
      ]);
      
      console.log("Default game dialogs added successfully!");
      
      // Add default game puzzles
      console.log("Adding default game puzzles...");
      
      await db.insert(gamePuzzles).values([
        {
          puzzleId: "church_symbols",
          name: "Church Altar Symbols",
          description: "A series of strange symbols are carved into the altar. They seem to form a pattern.",
          data: {
            type: "sequence",
            solution: ["moon", "star", "eye", "hand", "crown"],
            hints: [
              "Look for the natural order of ascension.",
              "From earth to the heavens above."
            ],
            reward: {
              itemId: "ornate_key",
              message: "As you press the symbols in the correct order, a small compartment opens in the altar, revealing an ornate key."
            }
          }
        },
        {
          puzzleId: "tavern_lock",
          name: "Tavern Cellar Lock",
          description: "A combination lock secures the cellar door. It requires a 4-digit code.",
          data: {
            type: "combination",
            solution: "1924",
            hints: [
              "The year of an important event in the town's history.",
              "Check the back of the old photograph."
            ],
            reward: {
              unlocksLocation: "tavern_cellar",
              message: "The lock clicks open, allowing access to the cellar below."
            }
          }
        },
        {
          puzzleId: "music_box",
          name: "Mysterious Music Box",
          description: "A dusty music box with five small levers. It seems to be missing its winding key.",
          data: {
            type: "item_use",
            requiredItem: "small_key",
            solution: "wind and play the correct tune",
            hints: [
              "The tune of an old nursery rhyme mentioned in the diary.",
              "The pattern matches the notes in 'Ring Around the Rosie'"
            ],
            reward: {
              revealClue: "basement_entrance",
              message: "As the haunting melody plays, you notice a section of the wall sliding open, revealing a hidden passage."
            }
          }
        }
      ]);
      
      console.log("Default game puzzles added successfully!");
      } // close inner try
    } // close else
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
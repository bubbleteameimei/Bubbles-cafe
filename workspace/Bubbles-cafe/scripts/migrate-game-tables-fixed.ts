import { db } from "../server/db";
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
      
      console.log("Game tables exist but have no data, will add default data");
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
    }
    
    // Add default game scenes if no data exists
    if (!hasData) {
      // Add some default game scenes
      console.log("Adding default game scenes...");
      
      await db.execute(sql`
        INSERT INTO game_scenes (scene_id, name, description, background_image, type, data)
        VALUES 
        (
          'village_entrance', 
          'Village Entrance', 
          'A dilapidated wooden sign reading ''Eden''s Hollow'' creaks in the wind.', 
          '/assets/eden/scenes/village_entrance.jpg', 
          'exploration', 
          '{"exits": [{"target": "village_square", "label": "Enter the village"}], "items": [], "characters": []}'
        ),
        (
          'village_square', 
          'Village Square', 
          'A once-bustling village square now stands eerily empty.', 
          '/assets/eden/scenes/village_square.jpg', 
          'exploration', 
          '{"exits": [{"target": "village_entrance", "label": "Return to entrance"}, {"target": "abandoned_church", "label": "Visit the church"}, {"target": "old_tavern", "label": "Enter the tavern"}], "items": [], "characters": []}'
        ),
        (
          'abandoned_church', 
          'Abandoned Church', 
          'The church''s wooden pews are covered in a thick layer of dust. Faded murals depict strange rituals.', 
          '/assets/eden/scenes/abandoned_church.jpg', 
          'exploration', 
          '{"exits": [{"target": "village_square", "label": "Return to the square"}, {"target": "church_altar", "label": "Approach the altar"}], "items": [{"itemId": "dusty_bible", "label": "Dusty Bible", "interactable": true}], "characters": []}'
        ),
        (
          'old_tavern', 
          'Old Tavern', 
          'Broken bottles and overturned chairs litter the floor. A chill draft blows through the shattered windows.', 
          '/assets/eden/scenes/old_tavern.jpg', 
          'exploration', 
          '{"exits": [{"target": "village_square", "label": "Exit to the square"}, {"target": "tavern_cellar", "label": "Check the cellar"}], "items": [{"itemId": "old_photograph", "label": "Old Photograph", "interactable": true}], "characters": []}'
        )
      `);
      
      console.log("Default game scenes added successfully!");
      
      // Add default game items
      console.log("Adding default game items...");
      
      await db.execute(sql`
        INSERT INTO game_items (item_id, name, description, image, type, data)
        VALUES 
        (
          'dusty_bible', 
          'Dusty Bible', 
          'An ancient bible with strange markings in the margins. Some pages appear to be missing.', 
          '/assets/eden/items/dusty_bible.jpg', 
          'readable', 
          '{"readable": true, "content": "...and the town shall know darkness when the seal is broken. Seven marks upon the land shall herald their return...", "canTake": true, "useEffects": {"revealClue": "bible_prophecy"}}'
        ),
        (
          'old_photograph', 
          'Old Photograph', 
          'A faded photograph showing a group of villagers standing in front of the church. Their faces are oddly blurred.', 
          '/assets/eden/items/old_photograph.jpg', 
          'clue', 
          '{"examinable": true, "canTake": true, "examineText": "Upon closer inspection, you notice a date scrawled on the back: ''May 17, 1924 - The Day of Ascension''", "useEffects": {"revealClue": "village_history"}}'
        ),
        (
          'rusty_key', 
          'Rusty Key', 
          'A heavy iron key covered in rust. It looks very old.', 
          '/assets/eden/items/rusty_key.jpg', 
          'key', 
          '{"canTake": true, "useEffects": {"unlocks": "cellar_chest"}}'
        )
      `);
      
      console.log("Default game items added successfully!");
      
      // Add default game dialogs
      console.log("Adding default game dialogs...");
      
      await db.execute(sql`
        INSERT INTO game_dialogs (dialog_id, character, content, data)
        VALUES 
        (
          'intro_narration', 
          'Narrator', 
          'The road to Eden''s Hollow stretches before you, winding through mist-shrouded pines. Your car broke down three miles back, and darkness is falling fast.', 
          '{"type": "narration", "triggers": {"onGameStart": true}, "effects": {"setFlag": "game_started"}}'
        ),
        (
          'church_whispers', 
          'Whispers', 
          'Join us... below... where the true church awaits...', 
          '{"type": "ambient", "triggers": {"locationId": "abandoned_church", "requires": {"itemsExamined": ["dusty_bible"]}}, "effects": {"revealLocation": "church_crypt"}}'
        ),
        (
          'tavern_encounter', 
          'Old Man', 
          'You shouldn''t be here, stranger. No one comes to Eden''s Hollow anymore. Not since that night...', 
          '{"type": "npc", "triggers": {"locationId": "old_tavern", "firstVisit": true}, "responses": [{"text": "What night?", "leadsTo": "tavern_encounter_response1"}, {"text": "Who are you?", "leadsTo": "tavern_encounter_response2"}]}'
        )
      `);
      
      console.log("Default game dialogs added successfully!");
      
      // Add default game puzzles
      console.log("Adding default game puzzles...");
      
      await db.execute(sql`
        INSERT INTO game_puzzles (puzzle_id, name, description, data)
        VALUES 
        (
          'church_symbols', 
          'Church Altar Symbols', 
          'A series of strange symbols are carved into the altar. They seem to form a pattern.', 
          '{"type": "sequence", "solution": ["moon", "star", "eye", "hand", "crown"], "hints": ["Look for the natural order of ascension.", "From earth to the heavens above."], "reward": {"itemId": "ornate_key", "message": "As you press the symbols in the correct order, a small compartment opens in the altar, revealing an ornate key."}}'
        ),
        (
          'tavern_lock', 
          'Tavern Cellar Lock', 
          'A combination lock secures the cellar door. It requires a 4-digit code.', 
          '{"type": "combination", "solution": "1924", "hints": ["The year of an important event in the town''s history.", "Check the back of the old photograph."], "reward": {"unlocksLocation": "tavern_cellar", "message": "The lock clicks open, allowing access to the cellar below."}}'
        ),
        (
          'music_box', 
          'Mysterious Music Box', 
          'A dusty music box with five small levers. It seems to be missing its winding key.', 
          '{"type": "item_use", "requiredItem": "small_key", "solution": "wind and play the correct tune", "hints": ["The tune of an old nursery rhyme mentioned in the diary.", "The pattern matches the notes in ''Ring Around the Rosie''"], "reward": {"revealClue": "basement_entrance", "message": "As the haunting melody plays, you notice a section of the wall sliding open, revealing a hidden passage."}}'
        )
      `);
      
      console.log("Default game puzzles added successfully!");
    }
    
    console.log("Game tables migration completed successfully!");
  } catch (error) {
    console.error("Error during game tables migration:", error);
    throw error;
  }
}

// Execute the migration
createGameTables()
  .then(() => {
    console.log("Game tables migration completed!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Game tables migration failed:", error);
    process.exit(1);
  });
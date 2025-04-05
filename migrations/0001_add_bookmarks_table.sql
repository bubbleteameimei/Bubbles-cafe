-- Add bookmarks table
CREATE TABLE IF NOT EXISTS "bookmarks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "post_id" INTEGER NOT NULL REFERENCES "posts"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "notes" TEXT,
  "last_position" DECIMAL DEFAULT '0' NOT NULL,
  "tags" TEXT[],
  CONSTRAINT "bookmarks_user_id_post_id_unique" UNIQUE ("user_id", "post_id")
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "bookmarks_user_id_idx" ON "bookmarks" ("user_id");
CREATE INDEX IF NOT EXISTS "bookmarks_post_id_idx" ON "bookmarks" ("post_id");
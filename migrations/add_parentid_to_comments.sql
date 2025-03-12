-- Add parent_id column to comments table
ALTER TABLE comments ADD COLUMN parent_id INTEGER;

-- Add foreign key constraint referencing the comments table itself (self-reference)
ALTER TABLE comments ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES comments(id);
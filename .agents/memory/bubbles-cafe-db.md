---
name: Bubbles Cafe DB Migration
description: How to run DB migrations on the Neon database for this project
---

# Bubbles Cafe DB Migration

**Why:** The project uses Neon PostgreSQL. `drizzle-kit push` via npm script doesn't work because the drizzle-kit binary isn't reliably installed in node_modules/.bin on Replit. Must run migrations manually.

## Migration approach
Run migration SQL files via a tsx script that imports `pool` from `server/db`:

```typescript
// scripts/run-migrations.ts
import 'dotenv/config';
import { pool } from '../server/db';
import fs from 'fs';
import path from 'path';

const migrations = ['0000_...sql', '0001_...sql', ...];
// Split by '--> statement-breakpoint', ignore "already exists" errors
```

## Known schema discrepancies (Drizzle schema vs migration SQL)
- `posts.baseline_likes` and `posts.baseline_dislikes` — in Drizzle schema but NOT in migration SQL → must `ALTER TABLE posts ADD COLUMN IF NOT EXISTS baseline_likes integer DEFAULT 0`
- `users.isAdmin` property → maps to `is_admin` DB column (Drizzle: `boolean("is_admin")`) — migration creates `is_admin` (snake_case)
- Extra columns added accidentally (`isAdmin` camelCase, `bio`, `avatar`) can be left since Drizzle ignores unknown columns

## DB tables present
achievements, activity_logs, admin_notifications, analytics, author_stats, author_tips, bookmarks, challenge_entries, comment_reactions, comment_replies, comment_votes, comments, contact_messages, content_protection, featured_authors, newsletter_subscriptions, performance_metrics, post_likes, posts, reading_progress, reading_streaks, reported_content, secret_progress, session, sessions, site_settings, tag_relations, user_achievements, user_feedback, user_notifications, user_preferences, users, webhooks, writer_streaks, writing_challenges

**How to apply:** If schema changes are needed, add ALTER TABLE statements to a new migration file, then run via tsx from workspace root.

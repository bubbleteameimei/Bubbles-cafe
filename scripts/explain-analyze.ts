#!/usr/bin/env tsx

/**
 * EXPLAIN ANALYZE helper
 *
 * Runs EXPLAIN ANALYZE on a set of representative queries used by the app
 * and prints their execution plans to stdout.
 *
 * Usage:
 *   tsx scripts/explain-analyze.ts
 */

import { initializeDatabaseConnection } from "./connect-db";
import type { Pool } from "pg";

type QueryCase = {
  name: string;
  text: string;
  values?: any[];
};

function printHeader(title: string) {
  const line = "-".repeat(Math.max(24, title.length + 10));
  console.log(`\n${line}\nEXPLAIN ANALYZE: ${title}\n${line}`);
}

function printPlan(rows: any[]) {
  if (!rows || rows.length === 0) {
    console.log("No plan rows returned.");
    return;
  }
  // Postgres returns one row per line of the plan under "QUERY PLAN"
  const lines = rows.map((r) => r["QUERY PLAN"] ?? r["query_plan"] ?? JSON.stringify(r));
  console.log(lines.join("\n"));
}

async function runExplain(pool: Pool, q: QueryCase) {
  printHeader(q.name);
  try {
    const res = await pool.query(`EXPLAIN ANALYZE ${q.text}`, q.values || []);
    printPlan(res.rows);
  } catch (err: any) {
    console.error(`Failed: ${q.name}\n${err?.message || String(err)}`);
  }
}

async function main() {
  const { pool } = await initializeDatabaseConnection();

  // Representative queries derived from storage and routes
  const queries: QueryCase[] = [
    {
      name: "Posts list (public, newest first, paginated)",
      text: `
        SELECT id, title, slug, created_at
        FROM posts
        WHERE is_secret = false
        ORDER BY created_at DESC
        LIMIT 21 OFFSET 0
      `
    },
    {
      name: "Posts by themeCategory column (exact match, newest first)",
      text: `
        SELECT id, title, slug, created_at
        FROM posts
        WHERE theme_category = $1
        ORDER BY created_at DESC
        LIMIT 21
      `,
      values: ["mystery"]
    },
    {
      name: "Posts by themeCategory in metadata (jsonb access, newest first)",
      text: `
        SELECT id, title, slug, created_at
        FROM posts
        WHERE (metadata->>'themeCategory')::text = $1
        ORDER BY created_at DESC
        LIMIT 21
      `,
      values: ["mystery"]
    },
    {
      name: "Community posts count via metadata (boolean flag)",
      text: `
        SELECT COUNT(*) 
        FROM posts
        WHERE (metadata->>'isCommunityPost')::boolean = true
      `
    },
    {
      name: "Single post by slug (indexed unique lookup)",
      text: `
        SELECT id, title, slug, created_at
        FROM posts
        WHERE slug = $1
        LIMIT 1
      `,
      values: ["example-slug"]
    },
    {
      name: "Comments by post (newest first, limited)",
      text: `
        SELECT id, post_id, created_at
        FROM comments
        WHERE post_id = $1
        ORDER BY created_at DESC
        LIMIT 100
      `,
      values: [1]
    },
    {
      name: "Post likes count (filtered by is_like=true)",
      text: `
        SELECT COUNT(*) 
        FROM post_likes
        WHERE post_id = $1 AND is_like = true
      `,
      values: [1]
    },
    {
      name: "WordPress ID mapping (jsonb int cast)",
      text: `
        SELECT id
        FROM posts
        WHERE (metadata->>'wordpressId')::int = $1
        LIMIT 1
      `,
      values: [12345]
    },
    {
      name: "Trending posts (likes_count + recency bias)",
      text: `
        SELECT id, title, slug, excerpt
        FROM posts
        ORDER BY likes_count DESC NULLS LAST, created_at DESC
        LIMIT 10
      `
    },
    {
      name: "Analytics join (left join, sort by page_views)",
      text: `
        SELECT p.id, p.title, p.slug, a.page_views
        FROM posts p
        LEFT JOIN analytics a ON a.post_id = p.id
        ORDER BY a.page_views DESC NULLS LAST, p.created_at DESC
        LIMIT 5
      `
    }
  ];

  for (const q of queries) {
    await runExplain(pool as any, q);
  }

  console.log("\nDone. Review the plans above to identify possible index or query plan improvements.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Explain analyze script failed:", err);
  process.exit(1);
});
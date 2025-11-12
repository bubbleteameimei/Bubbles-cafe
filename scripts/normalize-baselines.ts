#!/usr/bin/env tsx

/**
 * Normalize baseline likes/dislikes for all posts.
 * - Ensures baseline_likes within [100..200] and baseline_dislikes within [3..7].
 * - Deterministically recomputes baselines from slug (fallback to id) when out-of-range or missing.
 * - By default only updates posts with missing or out-of-range baselines.
 *
 * Flags:
 *   --force            Recompute baselines for ALL posts, regardless of current values.
 *   --fixed L D        Set fixed baselines (likes=L, dislikes=D) for ALL targeted posts (combine with --force if desired).
 *   --dry-run          Print what would be updated without writing changes.
 *
 * Examples:
 *   tsx scripts/normalize-baselines.ts
 *   tsx scripts/normalize-baselines.ts --force
 *   tsx scripts/normalize-baselines.ts --fixed 180 5
 *   tsx scripts/normalize-baselines.ts --dry-run
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
function seededRandom(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');
  const fixedIdx = args.indexOf('--fixed');

  let fixedLikes: number | null = null;
  let fixedDislikes: number | null = null;

  if (fixedIdx !== -1) {
    const likesArg = Number(args[fixedIdx + 1]);
    const dislikesArg = Number(args[fixedIdx + 2]);
    if (!Number.isFinite(likesArg) || !Number.isFinite(dislikesArg)) {
      console.error('Invalid --fixed usage. Provide numeric likes and dislikes, e.g., --fixed 180 5');
      process.exit(1);
    }
    fixedLikes = likesArg;
    fixedDislikes = dislikesArg;
  }

  console.log('🔧 Normalizing baselines...', { force, fixedLikes, fixedDislikes, dryRun });

  // Select all or only problem rows depending on flags
  const whereClause = force
    ? sql`TRUE`
    : sql`
        COALESCE(baseline_likes, 0) = 0 OR
        COALESCE(baseline_dislikes, 0) = 0 OR
        baseline_likes < 100 OR baseline_likes > 200 OR
        baseline_dislikes < 3 OR baseline_dislikes > 7
      `;

  const result = await db.execute(sql`
    SELECT id,
           slug,
           baseline_likes  AS "baselineLikes",
           baseline_dislikes AS "baselineDislikes"
    FROM posts
    WHERE ${whereClause}
  `);

  const rows = (result as any).rows || [];
  console.log(`📄 Found ${rows.length} posts to normalize`);

  let updated = 0;
  for (const row of rows) {
    const id = Number(row.id);
    const slug = String(row.slug || `post-${id}`);
    const currentLikes = Number(row.baselineLikes ?? 0);
    const currentDislikes = Number(row.baselineDislikes ?? 0);

    // Compute target baselines
    let likesBase: number;
    let dislikesBase: number;

    if (fixedLikes !== null && fixedDislikes !== null) {
      likesBase = fixedLikes!;
      dislikesBase = fixedDislikes!;
    } else {
      const seedNum = slug ? hashSeed(slug) : id;
      const seed = seedNum * 12345;
      likesBase = Math.floor(seededRandom(seed) * (200 - 100 + 1)) + 100; // 100–200
      dislikesBase = Math.floor(seededRandom(seed + 999) * (7 - 3 + 1)) + 3; // 3–7
    }

    // Skip when already within bounds and equal unless --force
    const inRange =
      currentLikes >= 100 && currentLikes <= 200 &&
      currentDislikes >= 3 && currentDislikes <= 7;

    if (!force && inRange) {
      continue;
    }

    if (dryRun) {
      console.log(`DRY: id=${id} slug=${slug} ${currentLikes}/${currentDislikes} -> ${likesBase}/${dislikesBase}`);
      updated++;
      continue;
    }

    await db.execute(sql`
      UPDATE posts
      SET baseline_likes = ${likesBase}, baseline_dislikes = ${dislikesBase}
      WHERE id = ${id}
    `);
    updated++;

    if (updated % 50 === 0) {
      console.log(`...normalized ${updated} posts so far`);
    }
  }

  console.log(`✅ Baseline normalization completed. Updated ${updated} posts.`);
}

main().catch((err) => {
  console.error('❌ Baseline normalization failed:', err);
  process.exit(1);
});
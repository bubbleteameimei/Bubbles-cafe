#!/usr/bin/env tsx

/**
 * Initialize persistent baseline likes/dislikes for posts.
 * - Sets baselineLikes to 100–200 and baselineDislikes to 3–7 deterministically per slug.
 * - Only updates posts where baseline values are zero unless --force is supplied.
 * - Optional fixed baseline via --fixed <likes> <dislikes>
 *
 * Usage:
 *  tsx scripts/initialize-baselines.ts
 *  tsx scripts/initialize-baselines.ts --force
 *  tsx scripts/initialize-baselines.ts --fixed 189 5
 */

import { db } from '../server/db.js';
import { sql } from 'drizzle-orm';

function hashSlug(s: string): number {
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
  const fixedIdx = args.indexOf('--fixed');

  let fixedLikes: number | null = null;
  let fixedDislikes: number | null = null;

  if (fixedIdx !== -1) {
    const likesArg = Number(args[fixedIdx + 1]);
    const dislikesArg = Number(args[fixedIdx + 2]);
    if (!Number.isFinite(likesArg) || !Number.isFinite(dislikesArg)) {
      console.error('Invalid --fixed usage. Provide numeric likes and dislikes, e.g., --fixed 189 5');
      process.exit(1);
    }
    fixedLikes = likesArg;
    fixedDislikes = dislikesArg;
  }

  console.log('🔧 Initializing baselines...', { force, fixedLikes, fixedDislikes });

  // Fetch posts needing initialization or all when forced
  const whereClause = force
    ? sql`TRUE`
    : sql`COALESCE(baseline_likes, 0) = 0 OR COALESCE(baseline_dislikes, 0) = 0`;

  const result = await db.execute(sql`
    SELECT id, slug, baseline_likes AS "baselineLikes", baseline_dislikes AS "baselineDislikes"
    FROM posts
    WHERE ${whereClause}
  `);

  const rows = (result as any).rows || [];
  console.log(`📄 Found ${rows.length} posts to initialize`);

  let updatedCount = 0;

  for (const row of rows) {
    const id = Number(row.id);
    const slug = String(row.slug || `post-${id}`);

    let likesBase: number;
    let dislikesBase: number;

    if (fixedLikes !== null && fixedDislikes !== null) {
      likesBase = fixedLikes!;
      dislikesBase = fixedDislikes!;
    } else {
      const seedNumber = slug ? hashSlug(slug) : id;
      const seed = seedNumber * 12345;
      likesBase = Math.floor(seededRandom(seed) * (200 - 100 + 1)) + 100; // 100–200
      dislikesBase = Math.floor(seededRandom(seed + 999) * (7 - 3 + 1)) + 3; // 3–7
    }

    await db.execute(sql`
      UPDATE posts
      SET baseline_likes = ${likesBase}, baseline_dislikes = ${dislikesBase}
      WHERE id = ${id}
    `);

    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`...updated ${updatedCount} posts so far`);
    }
  }

  console.log(`✅ Baseline initialization completed. Updated ${updatedCount} posts.`);
}

main().catch((err) => {
  console.error('❌ Baseline initialization failed:', err);
  process.exit(1);
});
export {};

// Web Worker for fuzzy title search and suggestions
// Input: { query: string, posts: Array<{ id: number, title: string }> }
// Output: { bestId: number | null, suggestionIds: number[] }

const ctx: any = self as any;

function normalizePlain(s: string): string {
  try {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

function tokenizeLower(s: string): string[] {
  const plain = normalizePlain(s);
  return plain.split(/[^a-z0-9]+/).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const x of setA) {
    if (setB.has(x)) inter++;
  }
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

ctx.onmessage = (e: any) => {
  try {
    const { query, posts } = e.data || {};
    const q: string = typeof query === 'string' ? query.trim() : '';
    const arr: Array<{ id: number; title: string }> = Array.isArray(posts) ? posts : [];
    if (!q || q.length < 3 || arr.length === 0) {
      ctx.postMessage({ bestId: null, suggestionIds: [] });
      return;
    }

    const qNorm = normalizePlain(q);
    const qTokens = tokenizeLower(q);
    const longEnough = qNorm.length >= 3;

    let bestId: number | null = null;
    let bestScore = -Infinity;

    const scored: Array<{ id: number; score: number }> = [];

    for (const p of arr) {
      const title = String(p.title || '');
      const tn = normalizePlain(title);
      if (!tn) continue;

      const tTokens = tokenizeLower(title);

      const containsSub = tn.includes(qNorm);
      const tokenContains = tTokens.some(tt => tt.includes(qNorm)) || qTokens.some(qt => tn.includes(qt));

      // Per-token minimum edit distance to any title token
      const perTokenMinD = qTokens.map(qt => {
        let md = Infinity;
        for (const tt of tTokens) {
          const d = levenshtein(tt, qt);
          if (d < md) md = d;
          if (md === 0) break;
        }
        return md;
      });

      const anyClose = perTokenMinD.some(d => d <= 2);

      // Accept only if we have a direct substring match OR a close token match (and query length reasonable)
      if (!(containsSub || (longEnough && anyClose))) {
        continue;
      }

      const tokenScore = qTokens.length
        ? perTokenMinD.reduce((acc, d, i) => {
            const len = Math.max(2, qTokens[i]?.length || 2);
            const s = Math.max(0, 1 - d / len);
            return acc + s;
          }, 0) / qTokens.length
        : 0;

      const jac = jaccard(tTokens, qTokens);

      let score = 0;
      if (containsSub) score += 100;
      if (tokenContains) score += 60;
      score += tokenScore * 40 + jac * 20;

      // Mild length penalty
      score -= Math.max(0, tTokens.length - qTokens.length) * 2;

      scored.push({ id: p.id, score });

      if (score > bestScore) {
        bestScore = score;
        bestId = p.id;
      }
    }

    // Sort for suggestions
    scored.sort((a, b) => b.score - a.score);
    const suggestionIds = scored.slice(0, 3).map(x => x.id);

    ctx.postMessage({ bestId, suggestionIds });
  } catch (_err) {
    ctx.postMessage({ bestId: null, suggestionIds: [] });
  }
};
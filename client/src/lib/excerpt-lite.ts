/**
 * Lightweight excerpt and reading time helpers to keep index bundle small.
 * Avoids heavy dependencies and complex analysis.
 */

/**
 * Strip basic HTML tags and normalize whitespace.
 */
function stripHtml(input: string): string {
  if (!input) return "";

  // Decode common HTML entities, including numeric (decimal/hex) references
  const decodeEntities = (s: string): string => {
    if (!s) return "";

    // Named entities
    const namedMap: Record<string, string> = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&#039;": "'",
      "&apos;": "'",
    };
    let out = s.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/g, (m) => namedMap[m] ?? m);

    // Numeric decimal entities: &#8217; etc.
    out = out.replace(/&#(\d+);/g, (_m, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : _m;
    });

    // Numeric hexadecimal entities: &#x2019; etc.
    out = out.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : _m;
    });

    // WordPress-specific dashes and quotes (some themes emit these as named entities)
    out = out
      .replace(/&#8211;/g, "–")
      .replace(/&#8212;/g, "—")
      .replace(/&#8216;/g, "’")
      .replace(/&#8217;/g, "’")
      .replace(/&#8220;/g, "\"")
      .replace(/&#8221;/g, "\"")
      .replace(/&#8230;/g, "…");

    return out;
  };

  // Strip tags, normalize whitespace, then decode entities
  const noTags = input
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return decodeEntities(noTags);
}

/**
 * Calculate reading time in minutes as a string like "3 min".
 */
export function getReadingTime(content: string, wordsPerMinute: number = 225): string {
  const text = stripHtml(content);
  if (!text) return "1 min";
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min`;
}

/**
 * Extract a simple excerpt from content up to maxLength.
 * Prefers breaking at a space near the end.
 */
export function extractExcerpt(content: string, maxLength: number = 250): string {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
}

/**
 * Extract a more engaging excerpt by selecting the highest scoring sentence(s).
 * Heuristics:
 *  - Prefer sentences with emotion/action words (e.g., scream, blood, shadow, door, heartbeat)
 *  - Prefer exclamations/questions and mid-story sentences over very first ones
 *  - Aim for length between ~120 and maxLength characters
 */
export function extractEngagingExcerpt(content: string, maxLength: number = 250): string {
  const text = stripHtml(content);
  if (!text) return "";

  // Split into sentences (basic split on punctuation)
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return extractExcerpt(content, maxLength);

  const keywords = [
    "blood","scream","screamed","shadow","shadows","dark","door","knock","whisper","whispered",
    "heartbeat","footsteps","cold","fear","teeth","eyes","dead","death","grave","night","silence",
    "alone","behind","stairs","window","closet","basement","crawl","cry","cried","knife","bone",
    "dread","sweat","breath","breathing","creak","creaked","ghost","monster","hag","witch","curse"
  ];

  const scoreSentence = (s: string, idx: number): number => {
    let score = 0;
    const lower = s.toLowerCase();

    // Emotion/action keywords
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 4;
    }

    // Punctuation cues
    if (/[!?]/.test(s)) score += 3;

    // Prefer mid-story sentences over first two
    if (idx > 1) score += 2;

    // Length heuristics
    const len = s.length;
    if (len >= 110 && len <= maxLength) score += 3;
    else if (len >= 70 && len <= maxLength + 30) score += 2;

    // Avoid overly short or excessively long
    if (len < 40) score -= 2;
    if (len > maxLength + 60) score -= 2;

    return score;
  };

  // Select best sentence by score
  let bestIdx = 0;
  let bestScore = -Infinity;
  sentences.forEach((s, idx) => {
    const sc = scoreSentence(s, idx);
    if (sc > bestScore) {
      bestScore = sc;
      bestIdx = idx;
    }
  });

  const chosen = sentences[bestIdx];

  // Try to append the next sentence if it fits and improves engagement
  let excerpt = chosen;
  if (bestIdx + 1 < sentences.length) {
    const next = sentences[bestIdx + 1];
    const combined = `${chosen} ${next}`.trim();
    if (combined.length <= maxLength) {
      excerpt = combined;
    }
  }

  // Fallback to simple truncation if still too long
  if (excerpt.length > maxLength) {
    const truncated = excerpt.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    excerpt = lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated + "...";
  }

  return excerpt;
}
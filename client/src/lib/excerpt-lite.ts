/**
 * Lightweight excerpt and reading time helpers to keep index bundle small.
 * Avoids heavy dependencies and complex analysis.
 */

/**
 * Strip basic HTML tags and normalize whitespace.
 */
function stripHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
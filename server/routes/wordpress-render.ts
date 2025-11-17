import type { Express, Request, Response } from 'express';
import { log } from '../vite';
import { determineThemeCategory, THEME_CATEGORIES } from '@shared/theme-categories';
import { getBadgeTint } from '@shared/theme-badges';

function stripHtmlServer(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getReadingTimeServer(html: string, wpm: number = 225): { minutes: number; wordCount: number } {
  const text = stripHtmlServer(html);
  const words = text.length ? text.split(/\s+/).filter(Boolean) : [];
  const minutes = Math.max(1, Math.ceil(words.length / wpm));
  return { minutes, wordCount: words.length };
}

function getExcerptServer(html: string, maxLength: number = 160): string {
  const text = stripHtmlServer(html);
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
}

function detectThemesServer(html: string): string[] {
  const text = stripHtmlServer(html).toLowerCase();
  const themes: Array<{ key: string; kws: string[] }> = [
    { key: 'Parasite', kws: ['parasite', 'infection', 'larva', 'worm', 'bug'] },
    { key: 'Cosmic', kws: ['cosmic', 'ancient', 'eldritch', 'cthulhu', 'void'] },
    { key: 'Psychological', kws: ['sanity', 'mind', 'delusion', 'hallucination', 'psych'] },
    { key: 'Technological', kws: ['machine', 'computer', 'ai', 'algorithm', 'digital'] },
    { key: 'Body Horror', kws: ['flesh', 'mutation', 'organs', 'grotesque'] },
    { key: 'Psychopath', kws: ['murder', 'killer', 'torture', 'sadist'] },
    { key: 'Supernatural', kws: ['ghost', 'spirit', 'haunt', 'poltergeist'] },
    { key: 'Uncanny', kws: ['uncanny', 'doll', 'mannequin'] },
    { key: 'Cannibalism', kws: ['cannibal', 'devour', 'human meat'] },
    { key: 'Stalking', kws: ['stalk', 'chase', 'hunt', 'follow'] },
    { key: 'Existential', kws: ['existential', 'meaning', 'void', 'nothingness'] },
    { key: 'Gothic', kws: ['gothic', 'castle', 'mansion', 'victorian'] },
    { key: 'Vehicular', kws: ['car', 'vehicle', 'drive', 'highway'] },
    { key: 'Doppelgänger', kws: ['double', 'mirror', 'twin', 'copy'] },
    { key: 'Slasher', kws: ['slasher', 'knife', 'blood', 'chase'] },
    { key: 'Horror', kws: ['horror', 'fear', 'terror', 'dark'] },
    { key: 'Death', kws: ['death', 'grave', 'funeral', 'afterlife'] },
  ];
  const scores: Array<{ key: string; score: number }> = [];
  for (const t of themes) {
    let score = 0;
    for (const kw of t.kws) {
      const rx = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\import type { Express, Request, Response } from 'express';
import { log } from '../vite';

function stripHtmlServer(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getReadingTimeServer(html: string, wpm: number = 225): { minutes: number; wordCount: number } {
  const text = stripHtmlServer(html);
  const words = text.length ? text.split(/\s+/).filter(Boolean) : [];
  const minutes = Math.max(1, Math.ceil(words.length / wpm));
  return { minutes, wordCount: words.length };
}

function getExcerptServer(html: string, maxLength: number = 160): string {
  const text = stripHtmlServer(html);
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
}

function detectThemesServer(html: string): string[] {
  const text = stripHtmlServer(html).toLowerCase();
  const themes: Array<{ key: string; kws: string[] }> = [
    { key: 'Parasite', kws: ['parasite', 'infection', 'larva', 'worm', 'bug'] },
    { key: 'Cosmic', kws: ['cosmic', 'ancient', 'eldritch', 'cthulhu', 'void'] },
    { key: 'Psychological', kws: ['sanity', 'mind', 'delusion', 'hallucination', 'psych'] },
    { key: 'Technological', kws: ['machine', 'computer', 'ai', 'algorithm', 'digital'] },
    { key: 'Body Horror', kws: ['flesh', 'mutation', 'organs', 'grotesque'] },
    { key: 'Psychopath', kws: ['murder', 'killer', 'torture', 'sadist'] },
    { key: 'Supernatural', kws: ['ghost', 'spirit', 'haunt', 'poltergeist'] },
    { key: 'Uncanny', kws: ['uncanny', 'doll', 'mannequin'] },
    { key: 'Cannibalism', kws: ['cannibal', 'devour', 'human meat'] },
    { key: 'Stalking', kws: ['stalk', 'chase', 'hunt', 'follow'] },
    { key: 'Existential', kws: ['existential', 'meaning', 'void', 'nothingness'] },
    { key: 'Gothic', kws: ['gothic', 'castle', 'mansion', 'victorian'] },
    { key: 'Vehicular', kws: ['car', 'vehicle', 'drive', 'highway'] },
    { key: 'Doppelgänger', kws: ['double', 'mirror', 'twin', 'copy'] },
    { key: 'Slasher', kws: ['slasher', 'knife', 'blood', 'chase'] },
    { key: 'Horror', kws: ['horror', 'fear', 'terror', 'dark'] },
    { key: 'Death', kws: ['death', 'grave', 'funeral', 'afterlife'] },
  ];
  const scores: Array<{ key: string; score: number }> = [];
  for (const t of themes) {
    let score = 0;
    for (const kw of t.kws) {
      const rx = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(rx);
      if (matches) score += matches.length;
    }
    if (score > 0) scores.push({ key: t.key, score });
  }
  return scores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.key);
}

export function registerWordPressRenderRoutes(app: Express): void {
  /**
   * GET /api/wordpress/render/:slug
   * Fetch a WordPress post by slug and return server-rendered fields:
   * sanitized title/content HTML, excerpt, word count, reading time, og image, and detected themes.
   */
  app.get('/api/wordpress/render/:slug', async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug || '').trim();
      if (!slug) return res.status(400).json({ error: 'Missing slug' });

      const wpBase = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
      const url = `${wpBase}?slug=${encodeURIComponent(slug)}&per_page=1`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`WordPress API error: ${response.status} ${response.statusText} ${text.slice(0, 200)}`);
      }
      const arr = await response.json();
      const post = Array.isArray(arr) ? arr[0] : null;
      if (!post) return res.status(404).json({ error: 'Not found' });

      const rawTitle = (post?.title && typeof post.title.rendered === 'string') ? post.title.rendered : String(post?.title || 'Story');
      const rawContent = (post?.content && typeof post.content.rendered === 'string') ? post.content.rendered : String(post?.content || '');

      // Use server-side sanitizer
      const { sanitizeHtml } = await import('../utils/sanitizer');
      const titleHtml = sanitizeHtml(rawTitle);
      const contentHtml = sanitizeHtml(rawContent);

      // Derived fields
      const { minutes: readingMinutes, wordCount } = getReadingTimeServer(rawContent);
      const excerpt = getExcerptServer(rawContent, 160);
      const themes = detectThemesServer(rawContent);

      // Extract first image for OG
      let ogImage: string | undefined = undefined;
      try {
        const m = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m && m[1]) {
          const url = m[1];
          if (/^https?:\/\//i.test(url) || url.startsWith('/')) ogImage = url;
        }
      } catch {}

      res.json({
        id: Number(post.id),
        slug: String(post.slug || slug),
        date: String(post.date || new Date().toISOString()),
        titleHtml,
        contentHtml,
        excerpt,
        wordCount,
        readingMinutes,
        ogImage,
        themes,
      });
    } catch (error) {
      log(`Error rendering WordPress post: ${error instanceof Error ? error.message : String(error)}`, 'wordpress-render');
      res.status(500).json({ error: 'Failed to render WordPress post' });
    }
  });
}')}\\b`, 'gi');
      const matches = text.match(rx);
      if (matches) score += matches.length;
    }
    if (score > 0) scores.push({ key: t.key, score });
  }
  return scores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.key);
}

export function registerWordPressRenderRoutes(app: Express): void {
  /**
   * GET /api/wordpress/render/:slug
   * Fetch a WordPress post by slug and return server-rendered fields:
   * sanitized title/content HTML, excerpt, word count, reading time, og image, and detected themes.
   */
  app.get('/api/wordpress/render/:slug', async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug || '').trim();
      if (!slug) { res.status(400).json({ error: 'Missing slug' }); return; }

      const wpBase = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
      const url = `${wpBase}?slug=${encodeURIComponent(slug)}&per_page=1`;
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`WordPress API error: ${response.status} ${response.statusText} ${text.slice(0, 200)}`);
      }
      const arr = await response.json();
      const post = Array.isArray(arr) ? arr[0] : null;
      if (!post) { res.status(404).json({ error: 'Not found' }); return; }

      const rawTitle = (post?.title && typeof post.title.rendered === 'string') ? post.title.rendered : String(post?.title || 'Story');
      const rawContent = (post?.content && typeof post.content.rendered === 'string') ? post.content.rendered : String(post?.content || '');

      // Use server-side sanitizer
      const { sanitizeHtml } = await import('../utils/sanitizer');
      const titleHtml = sanitizeHtml(rawTitle);
      const contentHtml = sanitizeHtml(rawContent);

      // Derived fields
      const { minutes: readingMinutes, wordCount } = getReadingTimeServer(rawContent);
      const excerpt = getExcerptServer(rawContent, 160);
      const themes = detectThemesServer(rawContent);

      // Resolve theme metadata using shared catalog
      const themeKey = determineThemeCategory(rawTitle || 'Story', rawContent || '');
      const themeInfo = (THEME_CATEGORIES as any)[themeKey] || { label: 'Horror', icon: 'ghost' };
      const themeLabel = String(themeInfo.label || 'Horror');
      const themeIcon = String(themeInfo.icon || 'ghost');
      const badgeTintClass = getBadgeTint(themeKey);

      // Extract first image for OG
      let ogImage: string | undefined = undefined;
      try {
        const m = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (m && m[1]) {
          const url = m[1];
          if (/^https?:\/\//i.test(url) || url.startsWith('/')) ogImage = url;
        }
      } catch {}

      res.json({
        id: Number(post.id),
        slug: String(post.slug || slug),
        date: String(post.date || new Date().toISOString()),
        titleHtml,
        contentHtml,
        excerpt,
        wordCount,
        readingMinutes,
        ogImage,
        themes,
        themeKey,
        themeLabel,
        themeIcon,
        badgeTintClass,
      });
    } catch (error) {
      log(`Error rendering WordPress post: ${error instanceof Error ? error.message : String(error)}`, 'wordpress-render');
      res.status(500).json({ error: 'Failed to render WordPress post' });
    }
  });
}
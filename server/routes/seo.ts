import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { createLogger } from '../utils/debug-logger';
import { config } from '../config';

const router = Router();
const seoLogger = createLogger('SEO');

function getOrigin(req: Request): string {
	// Prefer configured FRONTEND_URL to avoid http->https redirects in sitemap/robots
	try {
		const configured = process.env.FRONTEND_URL || config.cors.origin;
		if (configured) {
			const u = new URL(configured);
			// Normalize to protocol + host (strip any path)
			return `${u.protocol}//${u.host}`;
		}
	} catch (e) {
		// fall through to header-derived origin
	}

	try {
		// Trust proxy headers when present
		const forwarded = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
		const proto = String(forwarded).split(',')[0].trim() || 'https';
		const host = req.get('host');
		return `${proto}://${host}`;
	} catch {
		return 'https://bubblescafe.space';
	}
}

router.get('/robots.txt', async (req: Request, res: Response) => {
	try {
		const origin = getOrigin(req);
		const lines = [
			'User-agent: *',
			'Allow: /',
			// Disallow internal/admin and utility routes from indexing
			'Disallow: /admin',
			'Disallow: /api',
			'Disallow: /search',
			'Disallow: /auth',
			'Disallow: /reset-password',
			'',
			// Explicitly list all sitemap endpoints
			`Sitemap: ${origin}/sitemap.xml`,
			`Sitemap: ${origin}/pages-sitemap.xml`,
			`Sitemap: ${origin}/stories-sitemap.xml`,
		];
		res.setHeader('Content-Type', 'text/plain');
		// Cache robots for 1 hour
		res.setHeader('Cache-Control', 'public, max-age=3600');
		res.send(lines.join('\n'));
		return;
	} catch (error) {
		seoLogger.error('robots.txt generation error', { error: error instanceof Error ? error.message : String(error) });
		res.status(500).send('User-agent: *\nAllow: /');
		return;
	}
});

router.get('/sitemap.xml', async (req: Request, res: Response) => {
	try {
		const origin = getOrigin(req);

		// Derive lastmod values
		const now = new Date().toISOString();
		let storiesLastmod = now;

		try {
			const result = await storage.getPosts?.(1, 50, {} as any);
			const posts = result?.posts || [];
			let latestMs = 0;
			for (const post of posts as any[]) {
				const dateStr = String((post.updatedAt || post.modified || post.createdAt || new Date()));
				const ms = new Date(dateStr).getTime();
				if (!Number.isNaN(ms) && ms > latestMs) {
					latestMs = ms;
				}
			}
			if (latestMs > 0) {
				storiesLastmod = new Date(latestMs).toISOString();
			}
		} catch (e) {
			seoLogger.warn('Failed to compute stories lastmod', { error: e instanceof Error ? e.message : String(e) });
		}

		const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
			`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
			`  <sitemap>\n    <loc>${origin}/pages-sitemap.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n` +
			`  <sitemap>\n    <loc>${origin}/stories-sitemap.xml</loc>\n    <lastmod>${storiesLastmod}</lastmod>\n  </sitemap>\n` +
			`</sitemapindex>`;

		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('Cache-Control', 'public, max-age=3600');
		res.send(xml);
		return;
	} catch (error) {
		seoLogger.error('sitemap.xml (index) generation error', { error: error instanceof Error ? error.message : String(error) });
		res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>');
		return;
	}
});

/**
 * Pages sitemap: static routes
 */
router.get('/pages-sitemap.xml', async (req: Request, res: Response) => {
	try {
		const origin = getOrigin(req);
		const staticPaths = ['/', '/stories', '/reader', '/about', '/contact', '/privacy', '/community', '/submit-story', '/install'];

		const urls = staticPaths.map(p => ({
			loc: `${origin}${p}`,
			lastmod: new Date().toISOString(),
			changefreq: 'weekly',
			priority: '0.8'
		}));

		const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
			urls
				.map(u => `\n  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`)
				.join('') +
			`\n</urlset>`;

		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('Cache-Control', 'public, max-age=3600');
		res.send(xml);
		return;
	} catch (error) {
		seoLogger.error('pages-sitemap.xml generation error', { error: error instanceof Error ? error.message : String(error) });
		res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
		return;
	}
});

/**
 * Stories sitemap: dynamic posts + WordPress fallback
 */
router.get('/stories-sitemap.xml', async (req: Request, res: Response) => {
	try {
		const origin = getOrigin(req);
		const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [];
		const seen = new Set<string>();

		// Include recent posts from local storage/database
		try {
			const result = await storage.getPosts?.(1, 200, {} as any);
			const posts = result?.posts || [];
			for (const post of posts as any[]) {
				// Only include posts that have a valid slug and are not secret/placeholder
				const slugValue = typeof post.slug === 'string' ? post.slug.trim() : '';
				const isSecret = post.isSecret === true;
				const isPlaceholder = !!(post.metadata && typeof post.metadata === 'object' && (post.metadata as any).isPlaceholder === true);

				if (!slugValue || isSecret || isPlaceholder) continue;

				const safeSlug = encodeURIComponent(slugValue);
				const loc = `${origin}/reader/${safeSlug}`;
				if (!seen.has(loc)) {
					const dateStr = String((post.updatedAt || post.modified || post.createdAt || new Date()));
					let lastmod: string | undefined;
					try {
						lastmod = new Date(dateStr).toISOString();
					} catch {
						lastmod = undefined;
					}
					urls.push({ loc, lastmod, changefreq: 'monthly', priority: '0.6' });
					seen.add(loc);
				}
			}
		} catch (e) {
			seoLogger.warn('Failed to include posts in stories sitemap', { error: e instanceof Error ? e.message : String(e) });
		}

		// Fallback: include WordPress posts via server-side fetch if DB is empty or for completeness
		try {
			const wpResponse = await fetch('https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=100&_fields=slug,date');
			if (wpResponse.ok) {
				const wpPosts: Array<{ slug: string; date?: string }> = await wpResponse.json();
				for (const wp of wpPosts) {
					const wpSlug = typeof wp?.slug === 'string' ? wp.slug.trim() : '';
					if (wpSlug) {
					 const loc = `${origin}/reader/${encodeURIComponent(wpSlug)}`;
					 if (!seen.has(loc)) {
						const lastmod = wp.date ? new Date(wp.date).toISOString() : undefined;
						urls.push({ loc, lastmod, changefreq: 'monthly', priority: '0.5' });
						seen.add(loc);
					 }
					}
				}
			} else {
				seoLogger.warn('WordPress fallback failed for stories sitemap', { status: wpResponse.status });
			}
		} catch (wpErr) {
			seoLogger.warn('Error fetching WordPress posts for stories sitemap', { error: wpErr instanceof Error ? wpErr.message : String(wpErr) });
		}

		const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
			urls
				.map(u => `\n  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}\n  </url>`)
				.join('') +
			`\n</urlset>`;

		res.setHeader('Content-Type', 'application/xml');
		// Cache sitemap for 1 hour
		res.setHeader('Cache-Control', 'public, max-age=3600');
		res.send(xml);
		return;
	} catch (error) {
		seoLogger.error('stories-sitemap.xml generation error', { error: error instanceof Error ? error.message : String(error) });
		res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
		return;
	}
});

export default router;
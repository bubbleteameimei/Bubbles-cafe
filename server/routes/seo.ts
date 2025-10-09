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
		return 'https://localhost:3000';
	}
}

router.get('/robots.txt', async (req: Request, res: Response) => {
	try {
		const origin = getOrigin(req);
		const lines = [
			'User-agent: *',
			'Allow: /',
			'',
			`Sitemap: ${origin}/sitemap.xml`,
			''
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
		const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [];
		const seen = new Set<string>();

		// Static primary routes
		const staticPaths = ['/', '/stories', '/reader', '/about', '/contact', '/privacy', '/community', '/submit-story'];
		for (const p of staticPaths) {
			const loc = `${origin}${p}`;
			urls.push({ loc, changefreq: 'weekly', priority: '0.8' });
			seen.add(loc);
		}

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
			seoLogger.warn('Failed to include posts in sitemap', { error: e instanceof Error ? e.message : String(e) });
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
				seoLogger.warn('WordPress fallback failed for sitemap', { status: wpResponse.status });
			}
		} catch (wpErr) {
			seoLogger.warn('Error fetching WordPress posts for sitemap', { error: wpErr instanceof Error ? wpErr.message : String(wpErr) });
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
		seoLogger.error('sitemap.xml generation error', { error: error instanceof Error ? error.message : String(error) });
		res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
		return;
	}
});

export default router;
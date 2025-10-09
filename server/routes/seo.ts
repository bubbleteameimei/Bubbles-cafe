import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { createLogger } from '../utils/debug-logger';

const router = Router();
const seoLogger = createLogger('SEO');

function getOrigin(req: Request): string {
	try {
		const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
		const host = req.get('host');
		return `${proto}://${host}`;
	} catch {
		return 'http://localhost:3000';
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
				const slug = post.slug || `post-${post.id}`;
				const loc = `${origin}/reader/${slug}`;
				if (!seen.has(loc)) {
					const date = (post.updatedAt || post.createdAt || new Date()).toString();
					urls.push({ loc, lastmod: new Date(date).toISOString(), changefreq: 'monthly', priority: '0.6' });
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
					if (wp?.slug) {
						const loc = `${origin}/reader/${wp.slug}`;
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
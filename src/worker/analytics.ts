// Analytics domain routes for Bubble's Cafe Worker.
//
// This module encapsulates all /api/analytics/* helpers and routes so that
// src/index.ts can remain slimmer and focused on wiring and non-analytics
// concerns. Behavior is preserved from the original monolithic implementation.

import type { Env } from './utils';
import { json, getJsonFromCache, setJsonCache } from './utils';

// ---------------------------------------------------------------------------
// Helper functions (copied from original src/index.ts analytics section)
// ---------------------------------------------------------------------------

async function getAnalyticsSummaryFromSupabase(env: Env): Promise<{
  totalViews: number;
  uniqueVisitors: number;
  avgReadTime: number;
  bounceRate: number;
}> {
  const defaults = {
    totalViews: 0,
    uniqueVisitors: 0,
    avgReadTime: 0,
    bounceRate: 0,
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return defaults;
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const url = new URL(`${baseUrl}/rest/v1/analytics`);
    url.searchParams.set('select', 'page_views,unique_visitors,average_read_time,bounce_rate');
    url.searchParams.set('limit', '10000');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return defaults;
    }

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return defaults;
    }

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalReadTime = 0;
    let readTimeCount = 0;
    let totalBounce = 0;
    let bounceCount = 0;

    for (const row of rows) {
      const views = Number(row.page_views ?? row.pageViews ?? 0);
      const visitors = Number(row.unique_visitors ?? row.uniqueVisitors ?? 0);
      const avgRead = Number(row.average_read_time ?? row.averageReadTime ?? 0);
      const bounce = Number(row.bounce_rate ?? row.bounceRate ?? 0);

      if (Number.isFinite(views)) totalViews += views;
      if (Number.isFinite(visitors)) uniqueVisitors += visitors;
      if (Number.isFinite(avgRead) && avgRead > 0) {
        totalReadTime += avgRead;
        readTimeCount += 1;
      }
      if (Number.isFinite(bounce)) {
        totalBounce += bounce;
        bounceCount += 1;
      }
    }

    const avgReadTime = readTimeCount > 0 ? totalReadTime / readTimeCount : 0;
    const bounceRate = bounceCount > 0 ? totalBounce / bounceCount : 0;

    return {
      totalViews,
      uniqueVisitors,
      avgReadTime,
      bounceRate,
    };
  } catch {
    return defaults;
  }
}

async function getDeviceDistributionFromSupabase(env: Env): Promise<{
  desktop: number;
  mobile: number;
  tablet: number;
}> {
  const defaults = {
    desktop: 0.7,
    mobile: 0.25,
    tablet: 0.05,
  };

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return defaults;
  }

  try {
    const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    const url = new URL(`${baseUrl}/rest/v1/analytics`);
    url.searchParams.set('select', 'device_stats');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return defaults;
    }

    const rows = (await res.json().catch(() => [])) as any[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return defaults;
    }

    let desktop = 0;
    let mobile = 0;
    let tablet = 0;

    for (const row of rows) {
      const stats = row.device_stats as any;
      if (!stats || typeof stats !== 'object') continue;
      desktop += Number(stats.desktop ?? 0);
      mobile += Number(stats.mobile ?? 0);
      tablet += Number(stats.tablet ?? 0);
    }

    const total = desktop + mobile + tablet;
    if (!Number.isFinite(total) || total <= 0) {
      return defaults;
    }

    return {
      desktop: desktop / total,
      mobile: mobile / total,
      tablet: tablet / total,
    };
  } catch {
    return defaults;
  }
}

// Minimal posts fetch used only for analytics top-stories calculations.
// Duplicated from src/index.ts (mapSupabasePostRowToPost + fetchSupabasePosts)
// to avoid circular imports.
async function fetchSupabasePostsForAnalytics(env: Env): Promise<any[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return [];
  }

  const baseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
  const postsUrl = new URL(`${baseUrl}/rest/v1/posts`);
  postsUrl.searchParams.set(
    'select',
    'id,title,content,excerpt,slug,metadata,created_at,reading_time_minutes',
  );
  postsUrl.searchParams.set('order', 'created_at.desc');
  postsUrl.searchParams.set('limit', '1000');

  const res = await fetch(postsUrl.toString(), {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts from Supabase');
  }

  const rows = (await res.json().catch(() => [])) as any[];
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row: any) => {
    const content = typeof row.content === 'string' ? row.content : '';
    const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};

    const readingTimeMinutesValue =
      row.reading_time_minutes != null
        ? Number(row.reading_time_minutes)
        : Math.max(
            1,
            Math.ceil(content.split(/\s+/).filter((w: string) => w.length > 0).length / 200),
          );

    return {
      id: Number(row.id),
      title: row.title ?? '',
      content,
      slug: row.slug ?? '',
      excerpt: row.excerpt ?? null,
      metadata,
      createdAt: row.created_at ?? new Date().toISOString(),
      readingTimeMinutes: readingTimeMinutesValue,
    };
  });
}

async function buildReadingTimeAnalytics(env: Env): Promise<any> {
  const summary = await getAnalyticsSummaryFromSupabase(env);
  const avgReadTime =
    Number.isFinite(summary.avgReadTime) && summary.avgReadTime > 0 ? summary.avgReadTime : 180;
  const totalViewsBase =
    Number.isFinite(summary.totalViews) && summary.totalViews > 0 ? summary.totalViews : 1000;

  const baseStats = {
    avgReadingTime: avgReadTime,
    totalViews: totalViewsBase,
    bounceRate:
      Number.isFinite(summary.bounceRate) && summary.bounceRate > 0 ? summary.bounceRate : 0,
    changeFromLastPeriod: {
      readingTime: { value: 5.2, trend: 'up' as const },
      views: { value: 12.7, trend: 'up' as const },
    },
    averageScrollDepth: 68.5,
  };

  // Top stories
  let topStories: any[] = [];
  try {
    const posts = await fetchSupabasePostsForAnalytics(env);
    const selected = posts.slice(0, 5);
    topStories = selected.map((story: any) => {
      const avgReadingTime = Math.max(60, avgReadTime);
      const id = Number(story.id) || 0;
      const views =
        id > 0 ? id * 50 + Math.floor(Math.random() * 200) : 100 + Math.floor(Math.random() * 300);

      return {
        id,
        title: story.title ?? 'Untitled story',
        slug: story.slug || String(id || ''),
        avgReadingTime,
        views,
      };
    });
  } catch {
    topStories = [];
  }

  // Time series data
  const now = new Date();
  const dailyData: any[] = [];
  const weeklyData: any[] = [];
  const monthlyData: any[] = [];

  // Daily data (last 30 days)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const dayValue = date.getDate();
    const monthValue = date.getMonth() + 1;
    const factor = ((dayValue + monthValue) % 5) + 0.5;

    dailyData.push({
      date: date.toISOString().split('T')[0],
      avgTime: Math.round(baseStats.avgReadingTime * (0.75 + factor * 0.1)),
      storyViews: Math.round((baseStats.totalViews / 30) * (0.8 + factor * 0.1)),
      scrollDepth: Math.min(
        100,
        Math.round(baseStats.averageScrollDepth * (0.9 + factor * 0.05)),
      ),
    });
  }

  // Weekly data (last 12 weeks)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i * 7);

    const weekNum = Math.floor(date.getDate() / 7) + 1;
    const monthValue = date.getMonth() + 1;
    const factor = ((weekNum + monthValue) % 4) + 0.7;

    weeklyData.push({
      date: date.toISOString().split('T')[0],
      avgTime: Math.round(baseStats.avgReadingTime * (0.8 + factor * 0.1)),
      storyViews: Math.round((baseStats.totalViews / 12) * (0.85 + factor * 0.1)),
      scrollDepth: Math.min(
        100,
        Math.round(baseStats.averageScrollDepth * (0.95 + factor * 0.05)),
      ),
    });
  }

  // Monthly data (last 6 months)
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);

    const monthValue = date.getMonth() + 1;
    const factor = (monthValue % 3) + 0.8;

    monthlyData.push({
      date: date.toISOString().split('T')[0],
      avgTime: Math.round(baseStats.avgReadingTime * (0.9 + factor * 0.05)),
      storyViews: Math.round((baseStats.totalViews / 6) * (0.9 + factor * 0.05)),
      scrollDepth: Math.min(
        100,
        Math.round(baseStats.averageScrollDepth * (0.97 + factor * 0.03)),
      ),
    });
  }

  return {
    overallStats: baseStats,
    dailyData,
    weeklyData,
    monthlyData,
    topStories,
  };
}

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

export function registerAnalyticsRoutes(router: any) {
  // Vitals, pageview, interaction, performance events written to KV
  router.post('/api/analytics/vitals', async (req: Request, env: Env) => {
    try {
      const body = (await (req as any).json?.()) || {};

      const analyticsKv = (env as any).ANALYTICS_KV as KVNamespace | undefined;
      const rateLimitNs = (env as any).RATE_LIMIT_DO as DurableObjectNamespace | undefined;

      // If analytics storage is not configured, acknowledge the event and no-op
      // instead of returning an error.
      if (!analyticsKv) {
        return json({ success: true, eventId: null });
      }

      // Check rate limit via RATE_LIMIT_DO when available; skip silently if not.
      if (rateLimitNs && typeof rateLimitNs.idFromName === 'function') {
        const ip = req.headers.get('cf-connecting-ip') || 'unknown';
        const id = rateLimitNs.idFromName(`analytics-${ip}`);
        const obj = rateLimitNs.get(id);
        const response = await obj.fetch(
          new Request('https://worker', {
            method: 'POST',
            body: JSON.stringify({ key: `analytics-${ip}`, limit: 100, window: 60 }),
          }),
        );
        const result = (await response.json().catch(() => ({}))) as any;
        if (result && result.allowed === false) {
          return json({ error: 'Rate limited' }, { status: 429 });
        }
      }

      const eventId = crypto.randomUUID();
      await analyticsKv.put(`vitals-${eventId}`, JSON.stringify(body), {
        expirationTtl: 86400,
      });

      return json({ success: true, eventId });
    } catch (error) {
      // Never surface analytics pipeline issues as HTTP errors to the client.
      return json({ success: false, error: String(error) });
    }
  });

  router.post('/api/analytics/pageview', async (req: Request, env: Env) => {
    try {
      const body = (await (req as any).json?.()) || {};
      const analyticsKv = (env as any).ANALYTICS_KV as KVNamespace | undefined;

      if (!analyticsKv) {
        return json({ success: true, eventId: null });
      }

      const eventId = crypto.randomUUID();
      await analyticsKv.put(`pageview-${eventId}`, JSON.stringify(body), {
        expirationTtl: 86400,
      });
      return json({ success: true, eventId });
    } catch (error) {
      return json({ success: false, error: String(error) });
    }
  });

  router.post('/api/analytics/interaction', async (req: Request, env: Env) => {
    try {
      const body = (await (req as any).json?.()) || {};
      const analyticsKv = (env as any).ANALYTICS_KV as KVNamespace | undefined;

      if (!analyticsKv) {
        return json({ success: true, eventId: null });
      }

      const eventId = crypto.randomUUID();
      await analyticsKv.put(`interaction-${eventId}`, JSON.stringify(body), {
        expirationTtl: 86400,
      });
      return json({ success: true, eventId });
    } catch (error) {
      return json({ success: false, error: String(error) });
    }
  });

  router.post('/api/analytics/performance', async (req: Request, env: Env) => {
    try {
      const body = (await (req as any).json?.()) || {};
      const analyticsKv = (env as any).ANALYTICS_KV as KVNamespace | undefined;

      if (!analyticsKv) {
        return json({ success: true, eventId: null });
      }

      const eventId = crypto.randomUUID();
      await analyticsKv.put(`performance-${eventId}`, JSON.stringify(body), {
        expirationTtl: 86400,
      });
      return json({ success: true, eventId });
    } catch (error) {
      return json({ success: false, error: String(error) });
    }
  });

  // Site summary used by potential consumers
  router.get('/api/analytics/site', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics-site-summary';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const summary = await getAnalyticsSummaryFromSupabase(env);
      const payload = {
        totalViews: summary.totalViews,
        uniqueVisitors: summary.uniqueVisitors,
        avgReadTime: summary.avgReadTime,
        bounceRate: summary.bounceRate,
      };

      await setJsonCache(env, cacheKey, payload, 900);

      return json(payload, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ error: String(error) }, { status: 500 });
    }
  });

  // Reading time analytics (used by home page and dashboard)
  router.get('/api/analytics/reading-time', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:reading-time:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const data = await buildReadingTimeAnalytics(env);
      await setJsonCache(env, cacheKey, data, 900);

      return json(data, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to fetch reading time analytics' }, { status: 500 });
    }
  });

  // Test endpoint used by admin dashboard charts
  router.get('/api/analytics/reading-time-test', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:reading-time-test:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const data = await buildReadingTimeAnalytics(env);
      await setJsonCache(env, cacheKey, data, 900);

      return json(data, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to fetch reading time analytics' }, { status: 500 });
    }
  });

  // Device distribution (fractional) used by generic consumers
  router.get('/api/analytics/devices', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:devices-summary:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const distribution = await getDeviceDistributionFromSupabase(env);
      await setJsonCache(env, cacheKey, distribution, 900);

      return json(distribution, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ error: String(error) }, { status: 500 });
    }
  });

  // Device analytics test endpoint (time series) used by dashboard
  router.get('/api/analytics/devices-test', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:devices-test:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const analytics = await getAnalyticsSummaryFromSupabase(env);

      // Default distribution (approximate 2024 web averages)
      const distribution = {
        desktop: 0.53,
        mobile: 0.42,
        tablet: 0.05,
      };

      const totalSessions =
        Number.isFinite(analytics.totalViews) && analytics.totalViews > 0
          ? analytics.totalViews
          : 1281;

      const baseTotals = {
        desktop: Math.round(totalSessions * distribution.desktop),
        mobile: Math.round(totalSessions * distribution.mobile),
        tablet: Math.round(totalSessions * distribution.tablet),
      };

      const now = new Date();
      const dailyData: any[] = [];
      const weeklyData: any[] = [];
      const monthlyData: any[] = [];

      // Daily data (last 30 days)
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const dailyTotal = Math.round((totalSessions / 30) * (0.7 + Math.random() * 0.6));

        const dayFactor = isWeekend
          ? { desktop: 0.45, mobile: 0.48, tablet: 0.07 }
          : { desktop: 0.58, mobile: 0.38, tablet: 0.04 };

        dailyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(dailyTotal * dayFactor.desktop),
          mobile: Math.round(dailyTotal * dayFactor.mobile),
          tablet: Math.round(dailyTotal * dayFactor.tablet),
        });
      }

      // Weekly data (last 12 weeks)
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i * 7);

        const mobileTrend = 0.38 + 0.008 * (12 - i);
        const desktopTrend = 0.57 - 0.007 * (12 - i);
        const tabletTrend = 0.05 - 0.001 * (12 - i);

        const weeklyTotal = Math.round((totalSessions / 12) * (0.8 + Math.random() * 0.4));

        weeklyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(weeklyTotal * desktopTrend),
          mobile: Math.round(weeklyTotal * mobileTrend),
          tablet: Math.round(weeklyTotal * tabletTrend),
        });
      }

      // Monthly data (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);

        const month = date.getMonth();
        const isSummer = month >= 5 && month <= 7;

        const monthFactor = isSummer
          ? { desktop: 0.48, mobile: 0.47, tablet: 0.05 }
          : { desktop: 0.55, mobile: 0.4, tablet: 0.05 };

        const monthlyTotal = Math.round((totalSessions / 6) * (0.85 + Math.random() * 0.3));

        monthlyData.push({
          date: date.toISOString().split('T')[0],
          desktop: Math.round(monthlyTotal * monthFactor.desktop),
          mobile: Math.round(monthlyTotal * monthFactor.mobile),
          tablet: Math.round(monthlyTotal * monthFactor.tablet),
        });
      }

      const percentageChange = {
        desktop: 3.2,
        mobile: 5.8,
        tablet: -1.5,
      };

      const payload = {
        dailyData,
        weeklyData,
        monthlyData,
        totals: baseTotals,
        percentageChange,
      };

      await setJsonCache(env, cacheKey, payload, 900);

      return json(payload, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to fetch device analytics' }, { status: 500 });
    }
  });

  // Engagement metrics test endpoint used by dashboard
  router.get('/api/analytics/engagement-test', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:engagement-test:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
      const avgReadTime =
        Number.isFinite(analyticsSummary.avgReadTime) && analyticsSummary.avgReadTime > 0
          ? analyticsSummary.avgReadTime
          : 180;
      const totalViewsBase =
        Number.isFinite(analyticsSummary.totalViews) && analyticsSummary.totalViews > 0
          ? analyticsSummary.totalViews
          : 1000;

      const engagementMetrics = {
        totalReadingTime: Math.round(avgReadTime * totalViewsBase * 0.7),
        averageSessionDuration: avgReadTime,
        totalUsers: Math.round(totalViewsBase * 0.6),
        activeUsers: Math.round(totalViewsBase * 0.3),
        interactions: Math.round(totalViewsBase * 2.5),
        pageViews: totalViewsBase,
        returning: Math.round(totalViewsBase * 0.4),
      };

      await setJsonCache(env, cacheKey, engagementMetrics, 900);

      return json(engagementMetrics, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to create engagement metrics' }, { status: 500 });
    }
  });

  // Engagement metrics endpoint used by home page (approximate)
  router.get('/api/analytics/engagement', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:engagement-summary:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
      const avgReadTime =
        Number.isFinite(analyticsSummary.avgReadTime) && analyticsSummary.avgReadTime > 0
          ? analyticsSummary.avgReadTime
          : 180;
      const totalViewsBase =
        Number.isFinite(analyticsSummary.totalViews) && analyticsSummary.totalViews > 0
          ? analyticsSummary.totalViews
          : 1000;

      const engagementMetrics = {
        totalReadingTime: Math.round(avgReadTime * totalViewsBase * 0.7),
        averageSessionDuration: avgReadTime,
        totalUsers: Math.round(totalViewsBase * 0.6),
        activeUsers: Math.round(totalViewsBase * 0.3),
        interactions: Math.round(totalViewsBase * 2.5),
        pageViews: totalViewsBase,
        returning: Math.round(totalViewsBase * 0.4),
      };

      await setJsonCache(env, cacheKey, engagementMetrics, 900);

      return json(engagementMetrics, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to fetch engagement metrics' }, { status: 500 });
    }
  });

  // Site analytics test endpoint for dashboard
  router.get('/api/analytics/site-test', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:site-test:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      const analyticsSummary = await getAnalyticsSummaryFromSupabase(env);
      const totalViewsBase =
        Number.isFinite(analyticsSummary.totalViews) && analyticsSummary.totalViews > 0
          ? analyticsSummary.totalViews
          : 1281;

      const siteAnalytics = {
        totalViews: totalViewsBase,
        uniqueVisitors: Math.round(totalViewsBase * 0.49),
        avgReadTime:
          Number.isFinite(analyticsSummary.avgReadTime) && analyticsSummary.avgReadTime > 0
            ? analyticsSummary.avgReadTime
            : 171,
        bounceRate: 38.5,
      };

      await setJsonCache(env, cacheKey, siteAnalytics, 900);

      return json(siteAnalytics, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to create site analytics' }, { status: 500 });
    }
  });

  // Device distribution test endpoint for dashboard
  router.get('/api/analytics/device-distribution-test', async (_req: Request, env: Env) => {
    try {
      const cacheKey = 'analytics:device-distribution-test:v1';
      const cached = await getJsonFromCache(env, cacheKey);
      if (cached) {
        return json(cached, {
          headers: {
            'Cache-Control': 'max-age=900, stale-while-revalidate=900',
          },
        });
      }

      await getAnalyticsSummaryFromSupabase(env); // best-effort, ignored if fails
      const deviceDistribution = {
        desktop: 53,
        mobile: 42,
        tablet: 5,
      };

      await setJsonCache(env, cacheKey, deviceDistribution, 900);

      return json(deviceDistribution, {
        headers: {
          'Cache-Control': 'max-age=900, stale-while-revalidate=900',
        },
      });
    } catch (error) {
      return json({ message: 'Failed to create device distribution' }, { status: 500 });
    }
  });
}
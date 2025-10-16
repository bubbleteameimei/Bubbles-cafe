/**
 * Layout/Reflow Deep Audit
 *
 * What this does:
 * - Launches Chromium via Puppeteer and navigates common routes.
 * - Starts Chrome DevTools Protocol tracing to capture Layout/RecalcStyle timeline events.
 * - Injects lightweight instrumentation to detect forced synchronous layout (FSL) patterns
 *   (layout reads like getBoundingClientRect after DOM writes in the same task).
 * - Summarizes counts, durations, and top call sites to help pinpoint root causes.
 *
 * Usage:
 *   node scripts/layout-reflow-audit.cjs [baseUrl]
 * Examples:
 *   node scripts/layout-reflow-audit.cjs http://localhost:3002
 *   APP_URL=http://localhost:5000 node scripts/layout-reflow-audit.cjs
 *
 * Output:
 *   - reflow-reports/reflow-report-<timestamp>.json (machine readable)
 *   - reflow-reports/reflow-report-<timestamp>.md   (human readable summary)
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const REPORT_DIR = path.join(process.cwd(), 'reflow-reports');

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

function nowTs() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

async function getBaseUrl() {
  const cli = process.argv[2] && process.argv[2].startsWith('http') ? process.argv[2] : null;
  const env = process.env.APP_URL && process.env.APP_URL.startsWith('http') ? process.env.APP_URL : null;
  const candidates = [
    cli,
    env,
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  // Pick the first that responds
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  for (const url of candidates) {
    try {
      await page.goto(url + '/health', { waitUntil: 'domcontentloaded', timeout: 2500 });
      await browser.close();
      return url;
    } catch {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 2500 });
        await browser.close();
        return url;
      } catch {
        // try next
      }
    }
  }
  await browser.close();
  // Fallback
  return candidates[0] || 'http://localhost:3002';
}

function pickTopFrame(frames = []) {
  for (const f of frames) {
    if (!f || !f.url) continue;
    if (f.url.startsWith('http://localhost') || f.url.startsWith('https://') || f.url.includes('/client/')) {
      return `${f.url}:${f.lineNumber || 0}:${f.columnNumber || 0}`;
    }
  }
  // last resort
  const f = frames[0];
  return f && f.url ? `${f.url}:${f.lineNumber || 0}:${f.columnNumber || 0}` : 'unknown';
}

function microToMs(us) {
  if (!us || typeof us !== 'number') return 0;
  return us / 1000;
}

async function readStreamFromCDP(client, handle) {
  const chunks = [];
  let eof = false;
  while (!eof) {
    const { data, eof: end } = await client.send('IO.read', { handle });
    if (data) chunks.push(Buffer.from(data, 'base64'));
    eof = !!end;
  }
  await client.send('IO.close', { handle });
  const buf = Buffer.concat(chunks);
  return buf.toString('utf8');
}

function parseTrace(raw) {
  // Trace may be JSON with {"traceEvents":[...]} or a stream of JSON objects
  let traceJson;
  try {
    traceJson = JSON.parse(raw);
  } catch {
    // try to recover by wrapping in []
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => (l.endsWith(',') ? l.slice(0, -1) : l));
    try {
      traceJson = { traceEvents: lines.map((l) => JSON.parse(l)) };
    } catch {
      traceJson = { traceEvents: [] };
    }
  }
  const events = Array.isArray(traceJson?.traceEvents) ? traceJson.traceEvents : [];

  const summary = {
    counts: { Layout: 0, RecalculateStyles: 0 },
    totalMs: { Layout: 0, RecalculateStyles: 0 },
    topByScript: { Layout: {}, RecalculateStyles: {} },
    invalidations: {
      ScheduleStyleRecalculation: 0,
      InvalidateLayout: 0,
      LayoutInvalidated: 0,
    },
    samples: { Layout: [], RecalculateStyles: [] },
  };

  for (const ev of events) {
    const name = ev?.name;
    const cat = ev?.cat || '';
    // Count invalidation tracking events
    if (name === 'ScheduleStyleRecalculation') {
      summary.invalidations.ScheduleStyleRecalculation++;
    } else if (name === 'InvalidateLayout' || name === 'LayoutInvalidated') {
      if (name === 'InvalidateLayout') summary.invalidations.InvalidateLayout++;
      if (name === 'LayoutInvalidated') summary.invalidations.LayoutInvalidated++;
    }

    if (name !== 'Layout' && name !== 'RecalculateStyles') continue;
    // Only duration events
    const durMs = microToMs(ev.dur);
    summary.counts[name]++;
    summary.totalMs[name] += durMs;

    const frames = ev?.args?.data?.stackTrace || ev?.args?.stackTrace || [];
    const top = pickTopFrame(frames);
    if (!summary.topByScript[name][top]) summary.topByScript[name][top] = { count: 0, ms: 0 };
    summary.topByScript[name][top].count++;
    summary.topByScript[name][top].ms += durMs;

    if (summary.samples[name].length < 25) {
      summary.samples[name].push({
        durMs,
        top,
        data: ev?.args?.data || {},
      });
    }
  }

  // Sort topByScript
  const sorted = {
    Layout: Object.entries(summary.topByScript.Layout)
      .map(([k, v]) => ({ script: k, ...v }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 15),
    RecalculateStyles: Object.entries(summary.topByScript.RecalculateStyles)
      .map(([k, v]) => ({ script: k, ...v }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 15),
  };

  return { rawEventsCount: events.length, summary, sorted };
}

function markdownReport(data, baseUrl, flows, metricsSnapshots, fslReport) {
  const lines = [];
  lines.push(`# Layout/Reflow Audit Report`);
  lines.push('');
  lines.push(`Base URL: ${baseUrl}`);
  lines.push(`Flows: ${flows.join(', ')}`);
  lines.push('');

  const { summary, sorted } = data;

  lines.push('## Timeline Summary (CDP Trace)');
  lines.push(`- Layout events: ${summary.counts.Layout} (total ${summary.totalMs.Layout.toFixed(2)}ms)`);
  lines.push(`- RecalculateStyles events: ${summary.counts.RecalculateStyles} (total ${summary.totalMs.RecalculateStyles.toFixed(2)}ms)`);
  lines.push(`- Invalidation events: ScheduleStyleRecalculation=${summary.invalidations.ScheduleStyleRecalculation}, InvalidateLayout=${summary.invalidations.InvalidateLayout}, LayoutInvalidated=${summary.invalidations.LayoutInvalidated}`);
  lines.push('');

  lines.push('### Top Layout time by script');
  for (const row of sorted.Layout) {
    lines.push(`- ${row.script} — ${row.ms.toFixed(2)}ms across ${row.count} events`);
  }
  if (!sorted.Layout.length) lines.push('- (no layout events captured)');

  lines.push('');
  lines.push('### Top Style Recalc time by script');
  for (const row of sorted.RecalculateStyles) {
    lines.push(`- ${row.script} — ${row.ms.toFixed(2)}ms across ${row.count} events`);
  }
  if (!sorted.RecalculateStyles.length) lines.push('- (no style recalc events captured)');

  lines.push('');
  lines.push('## Performance.getMetrics snapshots');
  metricsSnapshots.forEach((snap, i) => {
    lines.push(`- Snapshot #${i + 1}: ${JSON.stringify(snap, null, 0)}`);
  });

  lines.push('');
  lines.push('## Forced Synchronous Layout (Heuristic) ');
  lines.push(`- FSL reads detected: ${fslReport.totalReads}`);
  lines.push(`- Reads after writes (same task window): ${fslReport.forcedSyncCount}`);
  lines.push('### Top FSL call sites');
  fslReport.topSites.slice(0, 15).forEach((s) => {
    lines.push(`- ${s.site} — forcedSync=${s.forced}, reads=${s.reads}, lastSeen=${s.lastSeen.toFixed(1)}ms`);
  });
  if (!fslReport.topSites.length) lines.push('- (no suspicious patterns detected)');

  lines.push('');
  lines.push('## Notes');
  lines.push('- Layout thrashing often comes from reading layout (e.g., getBoundingClientRect, offsetWidth) after DOM writes within the same task.');
  lines.push('- Consider throttling scroll/resize handlers and avoiding transition-all on containers that might affect width/height.');
  lines.push('');
  return lines.join('\n');
}

function compactMetrics(metrics) {
  // Pull out interesting metrics if present
  const out = {};
  for (const m of metrics) {
    out[m.name] = m.value;
  }
  const pick = (k) => (typeof out[k] === 'number' ? out[k] : undefined);
  return {
    Nodes: pick('Nodes'),
    LayoutCount: pick('LayoutCount'),
    RecalcStyleCount: pick('RecalcStyleCount'),
    LayoutDuration: pick('LayoutDuration'),
    RecalcStyleDuration: pick('RecalcStyleDuration'),
    ScriptDuration: pick('ScriptDuration'),
    TaskDuration: pick('TaskDuration'),
    JSHeapUsedSize: pick('JSHeapUsedSize'),
  };
}

function fslInjectionSource() {
  // This function will run in the page context
  function installFSLDetector() {
    const global = window;
    if (global.__FSL_INSTALLED__) return;
    global.__FSL_INSTALLED__ = true;

    const events = [];
    let writesSince = 0;
    let lastWriteTs = 0;

    function now() {
      return performance.now();
    }

    function record(kind, detail, forced) {
      const ts = now();
      const site = (detail && detail.site) || 'unknown';
      events.push({
        kind,
        forced: !!forced,
        site,
        ts,
      });
    }

    function stackSite() {
      const e = new Error();
      const s = (e.stack || '').split('\n').slice(2);
      // Pick first meaningful frame outside this detector
      for (const line of s) {
        if (line.includes('installFSLDetector') || line.includes('record(')) continue;
        return line.trim();
      }
      return s[0] ? s[0].trim() : 'unknown';
    }

    function markWrite() {
      writesSince++;
      lastWriteTs = now();
    }

    // Wrap mutation methods
    const mutationTargets = [
      [Node.prototype, 'appendChild'],
      [Node.prototype, 'insertBefore'],
      [Node.prototype, 'removeChild'],
      [Element.prototype, 'remove'],
      [Element.prototype, 'setAttribute'],
    ];

    for (const [proto, name] of mutationTargets) {
      const orig = proto[name];
      if (!orig || orig.__wrapped) continue;
      Object.defineProperty(proto, name, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function wrapped(...args) {
          try { markWrite(); } catch {}
          return orig.apply(this, args);
        },
      });
      proto[name].__wrapped = true;
    }

    // classList operations
    const dtp = DOMTokenList && DOMTokenList.prototype;
    if (dtp) {
      for (const n of ['add', 'remove', 'toggle', 'replace']) {
        const orig = dtp[n];
        if (!orig || orig.__wrapped) continue;
        Object.defineProperty(dtp, n, {
          configurable: true,
          writable: true,
          enumerable: false,
          value: function wrapped(...args) {
            try { markWrite(); } catch {}
            return orig.apply(this, args);
          },
        });
        dtp[n].__wrapped = true;
      }
    }

    // style.setProperty / removeProperty
    const css = CSSStyleDeclaration && CSSStyleDeclaration.prototype;
    if (css) {
      for (const n of ['setProperty', 'removeProperty']) {
        const orig = css[n];
        if (!orig || orig.__wrapped) continue;
        Object.defineProperty(css, n, {
          configurable: true,
          writable: true,
          enumerable: false,
          value: function wrapped(...args) {
            try { markWrite(); } catch {}
            return orig.apply(this, args);
          },
        });
        css[n].__wrapped = true;
      }
    }

    // Intercept layout reads
    function wrapGetter(proto, prop) {
      const desc = Object.getOwnPropertyDescriptor(proto, prop);
      if (!desc || typeof desc.get !== 'function') return;
      const origGet = desc.get;
      const wrapped = function() {
        const site = stackSite();
        const elapsed = now() - lastWriteTs;
        const forced = writesSince > 0 && elapsed < 200; // same task-ish
        record(`get:${prop}`, { site }, forced);
        const res = origGet.call(this);
        if (forced) writesSince = 0;
        return res;
      };
      Object.defineProperty(proto, prop, { configurable: true, get: wrapped });
    }

    const layoutReadProps = [
      'offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft',
      'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight',
      'getClientRects', // function but present on Element.prototype
    ];

    for (const prop of layoutReadProps) {
      if (prop === 'getClientRects') {
        const orig = Element.prototype.getClientRects;
        if (orig && !orig.__wrapped) {
          Object.defineProperty(Element.prototype, 'getClientRects', {
            configurable: true,
            writable: true,
            enumerable: false,
            value: function wrapped(...args) {
              const site = stackSite();
              const elapsed = now() - lastWriteTs;
              const forced = writesSince > 0 && elapsed < 200;
              record('get:getClientRects', { site }, forced);
              const res = orig.apply(this, args);
              if (forced) writesSince = 0;
              return res;
            },
          });
          Element.prototype.getClientRects.__wrapped = true;
        }
      } else {
        wrapGetter(HTMLElement.prototype, prop);
      }
    }

    // Wrap getBoundingClientRect
    const origGBCR = Element.prototype.getBoundingClientRect;
    if (origGBCR && !origGBCR.__wrapped) {
      Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function wrapped(...args) {
          const site = stackSite();
          const elapsed = now() - lastWriteTs;
          const forced = writesSince > 0 && elapsed < 200;
          record('get:getBoundingClientRect', { site }, forced);
          const res = origGBCR.apply(this, args);
          if (forced) writesSince = 0;
          return res;
        },
      });
      Element.prototype.getBoundingClientRect.__wrapped = true;
    }

    // Wrap getComputedStyle
    const origGCS = window.getComputedStyle;
    if (origGCS && !origGCS.__wrapped) {
      Object.defineProperty(window, 'getComputedStyle', {
        configurable: true,
        writable: true,
        enumerable: false,
        value: function wrapped(...args) {
          const site = stackSite();
          const elapsed = now() - lastWriteTs;
          const forced = writesSince > 0 && elapsed < 200;
          record('get:getComputedStyle', { site }, forced);
          const res = origGCS.apply(this, args);
          if (forced) writesSince = 0;
          return res;
        },
      });
      window.getComputedStyle.__wrapped = true;
    }

    // Expose report function
    global.__collectFSLReport = function() {
      const siteMap = new Map();
      let totalReads = 0;
      let forcedSyncCount = 0;
      for (const ev of events) {
        totalReads++;
        if (ev.forced) forcedSyncCount++;
        const prev = siteMap.get(ev.site) || { reads: 0, forced: 0, lastSeen: ev.ts };
        prev.reads++;
        if (ev.forced) prev.forced++;
        prev.lastSeen = ev.ts;
        siteMap.set(ev.site, prev);
      }
      const topSites = Array.from(siteMap.entries())
        .map(([site, v]) => ({ site, ...v }))
        .sort((a, b) => b.forced - a.forced || b.reads - a.reads);
      return { totalReads, forcedSyncCount, topSites, rawEventsCount: events.length };
    };
  }

  return `(${installFSLDetector.toString()})();`;
}

async function runFlows(page, base) {
  const flows = [];

  // Home
  try {
    flows.push('home');
    await page.goto(base + '/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(500);
    // Scroll a bit
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'auto' }));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    await page.waitForTimeout(200);

    // Open sidebar (menu button)
    const menuBtn = await page.$('button[aria-label="Open menu"]');
    if (menuBtn) {
      await menuBtn.click();
      await page.waitForTimeout(250);
      // Close via close button if present
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
    }
  } catch (e) {
    console.warn('Flow "home" failed:', e.message);
  }

  // Reader
  try {
    flows.push('reader');
    await page.goto(base + '/reader', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'auto' }));
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    await page.waitForTimeout(200);
  } catch (e) {
    console.warn('Flow "reader" failed:', e.message);
  }

  // Stories/index
  try {
    flows.push('stories');
    await page.goto(base + '/stories', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'auto' }));
    await page.waitForTimeout(250);
  } catch (e) {
    console.warn('Flow "stories" failed:', e.message);
  }

  return flows;
}

async function collectPerformanceMetrics(client) {
  try {
    const res = await client.send('Performance.getMetrics');
    const metrics = res?.metrics || [];
    return compactMetrics(metrics);
  } catch {
    return {};
  }
}

async function main() {
  ensureDir(REPORT_DIR);
  const ts = nowTs();
  const baseUrl = await getBaseUrl();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--js-flags=--expose-gc',
    ],
    defaultViewport: { width: 1366, height: 900 },
  });

  const page = await browser.newPage();

  // Inject FSL detector on all pages before scripts execute
  await page.evaluateOnNewDocument(fslInjectionSource());

  // Attach CDP
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  // Start tracing
  const categories = [
    'devtools.timeline',
    'disabled-by-default-devtools.timeline',
    'disabled-by-default-devtools.timeline.frame',
    'disabled-by-default-devtools.timeline.invalidationTracking',
    'v8.execute',
    'toplevel',
    'blink.user_timing',
  ];

  await client.send('Tracing.start', {
    categories: categories.join(','),
    options: 'sampling-frequency=9000',
    transferMode: 'ReturnAsStream',
  });

  const metricsSnapshots = [];
  metricsSnapshots.push({ label: 'start', metrics: await collectPerformanceMetrics(client) });

  const flows = await runFlows(page, baseUrl);

  metricsSnapshots.push({ label: 'after flows', metrics: await collectPerformanceMetrics(client) });

  // Stop tracing and read stream
  const { stream } = await client.send('Tracing.end');
  const rawTrace = await readStreamFromCDP(client, stream);

  // Collect FSL data
  const fslReport = await page.evaluate(() => {
    try {
      return window.__collectFSLReport ? window.__collectFSLReport() : { totalReads: 0, forcedSyncCount: 0, topSites: [], rawEventsCount: 0 };
    } catch {
      return { totalReads: 0, forcedSyncCount: 0, topSites: [], rawEventsCount: 0 };
    }
  });

  await browser.close();

  const parsed = parseTrace(rawTrace);

  const jsonOut = {
    baseUrl,
    flows,
    metricsSnapshots,
    traceSummary: parsed.summary,
    traceSorted: parsed.sorted,
    rawEventsCount: parsed.rawEventsCount,
    fslReport,
  };

  const jsonPath = path.join(REPORT_DIR, `reflow-report-${ts}.json`);
  const mdPath = path.join(REPORT_DIR, `reflow-report-${ts}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), 'utf8');
  fs.writeFileSync(mdPath, markdownReport(parsed, baseUrl, flows, metricsSnapshots, fslReport), 'utf8');

  console.log('Reflow audit complete.');
  console.log('JSON report:', jsonPath);
  console.log('Markdown report:', mdPath);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Reflow audit failed:', err);
    process.exitCode = 1;
  });
}
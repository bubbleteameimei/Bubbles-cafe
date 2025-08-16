import puppeteer from 'puppeteer';

const BASE_URL = process.env.APP_URL || 'http://localhost:3003';
const ROUTES = ['/', '/stories', '/reader', '/community', '/settings/profile'];

async function checkRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  const failures = [];
  const badResponses = [];

  const onFailed = req => failures.push({ url: req.url(), errorText: req.failure()?.errorText || 'failed' });
  const onResponse = res => {
    const status = res.status();
    if (status >= 400) badResponses.push({ url: res.url(), status });
  };

  page.on('requestfailed', onFailed);
  page.on('response', onResponse);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 800));
  } catch (e) {
    failures.push({ url, errorText: e.message || 'navigation error' });
  }

  page.off('requestfailed', onFailed);
  page.off('response', onResponse);

  // Collect DOM links and images for additional checks
  const domLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
    const imgs = Array.from(document.querySelectorAll('img[src]')).map(i => i.src);
    const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]')).map(l => l.href);
    return { anchors, imgs, scripts, styles };
  });

  return { route, failures, badResponses, domLinks };
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const results = [];
  for (const route of ROUTES) {
    results.push(await checkRoute(page, route));
  }
  await browser.close();

  // Print concise report
  let hasIssues = false;
  for (const r of results) {
    const uniqueBad = dedupe(r.badResponses, x => x.url + '|' + x.status);
    const uniqueFail = dedupe(r.failures, x => x.url + '|' + x.errorText);
    if (uniqueBad.length || uniqueFail.length) {
      hasIssues = true;
      console.log(`\n[Route] ${r.route}`);
      if (uniqueBad.length) {
        console.log('  Non-2xx responses:');
        uniqueBad.slice(0, 20).forEach(i => console.log(`   - ${i.status} ${i.url}`));
        if (uniqueBad.length > 20) console.log(`   ...and ${uniqueBad.length - 20} more`);
      }
      if (uniqueFail.length) {
        console.log('  Failed requests:');
        uniqueFail.slice(0, 20).forEach(i => console.log(`   - ${i.errorText} ${i.url}`));
        if (uniqueFail.length > 20) console.log(`   ...and ${uniqueFail.length - 20} more`);
      }
    }
  }
  if (!hasIssues) console.log('No broken links or assets detected.');
}

function dedupe(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const k = keyFn(it);
    if (!seen.has(k)) { seen.add(k); out.push(it); }
  }
  return out;
}

run().catch(e => { console.error(e); process.exit(1); });
import fs from 'fs';
import puppeteer from 'puppeteer-core';

function resolveChromePath() {
  const env =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    process.env.CHROMIUM_PATH;
  if (env && fs.existsSync(env)) return env;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  return candidates.find(p => fs.existsSync(p));
}

const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
const VIEWPORTS = [
  { name: 'mobile-iphoneX', width: 375, height: 812 },
  { name: 'mobile-pixel7', width: 390, height: 844 },
  { name: 'tablet-ipad', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

const ROUTES = [
  '/',
  '/stories',
  '/reader',
  '/community',
  '/settings/profile'
];

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: resolveChromePath(), args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`;
        console.log(`Visiting ${url} at ${vp.name}`);
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          await new Promise(r => setTimeout(r, 1000));
          const safeRoute = route === '/' ? 'home' : route.replace(/[\\/:?&=]+/g, '_');
          await page.screenshot({ path: `./screenshots/${safeRoute}-${vp.name}.png`, fullPage: true });
        } catch (err) {
          console.warn(`Failed to capture ${url} at ${vp.name}:`, err?.message);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
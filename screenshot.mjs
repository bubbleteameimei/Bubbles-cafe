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

async function captureScreenshot() {
  const browser = await puppeteer.launch({ executablePath: resolveChromePath(), headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
  await page.goto(`${BASE_URL}/reader`, { waitUntil: "networkidle0" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "./reader-screenshot.png" });
  await browser.close();
  console.log("Screenshot captured successfully!");
}

captureScreenshot().catch(console.error);

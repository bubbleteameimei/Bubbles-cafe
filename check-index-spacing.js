/**
 * Screenshot Index Page
 * 
 * This script captures a screenshot of the index page to verify
 * spacing improvements.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureIndexPage() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set a desktop viewport
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    console.log('Navigating to index page...');
    await page.goto('http://localhost:3001/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Make sure content is fully loaded
    await page.waitForSelector('.story-card-container', { 
      visible: true,
      timeout: 10000
    });

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    console.log('Taking desktop screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, 'index-spacing-desktop.png'),
      fullPage: true
    });

    // Set a mobile viewport
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
    });

    console.log('Taking mobile screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, 'index-spacing-mobile.png'),
      fullPage: true
    });

    console.log('Screenshots saved to the screenshots directory.');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureIndexPage();
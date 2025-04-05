/**
 * Theme Icons Screenshot Script
 * 
 * This script captures a screenshot of the homepage showing theme icons in post cards
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureThemeIcons() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });
    
    // Wait for the posts to load
    console.log('Waiting for posts to load...');
    await page.waitForSelector('.post-card, .homepage-grid', { timeout: 5000 });
    
    // Add outline to theme badges to highlight them in the screenshot
    await page.evaluate(() => {
      const badges = document.querySelectorAll('.badge');
      badges.forEach(badge => {
        badge.style.outline = '2px solid red';
        badge.style.outlineOffset = '2px';
      });
    });
    
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'theme-icons-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

captureThemeIcons();
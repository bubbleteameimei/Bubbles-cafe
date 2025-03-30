/**
 * Simple Screenshot Script
 * 
 * This script captures a screenshot of the website and saves it to screenshot.png
 */

import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';

async function takeScreenshot() {
  console.log('Attempting to take screenshot...');
  
  try {
    // Check if Chrome is available on the system
    const browserPath = execSync('which google-chrome').toString().trim();
    console.log(`Found Chrome at: ${browserPath}`);
    
    const browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to localhost:3002...');
    await page.goto('http://localhost:3002/', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'screenshot.png' });
    
    console.log('Screenshot saved to screenshot.png');
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshot:', error.message);
    // Fallback to a simple curl request to verify the page content
    console.log('Attempting fallback verification...');
    try {
      execSync('curl -s http://localhost:3002/ | grep -i "scroll-to-top" > curl-results.txt');
      console.log('Saved curl results to curl-results.txt');
    } catch (curlError) {
      console.error('Error with curl fallback:', curlError.message);
    }
  }
}

takeScreenshot();
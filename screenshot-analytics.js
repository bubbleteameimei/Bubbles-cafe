/**
 * Analytics Dashboard Screenshot Script
 * 
 * This script captures a screenshot of the analytics dashboard to verify 
 * that the data is being displayed correctly after fixing the API endpoints.
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function captureAnalyticsDashboard() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  
  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport to a standard desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to analytics dashboard...');
    await page.goto('http://localhost:3002/admin/analytics-dashboard', {
      waitUntil: 'networkidle2',
      timeout: 60000 // Increased timeout to allow all data to load
    });
    
    // Wait for key elements to render
    console.log('Waiting for analytics content to load...');
    await page.waitForSelector('.analytics-container', { timeout: 10000 })
      .catch(() => console.log('Warning: Could not find .analytics-container'));
    
    // Wait a bit longer to make sure all data has loaded
    await page.waitForTimeout(3000);
    
    // Take the screenshot
    console.log('Capturing screenshot...');
    const screenshotPath = path.join(process.cwd(), 'screenshots');
    
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(screenshotPath)) {
      fs.mkdirSync(screenshotPath, { recursive: true });
    }
    
    const filepath = path.join(screenshotPath, 'analytics-dashboard.png');
    await page.screenshot({ path: filepath, fullPage: true });
    
    console.log(`Screenshot saved to: ${filepath}`);
    
    // Report on what's visible
    const analyticsStatus = await page.evaluate(() => {
      const container = document.querySelector('.analytics-container');
      
      if (!container) {
        return {
          found: false,
          message: 'Analytics container not found'
        };
      }
      
      const readingTimeChart = document.querySelector('[data-testid="reading-time-chart"]');
      const deviceChart = document.querySelector('[data-testid="device-distribution-chart"]');
      const siteStats = document.querySelector('[data-testid="site-stats"]');
      
      return {
        found: true,
        components: {
          readingTimeChart: !!readingTimeChart,
          deviceChart: !!deviceChart,
          siteStats: !!siteStats
        },
        visibleData: {
          totalViews: document.querySelector('[data-stat="totalViews"]')?.textContent || 'Not found',
          uniqueVisitors: document.querySelector('[data-stat="uniqueVisitors"]')?.textContent || 'Not found',
          avgReadTime: document.querySelector('[data-stat="avgReadTime"]')?.textContent || 'Not found'
        },
        message: 'Analytics dashboard evaluation complete'
      };
    });
    
    console.log('\nAnalytics Dashboard Status:');
    console.log('-------------------------');
    if (analyticsStatus.found) {
      console.log('- Analytics container found');
      console.log('- Components present:');
      console.log(`  - Reading Time Chart: ${analyticsStatus.components.readingTimeChart ? 'YES' : 'NO'}`);
      console.log(`  - Device Distribution Chart: ${analyticsStatus.components.deviceChart ? 'YES' : 'NO'}`);
      console.log(`  - Site Statistics: ${analyticsStatus.components.siteStats ? 'YES' : 'NO'}`);
      console.log('- Visible Data:');
      console.log(`  - Total Views: ${analyticsStatus.visibleData.totalViews}`);
      console.log(`  - Unique Visitors: ${analyticsStatus.visibleData.uniqueVisitors}`);
      console.log(`  - Avg Reading Time: ${analyticsStatus.visibleData.avgReadTime}`);
    } else {
      console.log(`- ${analyticsStatus.message}`);
    }
    
    // Capture network requests to analytics endpoints
    const requests = await page.evaluate(() => {
      if (!window.performance || !window.performance.getEntriesByType) {
        return { error: 'Performance API not available' };
      }
      
      const resources = window.performance.getEntriesByType('resource');
      return resources
        .filter(res => res.name.includes('/api/analytics/'))
        .map(res => ({
          name: res.name,
          duration: Math.round(res.duration),
          status: res.responseStatus || 'unknown'
        }));
    });
    
    console.log('\nAnalytics API Requests:');
    console.log('----------------------');
    if (requests.error) {
      console.log(`Error: ${requests.error}`);
    } else if (requests.length === 0) {
      console.log('No analytics API requests detected');
    } else {
      requests.forEach(req => {
        console.log(`- ${req.name} (${req.duration}ms, status: ${req.status})`);
      });
    }
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the screenshot capture
(async () => {
  try {
    await captureAnalyticsDashboard();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
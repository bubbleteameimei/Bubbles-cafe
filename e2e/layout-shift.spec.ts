import { test, expect } from '@playwright/test';

// Simple CLS observer injected into the page context
async function startCLSObserver(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    (window as any).__cls = { value: 0 };
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any) {
          // CLS excludes shifts after recent input
          if (!entry.hadRecentInput) {
            (window as any).__cls.value += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true } as any);
      (window as any).__clsObserver = observer;
    } catch {
      // Ignore if not supported
    }
  });
}

async function getCLS(page: import('@playwright/test').Page) {
  const value = await page.evaluate(() => (window as any).__cls?.value || 0);
  return typeof value === 'number' ? value : 0;
}

test.describe('Layout shift checks (CLS)', () => {
  test('Search overlay open/close keeps CLS minimal', async ({ page }) => {
    await page.goto('/');
    await startCLSObserver(page);

    // Open search overlay
    await page.click('#nav-search-button');
    await page.waitForTimeout(250);

    // Close via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);

    const cls = await getCLS(page);
    // Threshold: aim for < 0.01 CLS during this interaction
    expect(cls).toBeLessThan(0.02);
  });

  test('Sidebar open/close keeps CLS minimal', async ({ page }) => {
    await page.goto('/');
    await startCLSObserver(page);

    // Open sidebar (sheet)
    await page.click('#sidebar-toggle');
    await page.waitForTimeout(300);

    // Close via Escape (Radix dialog responds to Escape)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const cls = await getCLS(page);
    expect(cls).toBeLessThan(0.02);
  });

  test('Reader distraction-free toggle does not reflow content width', async ({ page }) => {
    await page.goto('/reader');
    // Wait for story content to be present
    await page.waitForSelector('.story-content');
    await startCLSObserver(page);

    // Toggle distraction-free UI by clicking story content
    await page.click('.story-content');
    await page.waitForTimeout(400);

    // Toggle back
    await page.click('.story-content');
    await page.waitForTimeout(400);

    const cls = await getCLS(page);
    expect(cls).toBeLessThan(0.02);
  });
});
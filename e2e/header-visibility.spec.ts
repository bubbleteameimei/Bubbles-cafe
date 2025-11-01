import { test, expect } from '@playwright/test';

/**
 * Verifies that the main navbar is fully visible at the top of the viewport
 * and does not get cut off or scroll under the top edge.
 */
test.describe('Header visibility and positioning', () => {
  async function getHeaderRect(page: import('@playwright/test').Page) {
    const rect = await page.evaluate(() => {
      const el = document.querySelector('.navbar-root') as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height, zIndex: getComputedStyle(el).zIndex };
    });
    return rect as null | { top: number; bottom: number; height: number; zIndex: string };
  }

  test('header is pinned to top on home', async ({ page }) => {
    await page.goto('/');
    const rect = await getHeaderRect(page);
    expect(rect).not.toBeNull();
    if (!rect) return;

    // Header should be at the very top or within a small tolerance
    expect(rect.top).toBeLessThan(2);
    expect(rect.height).toBeGreaterThanOrEqual(56);
    // The header should be above regular content
    expect(Number(rect.zIndex || 0)).toBeGreaterThan(10);

    // Scroll down and back up to ensure it remains fixed
    await page.evaluate(() => window.scrollTo(0, 500));
    const rectAfterScroll = await getHeaderRect(page);
    expect(rectAfterScroll?.top).toBeLessThan(2);

    await page.evaluate(() => window.scrollTo(0, 0));
    const rectAfterTop = await getHeaderRect(page);
    expect(rectAfterTop?.top).toBeLessThan(2);
  });

  test('header remains fully visible on reader route', async ({ page }) => {
    await page.goto('/reader');
    const rect = await getHeaderRect(page);
    expect(rect).not.toBeNull();
    if (!rect) return;

    expect(rect.top).toBeLessThan(2);
    expect(rect.height).toBeGreaterThanOrEqual(56);

    // Scroll to simulate reading
    await page.evaluate(() => window.scrollTo(0, 800));
    const rectAfterScroll = await getHeaderRect(page);
    expect(rectAfterScroll?.top).toBeLessThan(2);
  });
});
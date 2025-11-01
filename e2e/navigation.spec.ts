import { test, expect } from '@playwright/test';

test.describe('Navigation UI', () => {
  test('search overlay appears above header', async ({ page }) => {
    await page.goto('/');
    // Open search
    await page.click('#nav-search-button');

    // Ensure search input is visible and interactive
    const input = page.getByPlaceholder('Search for stories...');
    await expect(input).toBeVisible();

    // Type to ensure the overlay receives events
    await input.fill('a');

    // Compare z-index: overlay should be above header wrapper
    const overlayZ = await page.evaluate(() => {
      const el = document.querySelector('header div[class*="z-[120]"]');
      return el ? Number(getComputedStyle(el).zIndex || 0) : 0;
    });
    const headerZ = await page.evaluate(() => {
      const el = document.querySelector('.navbar-root');
      return el ? Number(getComputedStyle(el).zIndex || 0) : 0;
    });

    expect(overlayZ).toBeGreaterThan(headerZ);
  });

  test('mobile sidebar sheet has required data attributes and closes on swipe (mobile)', async ({ page }) => {
    await page.goto('/');
    // Open sheet
    await page.click('#sidebar-toggle');

    const sheet = page.locator('[data-sidebar="sidebar"][data-mobile="true"]');
    await expect(sheet).toBeVisible();

    // Verify attributes present
    const dataMobile = await sheet.getAttribute('data-mobile');
    expect(dataMobile).toBe('true');

    // Try to simulate a horizontal swipe to close in mobile emulation
    await page.evaluate(() => {
      const el = document.querySelector('[data-sidebar="sidebar"][data-mobile="true"]') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      // Helper to fire a touch event
      function fire(type: string, x: number, y: number) {
        // Some environments may not support Touch constructor; guard softly
        const touchInit: any = {
          identifier: Date.now(),
          target: el,
          clientX: x,
          clientY: y,
          radiusX: 2,
          radiusY: 2,
          force: 1,
        };
        let touch: any;
        try {
          touch = new (window as any).Touch(touchInit);
        } catch {
          // Fallback: minimal struct
          touch = touchInit;
        }
        const eventInit: any = {
          bubbles: true,
          cancelable: true,
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
        };
        try {
          const ev = new (window as any).TouchEvent(type, eventInit);
          el.dispatchEvent(ev);
        } catch {
          // Fallback custom event
          const ev = new Event(type, { bubbles: true, cancelable: true });
          el.dispatchEvent(ev);
        }
      }

      const startX = rect.right - 10;
      const y = rect.top + rect.height / 2;
      fire('touchstart', startX, y);
      fire('touchmove', startX - 80, y);
      fire('touchend', startX - 80, y);
    });

    // Allow UI to process close
    await page.waitForTimeout(250);

    // Sheet should be hidden or detached
    await expect(sheet).toBeHidden();
  });
});
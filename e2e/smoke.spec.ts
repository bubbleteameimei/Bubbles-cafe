import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('/');
  // Accept either straight or curly apostrophe
  await expect(page).toHaveTitle(/Bubble[’']s Cafe/i);
});


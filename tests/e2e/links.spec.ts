import { test, expect } from '@playwright/test';

test('Links: internal links resolve', async ({ page }) => {
  await page.goto('/en-US/');
  const links = await page.locator('a[href^="/"]').all();
  for (const a of links) {
    const href = await a.getAttribute('href');
    if (!href) continue;
    const resp = await page.request.get(href);
    expect(resp.status()).toBeLessThan(400);
  }
});



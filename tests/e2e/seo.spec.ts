import { test, expect } from '@playwright/test';

test('SEO: title/description/canonical/hreflang/json-ld', async ({ page }) => {
  await page.goto('/en-US/');
  await expect(page).toHaveTitle(/moonpacket/i);
  const desc = page.locator('meta[name="description"]');
  await expect(desc).toHaveAttribute('content', /crypto|red packets/i);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /en-US/);
  const alternates = await page.locator('link[rel="alternate"]').all();
  expect(alternates.length).toBeGreaterThanOrEqual(34);
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
});



import { test, expect } from '@playwright/test';

test('LiveMetrics updates BTC price text after interval', async ({ page }) => {
  // First response
  await page.route('**/data/placeholders.json', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        as_of: new Date().toISOString(),
        prices: { BTC_USDT: 100 },
        red_packets: { total_sent: 1, total_claimed: 1, total_amount_usdt: 1 },
      }),
    });
  });

  await page.goto('/en-US/');
  const metric = page.locator('[data-api-path="prices.BTC_USDT"] [data-metric]');
  await expect(metric).toContainText('100');

  // Update route to return a different value
  await page.unroute('**/data/placeholders.json');
  await page.route('**/data/placeholders.json', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        as_of: new Date().toISOString(),
        prices: { BTC_USDT: 123 },
        red_packets: { total_sent: 1, total_claimed: 1, total_amount_usdt: 1 },
      }),
    });
  });

  // Wait slightly longer than dev interval (2s)
  await page.waitForTimeout(2500);
  await expect(metric).toContainText('123');
});



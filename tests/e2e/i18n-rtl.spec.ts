import { test, expect } from '@playwright/test';

test('i18n: html lang and dir for LTR', async ({ page }) => {
  await page.goto('/en-US/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('i18n: html lang and dir for RTL', async ({ page }) => {
  await page.goto('/ar-SA/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar-SA');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});



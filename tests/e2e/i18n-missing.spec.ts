import { test, expect } from '@playwright/test';

const paths = ['/en-US/', '/ar-SA/'];

test.describe('i18n missing keys', () => {
  for (const p of paths) {
    test(`no TODO placeholder on ${p}`, async ({ page }) => {
      await page.goto(p);
      // 檢查頁面中不應包含占位標記
      const hasTodo = await page.locator(':text("⟪TODO⟫")').count();
      expect(hasTodo, `Found ⟪TODO⟫ placeholder on ${p}`).toBe(0);
    });
  }
});

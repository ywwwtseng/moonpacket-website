import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test('A11y: no violations on home', async ({ page }) => {
  await page.goto('/en-US/');
  // inject axe
  await page.addScriptTag({ path: require.resolve('axe-core') });
  const result = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run();
  });
  expect(result.violations).toEqual([]);
});



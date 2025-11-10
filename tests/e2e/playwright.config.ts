import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: __dirname,
  testIgnore: ['**/../unit/**', '**/../integration/**'],
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'pnpm preview',
    port: 4321,
    reuseExistingServer: true,
  },
});



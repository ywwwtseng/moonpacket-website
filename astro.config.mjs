import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';
import { rehypeBrandword } from './src/plugins/rehype-brandword.ts';

// SITE/base handling
// - In dev, do not require SITE to be set; base defaults to '/'
// - When SITE is a valid absolute URL, derive base from its pathname
const RAW_SITE = process.env.SITE;
let SITE = undefined;
let BASE = '/';
try {
  if (RAW_SITE && /^https?:\/\//.test(RAW_SITE)) {
    const u = new URL(RAW_SITE);
    SITE = u.toString();
    // BASE = (u.pathname || '/').replace(/\/$/, '') || '/';
    BASE = '/';
  }
} catch (_) {
  SITE = undefined;
  BASE = '/';
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [react()],
  output: 'static',
  // 禁用 devToolbar 的 audit/a11y 功能，避免开发时控制台报错
  // （这些功能会在生产构建时自动禁用，不影响 build 输出）
  devToolbar: {
    enabled: true,
    apps: {
      audit: {
        enabled: false
      }
    }
  },
  // 關閉 Astro 預取，以避免產生包含現代語法（?.、??）的客戶端腳本
  prefetch: false,
  // 統一 build 目標，讓依賴也降階編譯，避免 '?.' / '??' 語法
  build: {
    outDir: process.env.OUT_DIR || 'dist',
    target: 'es2017'
  },
  vite: {
    // Downlevel optional chaining et al. to avoid SyntaxError in older runtimes
    esbuild: {
      target: 'es2017'
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssMinify: true,
      chunkSizeWarningLimit: 300,
      target: 'es2017'
    },
  },
  markdown: {
    rehypePlugins: [rehypeBrandword]
  }
});



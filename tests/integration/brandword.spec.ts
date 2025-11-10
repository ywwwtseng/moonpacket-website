import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

async function read(urlPath: string) {
  const filePath = path.resolve(process.cwd(), 'dist', urlPath.replace(/^\//, ''), 'index.html');
  return fs.readFile(filePath, 'utf-8');
}

describe('Brand word & layout', () => {
  it('nav uses navy brand word and hero uses gradient', async () => {
    const html = await read('zh-TW');
    expect(html).toMatch(/class="brand-word[^"]*"[^>]*data-tone="navy"/);
    expect(html).toMatch(/class="[^"]*brand-word[^"]*"[^>]*data-tone="gradient"/);
  });

  it('html has correct lang and dir (LTR)', async () => {
    const html = await read('en-US');
    expect(html).toMatch(/<html lang="en-US" dir="ltr">/);
  });

  it('html has correct lang and dir (RTL)', async () => {
    const html = await read('ar-SA');
    expect(html).toMatch(/<html lang="ar-SA" dir="rtl">/);
  });
});



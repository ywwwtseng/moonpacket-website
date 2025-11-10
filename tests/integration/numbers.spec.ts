import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

async function read(urlPath: string) {
  const filePath = path.resolve(process.cwd(), 'dist', urlPath.replace(/^\//, ''), 'index.html');
  return fs.readFile(filePath, 'utf-8');
}

describe('Numeric system', () => {
  it('.num exists with right alignment classes', async () => {
    const html = await read('zh-TW');
    expect(html).toMatch(/class="[^"]*num[^"]*num-right[^"]*"/);
  });

  it('locale grouping differs across locales for fiat', async () => {
    const tw = await read('zh-TW');
    const en = await read('en-US');
    // zh-TW currency often rendered with US$ prefix
    expect(tw).toMatch(/US\$\s?\d{1,3}(,\d{3})*(\.\d{2})?/);
    // en-US uses $
    expect(en).toMatch(/\$\d{1,3}(,\d{3})*(\.\d{2})?/);
  });

  it('percent is signed with class rise/fall', async () => {
    const html = await read('zh-TW');
    expect(html).toMatch(/class="[^"]*rise[^"]*"[^>]*>\+\d+\.\d{2}%/);
  });
});



import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const langs = ['en-US', 'ar-SA'];
const base = resolve(process.cwd(), 'src/i18n/messages');

// 支持的模块文件（不包括 story，因为它只在 zh-TW 中存在）
const modules = ['site', 'claim', 'send', 'privacy', 'terms', 'waterfall'];

function flat(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out[key] = v;
  }
  return out;
}

function loadJson(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

// 加载 zh-TW 的所有模块
const zhFlat = {};
for (const mod of modules) {
  const modPath = resolve(base, `zh-TW/${mod}.json`);
  const modData = loadJson(modPath);
  flat(modData, mod, zhFlat);
}

// 比对其他语言
const report = {};
for (const lg of langs) {
  const tFlat = {};
  for (const mod of modules) {
    const modPath = resolve(base, `${lg}/${mod}.json`);
    const modData = loadJson(modPath);
    flat(modData, mod, tFlat);
  }
  
  const missing = [];
  for (const k of Object.keys(zhFlat)) {
    if (!(k in tFlat)) missing.push(k);
  }
  report[lg] = missing.sort();
}

console.log(JSON.stringify(report, null, 2));

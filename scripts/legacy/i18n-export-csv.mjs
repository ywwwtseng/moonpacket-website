import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const base = resolve(process.cwd(), 'src/i18n/messages');
const modules = ['site', 'claim', 'send', 'privacy', 'terms', 'waterfall'];

// 所有支持的語言
const allLangs = [
  'zh-TW', 'en-US', 'en-GB', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA', 
  'de-DE', 'fr-FR', 'es-ES', 'pt-BR', 'pt-PT', 'ru-RU', 'it-IT', 
  'nl-NL', 'sv-SE', 'da-DK', 'fi-FI', 'no-NO', 'pl-PL', 'cs-CZ', 
  'hu-HU', 'ro-RO', 'tr-TR', 'uk-UA', 'he-IL', 'fa-IR', 'ur-PK', 
  'hi-IN', 'id-ID', 'vi-VN', 'th-TH', 'bn-BD'
];

function flat(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flat(v, key, out);
    } else {
      out[key] = v;
    }
  }
  return out;
}

function loadJSON(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}

function escapeCSV(str) {
  if (str == null) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// 收集所有鍵值
const allKeys = {};

for (const mod of modules) {
  const zhPath = resolve(base, `zh-TW/${mod}.json`);
  const zhData = loadJSON(zhPath);
  const zhFlat = flat(zhData);
  
  for (const key of Object.keys(zhFlat)) {
    const fullKey = `${mod}.${key}`;
    allKeys[fullKey] = {};
  }
}

// 為每個鍵收集所有語言的值
for (const fullKey of Object.keys(allKeys)) {
  const [mod, ...keyParts] = fullKey.split('.');
  const key = keyParts.join('.');
  
  for (const lang of allLangs) {
    const langPath = resolve(base, `${lang}/${mod}.json`);
    const langData = loadJSON(langPath);
    const langFlat = flat(langData);
    allKeys[fullKey][lang] = langFlat[key] || '';
  }
}

// 輸出 CSV
// Header
const header = ['module', 'key', ...allLangs].join(',');
console.log(header);

// Rows
for (const fullKey of Object.keys(allKeys).sort()) {
  const [mod, ...keyParts] = fullKey.split('.');
  const key = keyParts.join('.');
  
  const row = [
    escapeCSV(mod),
    escapeCSV(key),
    ...allLangs.map(lang => escapeCSV(allKeys[fullKey][lang]))
  ];
  
  console.log(row.join(','));
}


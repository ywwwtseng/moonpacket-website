// scripts/i18n-export.v3.mjs
//
// Usage:
//   node scripts/i18n-export.v3.mjs > i18n-export.csv
//
// This script scans src/i18n/messages/<locale>/**/*.json
// and outputs a CSV with columns:
// namespace,key,zh-TW,zh-CN,en-US,...(other locales in stable order)
//
// Rules:
// - We only export leaf string values, and string[] entries (as rows key.xxx[index])
// - We skip objects, nested objects that aren't string or string[]
// - We keep HTML tags (<br>, <span class="brand-mark">...) as-is
//
// IMPORTANT:
// - locales.config.ts defines ALL_LOCALE_CODES and we import/use that here
//

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// We load locale config at runtime
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..'); // repo root (../ from scripts/)

// Import ALL_LOCALE_CODES from the TypeScript config
// Since we're in .mjs, we need to use dynamic import with a .ts file
// But TypeScript files need to be compiled, so we'll read the file and parse it
// For now, let's define it inline based on the config
const ALL_LOCALE_CODES = [
  'ar-SA', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR',
  'en-GB', 'en-US', 'es-ES', 'fa-IR', 'fi-FI', 'fr-FR',
  'he-IL', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP',
  'ko-KR', 'nl-NL', 'no-NO', 'pl-PL', 'pt-BR', 'pt-PT',
  'ro-RO', 'ru-RU', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA',
  'ur-PK', 'vi-VN', 'zh-CN', 'zh-TW'
];

const MESSAGES_ROOT = path.join(ROOT, 'src', 'i18n', 'messages');

// Parse CLI arguments
const argv = process.argv.slice(2);
const getArg = (name, def = null) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
const hasFlag = (name) => argv.includes(`--${name}`);

const keysFilterRaw = getArg('keys', null);
const seoOnlyFlag = hasFlag('seo-only');

// Parse keysFilter
let keyMatchers = null;
if (keysFilterRaw) {
  keyMatchers = keysFilterRaw.split(',').map(s => s.trim()).filter(Boolean).map(glob => {
    const re = new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    return (k) => re.test(k);
  });
}

// Preset seo-only mode
if (!keyMatchers && seoOnlyFlag) {
  keyMatchers = [(k) => {
    // Match keys where key part starts with 'seo', 'og', or 'twitter'
    const parts = k.split('.');
    if (parts.length < 2) return false;
    const keyPart = parts.slice(1).join('.'); // everything after namespace
    return keyPart.startsWith('seo.') || keyPart.startsWith('og.') || keyPart.startsWith('twitter.');
  }];
}

// we want zh-TW, zh-CN, en-US first in CSV, then the rest in alphabetical
const PRIORITY_ORDER = ['zh-TW', 'zh-CN', 'en-US'];

const orderedLocales = [
  ...PRIORITY_ORDER,
  ...ALL_LOCALE_CODES.filter(
    (code) => !PRIORITY_ORDER.includes(code)
  ),
];

// flatten JSON into { 'faq.q1_title': "string", 'faq.q1_body.0': "line1", ... }
function flattenMessages(obj, prefix = '') {
  const out = {};

  function walk(value, curKey) {
    if (typeof value === 'string') {
      out[curKey] = value;
      return;
    }
    if (Array.isArray(value)) {
      // array of strings => each index is its own row
      value.forEach((item, idx) => {
        if (typeof item === 'string') {
          out[`${curKey}.${idx}`] = item;
        }
      });
      return;
    }
    if (value && typeof value === 'object') {
      // go deeper
      for (const [k, v] of Object.entries(value)) {
        walk(v, curKey ? `${curKey}.${k}` : k);
      }
      return;
    }
    // other types ignored
  }

  walk(obj, prefix);
  return out;
}

// read json file safely
function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// gather data structure:
// rowsMap[namespace.keyPath] = { namespace, keyPath, [locale]: text }
const rowsMap = new Map();

// step 1: loop all locales
for (const locale of ALL_LOCALE_CODES) {
  const localeDir = path.join(MESSAGES_ROOT, locale);

  if (!fs.existsSync(localeDir) || !fs.statSync(localeDir).isDirectory()) {
    // locale folder missing? skip
    continue;
  }

  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const namespace = file.replace(/\.json$/, '');
    const fullPath = path.join(localeDir, file);
    const jsonData = readJSON(fullPath);

    const flat = flattenMessages(jsonData);

    for (const [keyPath, text] of Object.entries(flat)) {
      const rowId = `${namespace}:::${keyPath}`;
      if (!rowsMap.has(rowId)) {
        rowsMap.set(rowId, {
          namespace,
          key: keyPath,
        });
      }
      rowsMap.get(rowId)[locale] = text;
    }
  }
}

// step 2: build CSV
// header row
const headerCols = ['namespace', 'key', ...orderedLocales];
const csvLines = [];
csvLines.push(headerCols.map(escapeCSV).join(','));

// each row stable-sorted by namespace+key
const sortedRows = Array.from(rowsMap.values()).sort((a, b) => {
  if (a.namespace === b.namespace) {
    return a.key.localeCompare(b.key);
  }
  return a.namespace.localeCompare(b.namespace);
});

for (const row of sortedRows) {
  // Apply key filter if specified
  const fullKey = `${row.namespace}.${row.key}`;
  if (keyMatchers && !keyMatchers.some(fn => fn(fullKey))) {
    continue;
  }
  
  const cols = [
    row.namespace,
    row.key,
    ...orderedLocales.map(loc => row[loc] ?? ''),
  ];
  csvLines.push(cols.map(escapeCSV).join(','));
}

// print to stdout
process.stdout.write(csvLines.join('\n') + '\n');

// basic CSV escaping: wrap in quotes if contains comma, quote, or newline
function escapeCSV(val) {
  if (val == null) return '';
  const s = String(val);
  if (/[,"\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

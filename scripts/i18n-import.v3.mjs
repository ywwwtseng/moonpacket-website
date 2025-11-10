// scripts/i18n-import.v3.mjs
//
// Usage:
//   node scripts/i18n-import.v3.mjs i18n-translated.csv
//
// This will read the CSV, then merge values back into
// src/i18n/messages/<locale>/<namespace>.json
//
// Safety rules:
// - We only update if the CSV cell is non-empty
// - We only assign to existing string or string[] entries (via .index)
// - We DO NOT create brand new keys that never existed
// - We DO NOT modify objects
//

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MESSAGES_ROOT = path.join(ROOT, 'src', 'i18n', 'messages');

// Define ALL_LOCALE_CODES inline (same as export script)
const ALL_LOCALE_CODES = [
  'ar-SA', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR',
  'en-GB', 'en-US', 'es-ES', 'fa-IR', 'fi-FI', 'fr-FR',
  'he-IL', 'hi-IN', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP',
  'ko-KR', 'nl-NL', 'no-NO', 'pl-PL', 'pt-BR', 'pt-PT',
  'ro-RO', 'ru-RU', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA',
  'ur-PK', 'vi-VN', 'zh-CN', 'zh-TW'
];

// same priority order we used in export
const PRIORITY_ORDER = ['zh-TW', 'zh-CN', 'en-US'];
const orderedLocales = [
  ...PRIORITY_ORDER,
  ...ALL_LOCALE_CODES.filter(code => !PRIORITY_ORDER.includes(code)),
];

// read CSV
const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node scripts/i18n-import.v3.mjs <translated.csv>');
  process.exit(1);
}
const csvRaw = fs.readFileSync(inputFile, 'utf-8');
const { header, rows } = parseCSV(csvRaw);

// minimal CSV parser assuming our own format (no embedded newlines in header cells)
function parseCSV(str) {
  const lines = str.replace(/\r/g, '').split('\n').filter(l => l.trim() !== '');
  // naive parse that respects quotes
  function splitLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i+1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
    }
    out.push(cur);
    return out;
  }

  const header = splitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cols = splitLine(line);
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx] ?? '';
    });
    return obj;
  });
  return { header, rows };
}

/**
 * We'll build a map:
 * updates[locale][namespace][keyPath] = translatedString
 */
const updates = {};
for (const loc of orderedLocales) {
  updates[loc] = {};
}

for (const r of rows) {
  const namespace = r.namespace;
  const keyPath = r.key;
  if (!namespace || !keyPath) continue;

  for (const loc of orderedLocales) {
    if (!(loc in r)) continue;
    const newVal = r[loc].trim();
    if (!newVal) continue; // empty means "no change"

    if (!updates[loc][namespace]) {
      updates[loc][namespace] = {};
    }
    updates[loc][namespace][keyPath] = newVal;
  }
}

// Now apply updates into each locale's namespace.json
for (const loc of orderedLocales) {
  const localeDir = path.join(MESSAGES_ROOT, loc);
  if (!fs.existsSync(localeDir)) continue;

  const namespacesForLoc = updates[loc];
  if (!namespacesForLoc) continue;

  for (const [namespace, kv] of Object.entries(namespacesForLoc)) {
    const filePath = path.join(localeDir, `${namespace}.json`);
    if (!fs.existsSync(filePath)) continue;

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // apply kv to jsonData with safety
    for (const [keyPath, newStr] of Object.entries(kv)) {
      applySafeUpdate(jsonData, keyPath, newStr);
    }

    // write back pretty
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2) + '\n', 'utf-8');
  }
}

/**
 * Only update if:
 * - jsonData[keyPath] is string
 * - or jsonData[keyRoot][index] is string in an array
 */
function applySafeUpdate(rootObj, dottedKey, newStr) {
  const parts = dottedKey.split('.');
  // check if last part is numeric => array index?
  // but we still need to resolve path
  if (parts.length === 0) return;

  // Try array index case:
  // e.g. faq.q1_body.0
  const last = parts[parts.length - 1];
  const maybeIndex = Number.isInteger(Number(last)) ? Number(last) : null;

  if (maybeIndex !== null) {
    // path without last
    const arrPath = parts.slice(0, -1);
    const parentArr = resolvePath(rootObj, arrPath);
    if (Array.isArray(parentArr) && typeof parentArr[maybeIndex] === 'string') {
      parentArr[maybeIndex] = newStr;
    }
    return;
  }

  // regular string path
  const parentPath = parts.slice(0, -1);
  const leafKey = parts[parts.length - 1];
  const parentObj = resolvePath(rootObj, parentPath);
  if (parentObj && typeof parentObj[leafKey] === 'string') {
    parentObj[leafKey] = newStr;
  }
}

function resolvePath(obj, pathParts) {
  let cur = obj;
  for (const p of pathParts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

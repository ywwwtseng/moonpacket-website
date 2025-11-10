import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

// 我们的 messages 翻译目录
const MESSAGES_DIR = path.resolve('src/i18n/messages');

// 这次是救援模式：我们允许写回 zh-TW / zh-CN / en-US
// 之后常规模式会移除 zh-TW（即使用正式的 v4 脚本）
const LOCALES_TO_WRITE = ['zh-TW', 'zh-CN', 'en-US'];

const HEADER_NAMESPACE = 'namespace';
const HEADER_KEY = 'key';
const HEADER_ZH_TW = 'zh-TW';
const HEADER_ZH_CN = 'zh-CN';
const HEADER_EN_US = 'en-US';

function splitKeyPath(keyPath) {
  return keyPath.split('.');
}

// 确认 keyPath 是否真实存在于该 JSON 的对象结构中，并返回 parent/lastKey
function resolveExistingPath(obj, parts) {
  let parent = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const seg = parts[i];
    const isIndex = /^\d+$/.test(seg);

    if (isIndex) {
      const idx = Number(seg);
      if (!Array.isArray(parent) || parent[idx] === undefined) {
        return { exists: false };
      }
      parent = parent[idx];
    } else {
      if (parent == null || typeof parent !== 'object' || !(seg in parent)) {
        return { exists: false };
      }
      parent = parent[seg];
    }
  }

  const lastSeg = parts[parts.length - 1];
  const isLastIndex = /^\d+$/.test(lastSeg);

  if (isLastIndex) {
    const idx = Number(lastSeg);
    if (!Array.isArray(parent) || parent[idx] === undefined) {
      return { exists: false };
    }
    return {
      exists: true,
      parent,
      lastKey: idx,
      currentValue: parent[idx],
    };
  } else {
    if (parent == null || typeof parent !== 'object' || !(lastSeg in parent)) {
      return { exists: false };
    }
    return {
      exists: true,
      parent,
      lastKey: lastSeg,
      currentValue: parent[lastSeg],
    };
  }
}

// 覆盖规则：
// - 目标 key 必须已经存在
// - 当前值必须是 string 或数组里某项 string
// - 新文本必须非空（避免用空字串清掉东西）
function tryUpdateValue(targetJson, keyPath, newText) {
  if (!newText || !newText.trim()) {
    return false;
  }

  const parts = splitKeyPath(keyPath);
  const { exists, parent, lastKey, currentValue } = resolveExistingPath(targetJson, parts);
  if (!exists) return false;

  if (typeof currentValue === 'string') {
    parent[lastKey] = newText;
    return true;
  }

  // 如果是数组元素，也要确保原本是 string
  if (Array.isArray(parent) && typeof parent[lastKey] === 'string') {
    parent[lastKey] = newText;
    return true;
  }

  return false;
}

function loadLocaleNamespace(locale, namespace) {
  const filePath = path.join(MESSAGES_DIR, locale, `${namespace}.json`);
  if (!fs.existsSync(filePath)) {
    return { filePath, json: null };
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return { filePath, json: JSON.parse(raw) };
}

function saveLocaleNamespace(filePath, jsonObj) {
  const out = JSON.stringify(jsonObj, null, 2) + '\n';
  fs.writeFileSync(filePath, out, 'utf8');
}

// 入口
const csvFile = process.argv[2] || 'i18n-export.csv';
if (!fs.existsSync(csvFile)) {
  console.error(`[ERROR] CSV file not found: ${csvFile}`);
  process.exit(1);
}

const csvRaw = fs.readFileSync(csvFile, 'utf8');
const records = parse(csvRaw, {
  columns: true,
  skip_empty_lines: true,
});

// 预聚合
// { [namespace]: [ { keyPath, zh-TW, zh-CN, en-US } ] }
const byNamespace = {};
for (const row of records) {
  const ns = row[HEADER_NAMESPACE]?.trim();
  const keyPath = row[HEADER_KEY]?.trim();
  if (!ns || !keyPath) continue;
  if (!byNamespace[ns]) byNamespace[ns] = [];
  byNamespace[ns].push({
    keyPath,
    'zh-TW': row[HEADER_ZH_TW] ?? '',
    'zh-CN': row[HEADER_ZH_CN] ?? '',
    'en-US': row[HEADER_EN_US] ?? '',
  });
}

for (const locale of LOCALES_TO_WRITE) {
  console.log(`\n[RESCUE] Restoring locale: ${locale}`);

  for (const [namespace, entries] of Object.entries(byNamespace)) {
    const { filePath, json } = loadLocaleNamespace(locale, namespace);
    if (!json) {
      // 该 namespace 这个语言还没文件，就跳过
      continue;
    }

    let touched = false;

    for (const entry of entries) {
      const newText = entry[locale] ?? '';
      const updated = tryUpdateValue(json, entry.keyPath, newText);
      if (updated) touched = true;
    }

    if (touched) {
      saveLocaleNamespace(filePath, json);
      console.log(`  ✔ ${locale}/${namespace}.json rescued`);
    } else {
      console.log(`  • ${locale}/${namespace}.json no change`);
    }
  }
}

console.log('\nRescue import complete. zh-TW / zh-CN / en-US all refreshed from CSV.');


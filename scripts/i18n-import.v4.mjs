#!/usr/bin/env node
/**
 * i18n-import.v4.mjs
 *
 * 安全导入规则：
 * - 读取 CSV（宽表：namespace,key,zh-TW,zh-CN,en-US,...）
 * - 只会尝试写回 zh-CN / en-US
 * - zh-TW 绝对不会被覆盖
 * - 其他语言 (ja-JP… ) 忽略
 * - 仅覆盖「已存在」的 key
 * - 仅覆盖字串，或字串数组的某个索引 (foo.bar.0 / foo.bar.1 ...)
 * - CSV 里的单元格如果是空的，就跳过，不写
 *
 * 使用方式：
 *   node scripts/i18n-import.v4.mjs ./i18n-export.csv
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

// --- config -------------------------------------------------

// 我们只允许写回的语言
const TARGET_LOCALES = ['zh-CN', 'en-US'];

// 繁体 zh-TW 是母语稿，绝对不能被覆写
const SOURCE_LOCALE = 'zh-TW';

// 目前项目的 i18n 根目录
const I18N_ROOT = path.resolve('src/i18n/messages');

// ------------------------------------------------------------------
// 小工具：深度取值 / 设值
// ------------------------------------------------------------------

function getDeep(obj, segments) {
  let cur = obj;
  for (const seg of segments) {
    if (cur == null) return undefined;
    if (!(seg in cur)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

function setDeepStringOrArrayIndex(obj, segments, newValue) {
  // 我们要支持两种：
  //   foo.bar.baz （目标是字串）
  //   foo.bar.list.2 （目标是 array index 2）
  //
  // 但我们不能随意创建新结构；
  // 如果路径不存在就直接跳过。

  const lastSeg = segments[segments.length - 1];
  const parentPath = segments.slice(0, -1);
  const parent = getDeep(obj, parentPath);
  if (parent === undefined) {
    return false; // 上层路径不存在
  }

  // case: array index
  if (/^\d+$/.test(lastSeg)) {
    // parent 应该是个 array
    if (!Array.isArray(parent)) {
      return false;
    }
    const idx = Number(lastSeg);
    if (idx < 0 || idx >= parent.length) {
      return false; // 不允许扩长度
    }
    // array 里对应元素必须是字符串或可以安全替换成字符串
    if (typeof parent[idx] !== 'string') {
      return false;
    }
    parent[idx] = newValue;
    return true;
  }

  // case: normal string key
  if (!(lastSeg in parent)) {
    return false; // 不新增新 key
  }
  if (typeof parent[lastSeg] !== 'string') {
    return false; // 只覆盖字串
  }
  parent[lastSeg] = newValue;
  return true;
}

// ------------------------------------------------------------------
// 读取 CSV
// ------------------------------------------------------------------

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/i18n-import.v4.mjs ./i18n-export.csv');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}

const csvRaw = fs.readFileSync(csvPath, 'utf8');
const records = parse(csvRaw, {
  columns: true,
  skip_empty_lines: false,
});

// 我们假设 CSV 有至少这些表头：
 // namespace, key, zh-TW, zh-CN, en-US, ...(其它語言忽略)

// ------------------------------------------------------------------
// 整理 CSV：把所有同 namespace 的 key/value 聚合
// 结构:
// dataByNamespace = {
//   landing: {
//     // keyPath -> { 'zh-CN': '...', 'en-US': '...' }
//     'hero.cta_primary': { 'zh-CN': '...', 'en-US': '...' },
//     'faq.q3_body.0':    { 'zh-CN': '...', 'en-US': '...' },
//   },
//   claim: { ... },
//   ...
// }
// ------------------------------------------------------------------

const dataByNamespace = {};

for (const row of records) {
  const namespace = row['namespace']?.trim();
  const keyPath = row['key']?.trim();
  if (!namespace || !keyPath) continue;

  if (!dataByNamespace[namespace]) {
    dataByNamespace[namespace] = {};
  }
  if (!dataByNamespace[namespace][keyPath]) {
    dataByNamespace[namespace][keyPath] = {};
  }

  // 只收集我们关心的目标语言（简中、英文）
  for (const locale of TARGET_LOCALES) {
    if (row[locale] !== undefined) {
      const cellVal = row[locale];

      // 跳过空字串或空白
      if (cellVal !== null && cellVal !== undefined && String(cellVal).trim() !== '') {
        dataByNamespace[namespace][keyPath][locale] = cellVal;
      }
    }
  }
}

// ------------------------------------------------------------------
// 对每个 locale (zh-CN, en-US) -> 载入原本的 JSON -> merge -> 写回
// ------------------------------------------------------------------

for (const locale of TARGET_LOCALES) {
  const localeDir = path.join(I18N_ROOT, locale);
  if (!fs.existsSync(localeDir)) {
    console.warn(`Skip locale ${locale} because dir not found: ${localeDir}`);
    continue;
  }

  // 对这个 locale 目录里现有的所有 JSON 文件做 merge
  // 注意：我们只动现有的 namespace.json
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const namespace = path.basename(file, '.json');
    const filePath = path.join(localeDir, file);

    // 如果 CSV 没有这个 namespace 的内容，跳过
    const nsUpdates = dataByNamespace[namespace];
    if (!nsUpdates) {
      continue;
    }

    // 载入现有 JSON
    const originalRaw = fs.readFileSync(filePath, 'utf8');
    let jsonData;
    try {
      jsonData = JSON.parse(originalRaw);
    } catch (err) {
      console.error(`Cannot parse JSON for ${locale}/${namespace}: ${filePath}`);
      continue;
    }

    // 走过 CSV 给的所有 keyPath，尝试更新
    for (const [keyPath, perLocaleValues] of Object.entries(nsUpdates)) {
      const newVal = perLocaleValues[locale];
      if (newVal === undefined) {
        continue; // 这个 key 没有这个语言的值，跳过
      }

      const segments = keyPath.split('.');

      const didSet = setDeepStringOrArrayIndex(jsonData, segments, newVal);
      if (!didSet) {
        // 如果没成功，不报错，只略过
        // console.warn(`[SKIP] ${locale}/${namespace} ${keyPath} not updated (type mismatch or path missing)`);
      }
    }

    // 写回（漂亮格式）
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log(`[OK] Updated ${locale}/${namespace}.json`);
  }
}

console.log('Import done (v4). Only zh-CN & en-US were updated. zh-TW untouched.');


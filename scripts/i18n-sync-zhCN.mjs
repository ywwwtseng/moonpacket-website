#!/usr/bin/env node
/**
 * i18n-sync-zhCN.mjs
 *
 * 专门用于修复 zh-CN 翻译的脚本
 * 
 * 逻辑：
 * - 读取 CSV（必须有 zh-TW, zh-CN, en-US 列）
 * - 只更新 zh-CN/*.json 文件
 * - 如果 zh-CN 当前值是空/undefined/null 或以 _TODO_TRANSLATE_ 开头：
 *   - CSV 有 zh-CN 值 → 用 CSV 的值
 *   - CSV 没有 zh-CN 值 → 用 zh-TW 作为 fallback
 * - 如果 zh-CN 已经是正常内容（不是 TODO），保持不变
 * - zh-TW 和 en-US 绝对不改动
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const I18N_ROOT = path.resolve('src/i18n/messages');
const TARGET_LOCALE = 'zh-CN';
const FALLBACK_LOCALE = 'zh-TW';

// 判断是否为 TODO 占位符
function isTodoPlaceholder(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith('_TODO_TRANSLATE_') ||
    trimmed.startsWith('TODO_TRANSLATE_') ||
    trimmed.startsWith('__TODO_TRANSLATE_') ||
    trimmed.startsWith('⟪TODO⟫') ||
    trimmed.startsWith('（TODO）') ||
    trimmed.startsWith('(TODO)') ||
    /^TODO\s+zh-TW:/i.test(trimmed) ||
    /^TODO\s+zh-CN:/i.test(trimmed)
  );
}

// 判断是否需要更新（空值或 TODO）
function shouldUpdate(oldValue) {
  if (oldValue === null || oldValue === undefined) return true;
  if (typeof oldValue === 'string') {
    const trimmed = oldValue.trim();
    if (trimmed === '' || isTodoPlaceholder(trimmed)) return true;
  }
  return false;
}

// 深度设置值（支持数组索引）
function setDeepStringOrArrayIndex(obj, segments, newValue) {
  const lastSeg = segments[segments.length - 1];
  const parentPath = segments.slice(0, -1);
  const parent = getDeep(obj, parentPath);
  
  if (parent === undefined) {
    return false; // 上层路径不存在
  }

  // case: array index
  if (/^\d+$/.test(lastSeg)) {
    if (!Array.isArray(parent)) {
      return false;
    }
    const idx = Number(lastSeg);
    if (idx < 0 || idx >= parent.length) {
      return false; // 不允许扩长度
    }
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

function getDeep(obj, segments) {
  let cur = obj;
  for (const seg of segments) {
    if (cur == null) return undefined;
    
    // 处理数组索引
    if (/^\d+$/.test(seg)) {
      const idx = Number(seg);
      if (!Array.isArray(cur) || idx < 0 || idx >= cur.length) {
        return undefined;
      }
      cur = cur[idx];
      continue;
    }
    
    // 处理普通对象属性
    if (typeof cur !== 'object' || !(seg in cur)) {
      return undefined;
    }
    cur = cur[seg];
  }
  return cur;
}

// 主逻辑
const csvPath = process.argv[2] || './i18n-export.csv';
if (!fs.existsSync(csvPath)) {
  console.error(`[ERROR] CSV file not found: ${csvPath}`);
  process.exit(1);
}

console.log(`[SYNC] Reading CSV: ${csvPath}`);
const csvRaw = fs.readFileSync(csvPath, 'utf8');
const records = parse(csvRaw, {
  columns: true,
  skip_empty_lines: true,
});

// 按 namespace 聚合数据
const dataByNamespace = {};

for (const row of records) {
  const namespace = row['namespace']?.trim();
  const keyPath = row['key']?.trim();
  if (!namespace || !keyPath) continue;

  if (!dataByNamespace[namespace]) {
    dataByNamespace[namespace] = {};
  }
  
  const tw = row['zh-TW']?.trim() || '';
  const cn = row['zh-CN']?.trim() || '';
  const en = row['en-US']?.trim() || '';
  
  dataByNamespace[namespace][keyPath] = {
    'zh-TW': tw,
    'zh-CN': cn,
    'en-US': en,
  };
}

// 处理 zh-CN 目录
const zhCNDir = path.join(I18N_ROOT, TARGET_LOCALE);
if (!fs.existsSync(zhCNDir)) {
  console.error(`[ERROR] Target locale directory not found: ${zhCNDir}`);
  process.exit(1);
}

const files = fs.readdirSync(zhCNDir).filter(f => f.endsWith('.json'));
let totalUpdated = 0;
let totalSkipped = 0;
let totalFallback = 0;

for (const file of files) {
  const namespace = path.basename(file, '.json');
  const filePath = path.join(zhCNDir, file);

  // 如果 CSV 没有这个 namespace，跳过
  const nsUpdates = dataByNamespace[namespace];
  if (!nsUpdates) {
    continue;
  }

  // 加载当前 zh-CN JSON
  let jsonData;
  try {
    const originalRaw = fs.readFileSync(filePath, 'utf8');
    jsonData = JSON.parse(originalRaw);
  } catch (err) {
    console.error(`[ERROR] Cannot parse JSON: ${filePath}`);
    continue;
  }

  // 如果需要，加载 zh-TW 作为 fallback
  let fallbackData = null;
  const fallbackPath = path.join(I18N_ROOT, FALLBACK_LOCALE, file);
  if (fs.existsSync(fallbackPath)) {
    try {
      const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8');
      fallbackData = JSON.parse(fallbackRaw);
    } catch (err) {
      console.warn(`[WARN] Cannot load fallback for ${namespace}, skipping fallback`);
    }
  }

  let fileUpdated = false;
  let fileSkipped = 0;
  let fileFallback = 0;

  // 遍历所有 keyPath
  for (const [keyPath, values] of Object.entries(nsUpdates)) {
    const segments = keyPath.split('.');
    const oldValue = getDeep(jsonData, segments);
    
    // 检查是否需要更新
    if (!shouldUpdate(oldValue)) {
      // 已经是正常内容，跳过
      fileSkipped++;
      continue;
    }

    // 需要更新：优先用 CSV 的 zh-CN，否则用 CSV 的 zh-TW 或 JSON 的 zh-TW 作为 fallback
    let newValue = null;
    
    // 检查 CSV 的 zh-CN 值是否有效（非空且不是 TODO）
    const csvCN = values['zh-CN']?.trim() || '';
    const isCsvCNValid = csvCN !== '' && !isTodoPlaceholder(csvCN);
    
    if (isCsvCNValid) {
      // CSV 有有效的 zh-CN 值
      newValue = csvCN;
    } else {
      // CSV 没有有效的 zh-CN，尝试 fallback
      // 优先使用 CSV 的 zh-TW（如果有效）
      const csvTW = values['zh-TW']?.trim() || '';
      const isCsvTWValid = csvTW !== '' && !isTodoPlaceholder(csvTW);
      
      if (isCsvTWValid) {
        newValue = csvTW;
        fileFallback++;
      } else if (fallbackData) {
        // CSV 的 zh-TW 也无效，从 JSON 文件读取
        const twValue = getDeep(fallbackData, segments);
        if (twValue && typeof twValue === 'string' && twValue.trim() !== '' && !isTodoPlaceholder(twValue)) {
          newValue = twValue;
          fileFallback++;
        }
      }
    }
    
    if (newValue !== null) {
      const didSet = setDeepStringOrArrayIndex(jsonData, segments, newValue);
      if (didSet) {
        fileUpdated = true;
      }
    }
  }

  if (fileUpdated) {
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2) + '\n', 'utf8');
    console.log(`[OK] ${TARGET_LOCALE}/${namespace}.json - updated, skipped: ${fileSkipped}, fallback: ${fileFallback}`);
    totalUpdated++;
    totalSkipped += fileSkipped;
    totalFallback += fileFallback;
  } else {
    if (fileSkipped > 0) {
      console.log(`[SKIP] ${TARGET_LOCALE}/${namespace}.json - no changes needed (${fileSkipped} keys already have content)`);
    }
    totalSkipped += fileSkipped;
  }
}

console.log(`\n[SYNC] Complete:`);
console.log(`  Files updated: ${totalUpdated}`);
console.log(`  Keys skipped (already good): ${totalSkipped}`);
console.log(`  Keys using fallback: ${totalFallback}`);
console.log(`\n${TARGET_LOCALE} only. ${FALLBACK_LOCALE} and en-US untouched.\n`);


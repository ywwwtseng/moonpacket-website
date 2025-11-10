#!/usr/bin/env node
/**
 * i18n-sync-zhCN-from-zhTW.mjs
 *
 * 从 zh-TW 同步缺失内容到 zh-CN
 *
 * 规则：
 * - 基准语言：zh-TW
 * - 目标语言：zh-CN
 * - 如果 zh-CN 文件不存在，直接复制 zh-TW
 * - 如果存在，深度递归同步：
 *   - 缺少的 key：补上
 *   - 空字符串/null/undefined：补上
 *   - 包含 TODO 标记的：用 zh-TW 覆盖
 *   - 数组长度不一致：对齐并补缺
 *   - 空数组：直接用 zh-TW 的数组
 *   - 类型不一致：用 zh-TW 覆盖
 * - 不修改 zh-TW 任何内容
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT, 'src', 'i18n', 'messages');
const SOURCE_LOCALE = 'zh-TW';
const TARGET_LOCALE = 'zh-CN';

// TODO 标记模式
const TODO_PATTERNS = [
  /TODO\s+zh-TW/i,
  /（TODO）\s*zh-TW/i,
  /\(TODO\)\s*zh-TW/i,
  /__TODO_TRANSLATE/i,
  /TODO_TRANSLATE_/i,
  /⟪TODO⟫\s*zh-TW/i,
];

function isTodoPlaceholder(value) {
  if (typeof value !== 'string') return false;
  return TODO_PATTERNS.some(pattern => pattern.test(value));
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * 深度同步对象：从 source 同步缺失/空值到 target
 * 返回是否有修改
 */
function syncObject(source, target) {
  let hasChanges = false;

  // 如果 source 不是对象，直接返回
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    return false;
  }

  // 遍历 source 的所有 key
  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const sourceValue = source[key];
    const targetValue = target[key];

    // 情况1：target 没有这个 key
    if (!(key in target)) {
      target[key] = deepClone(sourceValue);
      hasChanges = true;
      continue;
    }

    // 情况2：target 有这个 key，但值是空的
    if (isEmptyValue(targetValue)) {
      target[key] = deepClone(sourceValue);
      hasChanges = true;
      continue;
    }

    // 情况3：target 的值是字符串，但是 TODO 占位符
    if (typeof targetValue === 'string' && isTodoPlaceholder(targetValue)) {
      target[key] = sourceValue;
      hasChanges = true;
      continue;
    }

    // 情况4：类型不一致，直接用 source 覆盖
    const sourceType = Array.isArray(sourceValue) ? 'array' : typeof sourceValue;
    const targetType = Array.isArray(targetValue) ? 'array' : typeof targetValue;
    if (sourceType !== targetType) {
      target[key] = deepClone(sourceValue);
      hasChanges = true;
      continue;
    }

    // 情况5：都是数组，需要对齐
    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      const arrayChanged = syncArray(sourceValue, targetValue);
      if (arrayChanged) hasChanges = true;
      continue;
    }

    // 情况6：都是对象，递归同步
    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      const objectChanged = syncObject(sourceValue, targetValue);
      if (objectChanged) hasChanges = true;
      continue;
    }

    // 其他情况：保持 target 的值不变（已经有内容了）
  }

  return hasChanges;
}

/**
 * 同步数组：对齐长度并填充缺失项
 */
function syncArray(sourceArray, targetArray) {
  let hasChanges = false;

  // 如果 target 是空数组，直接用 source 的完整数组
  if (targetArray.length === 0 && sourceArray.length > 0) {
    targetArray.push(...sourceArray.map(item => deepClone(item)));
    return true;
  }

  // 如果 source 更长，需要补上缺失的项
  if (sourceArray.length > targetArray.length) {
    for (let i = targetArray.length; i < sourceArray.length; i++) {
      targetArray.push(deepClone(sourceArray[i]));
      hasChanges = true;
    }
  }

  // 逐项对齐：检查是否有空值或 TODO 标记
  const minLength = Math.min(sourceArray.length, targetArray.length);
  for (let i = 0; i < minLength; i++) {
    const sourceItem = sourceArray[i];
    const targetItem = targetArray[i];

    // 如果 target 项是空的
    if (isEmptyValue(targetItem)) {
      targetArray[i] = deepClone(sourceItem);
      hasChanges = true;
      continue;
    }

    // 如果 target 项是字符串且是 TODO 标记
    if (typeof targetItem === 'string' && isTodoPlaceholder(targetItem)) {
      targetArray[i] = sourceItem;
      hasChanges = true;
      continue;
    }

    // 如果类型不一致
    const sourceItemType = Array.isArray(sourceItem) ? 'array' : typeof sourceItem;
    const targetItemType = Array.isArray(targetItem) ? 'array' : typeof targetItem;
    if (sourceItemType !== targetItemType) {
      targetArray[i] = deepClone(sourceItem);
      hasChanges = true;
      continue;
    }

    // 如果都是数组，递归同步
    if (Array.isArray(sourceItem) && Array.isArray(targetItem)) {
      const itemChanged = syncArray(sourceItem, targetItem);
      if (itemChanged) hasChanges = true;
      continue;
    }

    // 如果都是对象，递归同步
    if (
      typeof sourceItem === 'object' &&
      sourceItem !== null &&
      !Array.isArray(sourceItem) &&
      typeof targetItem === 'object' &&
      targetItem !== null &&
      !Array.isArray(targetItem)
    ) {
      const itemChanged = syncObject(sourceItem, targetItem);
      if (itemChanged) hasChanges = true;
      continue;
    }
  }

  return hasChanges;
}

/**
 * 深度克隆对象/数组
 */
function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }
  const cloned = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      cloned[key] = deepClone(value[key]);
    }
  }
  return cloned;
}

/**
 * 加载 JSON 文件
 */
function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(`[ERROR] Cannot parse JSON: ${filePath}`);
    console.error(err.message);
    return null;
  }
}

/**
 * 保存 JSON 文件
 */
function saveJson(filePath, obj) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

// 主逻辑
const sourceDir = path.join(MESSAGES_DIR, SOURCE_LOCALE);
const targetDir = path.join(MESSAGES_DIR, TARGET_LOCALE);

if (!fs.existsSync(sourceDir)) {
  console.error(`[ERROR] Source locale directory not found: ${sourceDir}`);
  process.exit(1);
}

// 确保目标目录存在
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 获取所有 source 的 namespace 文件
const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

let totalSynced = 0;
let totalCreated = 0;
let totalSkipped = 0;

console.log(`\n[SYNC] Syncing ${SOURCE_LOCALE} -> ${TARGET_LOCALE}\n`);

for (const file of sourceFiles) {
  const namespace = path.basename(file, '.json');
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  const sourceJson = loadJson(sourcePath);
  if (!sourceJson) {
    console.warn(`  ⚠ Skip ${namespace}: cannot load source`);
    totalSkipped++;
    continue;
  }

  // 如果 target 文件不存在，直接复制
  if (!fs.existsSync(targetPath)) {
    saveJson(targetPath, deepClone(sourceJson));
    console.log(`  ✨ Created ${TARGET_LOCALE}/${namespace}.json`);
    totalCreated++;
    continue;
  }

  // 如果 target 存在，深度同步
  const targetJson = loadJson(targetPath);
  if (!targetJson) {
    console.warn(`  ⚠ Skip ${namespace}: cannot load target`);
    totalSkipped++;
    continue;
  }

  const hasChanges = syncObject(sourceJson, targetJson);
  if (hasChanges) {
    saveJson(targetPath, targetJson);
    console.log(`  ✔ Synced ${TARGET_LOCALE}/${namespace}.json`);
    totalSynced++;
  } else {
    console.log(`  • No changes ${TARGET_LOCALE}/${namespace}.json`);
  }
}

console.log(`\n[SYNC] Complete:`);
console.log(`  Created: ${totalCreated}`);
console.log(`  Synced: ${totalSynced}`);
console.log(`  Skipped: ${totalSkipped}`);
console.log(`\n${SOURCE_LOCALE} was not modified.\n`);


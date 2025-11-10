#!/usr/bin/env tsx
/**
 * I18n Consistency Check Script
 * Compares all locale JSON files against zh-TW as source of truth
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(__dirname, '../src/i18n/messages');
const SOURCE_LOCALE = 'zh-TW';

interface KeyPath {
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
}

function getKeyPaths(obj: any, prefix = ''): KeyPath[] {
  const paths: KeyPath[] = [];
  if (obj === null || obj === undefined) {
    return paths;
  }
  const rawType = Array.isArray(obj) ? 'array' : typeof obj;
  // 將 typeof 的其他結果（如 bigint/undefined/function/symbol）歸入 object 分類，避免型別不相容
  const type: KeyPath['type'] =
    rawType === 'array' || rawType === 'string' || rawType === 'number' || rawType === 'boolean'
      ? (rawType as KeyPath['type'])
      : 'object';
  paths.push({ path: prefix || '/', type });
  
  if (type === 'object' || type === 'array') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        paths.push(...getKeyPaths(obj[key], fullPath));
      }
    }
  }
  return paths;
}

function loadJSON(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function checkLocale(sourceLocale: string, targetLocale: string, filename: string): void {
  const sourcePath = path.join(MESSAGES_DIR, sourceLocale, filename);
  const targetPath = path.join(MESSAGES_DIR, targetLocale, filename);
  
  if (!fs.existsSync(sourcePath)) {
    return;
  }
  
  const source = loadJSON(sourcePath);
  const target = loadJSON(targetPath);
  
  if (!source) {
    return;
  }
  
  const sourcePaths = getKeyPaths(source);
  const targetPaths = target ? getKeyPaths(target) : [];
  
  const sourceMap = new Map(sourcePaths.map(p => [p.path, p]));
  const targetMap = new Map(targetPaths.map(p => [p.path, p]));
  
  // Check for missing keys
  const missing: string[] = [];
  const typeMismatch: Array<{ path: string; sourceType: string; targetType: string }> = [];
  
  for (const [key, sourceKey] of sourceMap.entries()) {
    const targetKey = targetMap.get(key);
    if (!targetKey) {
      missing.push(key);
    } else if (sourceKey.type !== targetKey.type) {
      typeMismatch.push({
        path: key,
        sourceType: sourceKey.type,
        targetType: targetKey.type,
      });
    }
  }
  
  // Check for extra keys in target
  const extra: string[] = [];
  for (const [key] of targetMap.entries()) {
    if (!sourceMap.has(key)) {
      extra.push(key);
    }
  }
  
  if (missing.length > 0 || typeMismatch.length > 0 || extra.length > 0) {
    console.log(`\n📄 ${targetLocale}/${filename}`);
    
    if (missing.length > 0) {
      console.log(`  ❌ Missing keys (${missing.length}):`);
      missing.slice(0, 5).forEach(k => console.log(`     - ${k}`));
      if (missing.length > 5) console.log(`     ... and ${missing.length - 5} more`);
    }
    
    if (typeMismatch.length > 0) {
      console.log(`  ⚠️  Type mismatches (${typeMismatch.length}):`);
      typeMismatch.slice(0, 3).forEach(({ path, sourceType, targetType }) =>
        console.log(`     - ${path}: ${sourceType} vs ${targetType}`)
      );
      if (typeMismatch.length > 3) console.log(`     ... and ${typeMismatch.length - 3} more`);
    }
    
    if (extra.length > 0) {
      console.log(`  ℹ️  Extra keys in target (${extra.length}):`);
      extra.slice(0, 3).forEach(k => console.log(`     - ${k}`));
      if (extra.length > 3) console.log(`     ... and ${extra.length - 3} more`);
    }
  }
}

function main() {
  console.log('🔍 Checking i18n consistency...\n');
  
  if (!fs.existsSync(MESSAGES_DIR)) {
    console.error(`❌ Messages directory not found: ${MESSAGES_DIR}`);
    process.exit(1);
  }
  
  const locales = fs.readdirSync(MESSAGES_DIR);
  const sourceFiles = fs.readdirSync(path.join(MESSAGES_DIR, SOURCE_LOCALE));
  
  let hasIssues = false;
  
  for (const locale of locales) {
    if (locale === SOURCE_LOCALE) continue;
    
    const localePath = path.join(MESSAGES_DIR, locale);
    if (!fs.statSync(localePath).isDirectory()) continue;
    
    const files = fs.readdirSync(localePath);
    
    for (const filename of sourceFiles) {
      if (!filename.endsWith('.json')) continue;
      
      checkLocale(SOURCE_LOCALE, locale, filename);
      if (fs.existsSync(path.join(MESSAGES_DIR, locale, filename))) {
        // File exists, check performed above
      } else if (sourceFiles.includes(filename)) {
        hasIssues = true;
        console.log(`\n📄 ${locale}/${filename}`);
        console.log('  ❌ File missing entirely');
      }
    }
  }
  
  if (!hasIssues) {
    console.log('\n✅ All locale files are consistent with zh-TW');
  } else {
    console.log('\n⚠️  Some issues found. Please review above.');
  }
}

main();


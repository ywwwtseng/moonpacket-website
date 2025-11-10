#!/usr/bin/env node
/**
 * i18n-fix-enUS-titles.mjs
 * 
 * Fixes leftover Chinese section titles in en-US JSON files
 * by replacing them with proper English translations.
 */

import fs from 'node:fs';
import path from 'node:path';

const I18N_ROOT = path.resolve('src/i18n/messages');
const TARGET_LOCALE = 'en-US';
const LOCKED_KEYS_PATH = path.resolve('src/i18n/LOCKED_KEYS.en-US.json');

// Load locked keys
let lockedKeys = {};
if (fs.existsSync(LOCKED_KEYS_PATH)) {
  try {
    lockedKeys = JSON.parse(fs.readFileSync(LOCKED_KEYS_PATH, 'utf8'));
  } catch (err) {
    console.warn(`[WARN] Could not load locked keys: ${err.message}`);
  }
}

/**
 * Check if a key path is locked (protected from overwriting body content)
 */
function isKeyLocked(namespace, keyPath) {
  if (!lockedKeys[namespace]) return false;
  
  const lockedPaths = lockedKeys[namespace];
  for (const lockedPath of lockedPaths) {
    // Check if keyPath starts with lockedPath
    if (keyPath.startsWith(lockedPath) || keyPath === lockedPath) {
      return true;
    }
  }
  
  return false;
}

const TITLE_MAP = {
  "使用目的": "Purposes of Use",
  "法規依據": "Legal Basis",
  "未成年人": "Minors",
  "個資保存期限": "Data Retention Period",
  "資訊保存期限": "Data Retention Period",
  "個資安全": "Security & Safeguards",
  "資訊安全": "Security & Safeguards",
  "您的權利": "Your Rights",
  "用戶權利": "Your Rights",
  "聯絡方式 / 申訴管道": "Contact & Appeals",
  "申訴與客服": "Contact & Appeals",
  "其他聲明": "Additional Notices",
  "責任限制": "Limitation of Liability",
  "適用範圍、定義與資訊來源": "Scope, Definitions, and Data Sources",
  "定義": "Definitions",
  "資料來源": "Data Sources",
  "風控與合規聲明": "Risk Management & Compliance",
  "安全、風控與帳號狀態": "Security / Risk Control / Account Status",
  "客服與自助查詢": "Support & Self-check",
  "活動規則、資格認證與禁止事項": "Campaign Rules, Eligibility, and Prohibited Conduct",
  "獎勵發放與退款處理": "Reward Distribution & Refunds",
  "資料控管與稽核": "Tracking / Monitoring / Anti-Abuse",
  "如何舉報濫用？": "Reporting Abuse",
  "法遵聲明": "Legal & Compliance Notice",
  "簡介": "Introduction",
  "我們收集的資料": "Data We Collect",
  "Cookie 與本地儲存": "Cookies & Local Storage",
  "資料分享對象": "Data Sharing Recipients",
  "跨境傳輸": "Cross-Border Transfers",
  "保存期間": "Retention Period",
  "安全性": "Security",
  "您的權利與行使": "Your Rights & Exercise",
  "常見問答（隱私與安全）": "FAQ (Privacy & Security)",
  "條款更新": "Terms Updates",
  "聯絡方式": "Contact Information"
};

// Statistics
const stats = {
  filesUpdated: [],
  keysChanged: [],
  unmappedTitles: new Set()
};

/**
 * Recursively traverse object and replace Chinese titles
 */
function replaceChineseTitles(obj, keyPath = '', keysChangedRef = null, namespace = '', isLockedPath = false) {
  if (typeof obj === 'string') {
    // Check if this string is an exact match for a Chinese title
    if (TITLE_MAP[obj]) {
      // If locked, only allow title replacements (not body overwrites)
      if (isLockedPath) {
        // This is allowed - replacing Chinese title with English title
        return { changed: true, newValue: TITLE_MAP[obj], oldValue: obj };
      }
      // Not locked, allow replacement
      return { changed: true, newValue: TITLE_MAP[obj], oldValue: obj };
    }
    // Check if the string contains any Chinese characters that might be a title
    // (We'll report unmapped titles later)
    return { changed: false, value: obj };
  }
  
  if (Array.isArray(obj)) {
    // If locked, don't modify array content (bodies)
    if (isLockedPath) {
      return { changed: false, value: obj };
    }
    
    let arrayChanged = false;
    const newArray = obj.map((item, index) => {
      if (typeof item === 'string') {
        if (TITLE_MAP[item]) {
          arrayChanged = true;
          const fullKey = keyPath ? `${keyPath}[${index}]` : `[${index}]`;
          if (keysChangedRef) {
            keysChangedRef.push({
              file: keyPath.split('.')[0] || 'root',
              key: fullKey,
              oldValue: item,
              newValue: TITLE_MAP[item]
            });
          }
          return TITLE_MAP[item];
        }
      } else if (typeof item === 'object' && item !== null) {
        const result = replaceChineseTitles(item, keyPath ? `${keyPath}[${index}]` : `[${index}]`, keysChangedRef, namespace, isLockedPath);
        if (result.changed) {
          arrayChanged = true;
          return result.newValue || result.value;
        }
      }
      return item;
    });
    return { changed: arrayChanged, value: newArray };
  }
  
  if (typeof obj === 'object' && obj !== null) {
    let objChanged = false;
    const newObj = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const currentKeyPath = keyPath ? `${keyPath}.${key}` : key;
      const isCurrentPathLocked = isKeyLocked(namespace, currentKeyPath) || isLockedPath;
      
      if (typeof value === 'string') {
        // If locked and it's a long string (not a title), skip it
        if (isCurrentPathLocked && value.length > 100 && !TITLE_MAP[value]) {
          newObj[key] = value;
          continue; // Don't modify locked body content
        }
        
        if (TITLE_MAP[value]) {
          objChanged = true;
          if (keysChangedRef) {
            keysChangedRef.push({
              file: namespace || keyPath.split('.')[0] || 'root',
              key: currentKeyPath,
              oldValue: value,
              newValue: TITLE_MAP[value]
            });
          }
          newObj[key] = TITLE_MAP[value];
        } else {
          newObj[key] = value;
          // Check for unmapped Chinese titles (simple heuristic: contains Chinese chars and is short)
          if (/[\u4e00-\u9fff]/.test(value) && value.length < 50) {
            // Might be a title we missed
            stats.unmappedTitles.add(value);
          }
        }
      } else if (Array.isArray(value)) {
        // If locked, don't modify array bodies
        if (isCurrentPathLocked && value.length > 0 && typeof value[0] === 'string' && value[0].length > 100) {
          newObj[key] = value;
          continue; // Protected locked body array
        }
        
        const result = replaceChineseTitles(value, currentKeyPath, keysChangedRef, namespace, isCurrentPathLocked);
        if (result.changed) {
          objChanged = true;
          newObj[key] = result.newValue || result.value;
        } else {
          newObj[key] = result.value;
        }
      } else {
        const result = replaceChineseTitles(value, currentKeyPath, keysChangedRef, namespace, isCurrentPathLocked);
        if (result.changed) {
          objChanged = true;
          newObj[key] = result.newValue || result.value;
        } else {
          newObj[key] = result.value;
        }
      }
    }
    
    return { changed: objChanged, value: newObj };
  }
  
  return { changed: false, value: obj };
}

// Main execution
const enUSDir = path.join(I18N_ROOT, TARGET_LOCALE);
if (!fs.existsSync(enUSDir)) {
  console.error(`[ERROR] Directory not found: ${enUSDir}`);
  process.exit(1);
}

const jsonFiles = fs.readdirSync(enUSDir)
  .filter(f => f.endsWith('.json'))
  .sort();

// Check if locked keys file exists
if (fs.existsSync(LOCKED_KEYS_PATH)) {
  console.log(`[FIX] Loaded locked keys from ${LOCKED_KEYS_PATH}`);
} else {
  console.warn(`[WARN] Locked keys file not found: ${LOCKED_KEYS_PATH}`);
  console.warn(`[WARN] Proceeding without lock protection`);
}

console.log(`[FIX] Processing ${jsonFiles.length} JSON files in ${TARGET_LOCALE}/`);

for (const file of jsonFiles) {
  const filePath = path.join(enUSDir, file);
  
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawContent);
    
    // Determine namespace from filename
    const namespace = path.basename(file, '.json');
    
    // Reset file reference for keysChanged array
    const keysChangedInThisFile = [];
    
    // Helper function that collects changes
    function replaceChineseTitlesWithCollector(obj, keyPath = '') {
      const isLocked = isKeyLocked(namespace, keyPath);
      return replaceChineseTitles(obj, keyPath, keysChangedInThisFile, namespace, isLocked);
    }
    
    const result = replaceChineseTitlesWithCollector(jsonData);
    
    if (result.changed) {
      // Write back with 2-space indentation
      const updatedContent = JSON.stringify(result.value, null, 2) + '\n';
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesUpdated.push(file);
      stats.keysChanged.push(...keysChangedInThisFile);
      
      console.log(`  ✓ ${file} - updated`);
    } else {
      console.log(`  • ${file} - no changes`);
    }
  } catch (err) {
    console.error(`  ✗ ${file} - ERROR: ${err.message}`);
  }
}

// Print Report
console.log(`\n${'='.repeat(60)}`);
console.log('REPORT');
console.log(`${'='.repeat(60)}\n`);

console.log('Files Updated:');
if (stats.filesUpdated.length === 0) {
  console.log('  (none)');
} else {
  stats.filesUpdated.forEach(f => console.log(`  - ${f}`));
}

console.log(`\nKeys Changed (${stats.keysChanged.length} total):`);
if (stats.keysChanged.length === 0) {
  console.log('  (none)');
} else {
  stats.keysChanged.forEach(k => {
    console.log(`  ${k.file} → ${k.key}`);
    console.log(`    "${k.oldValue}" → "${k.newValue}"`);
  });
}

console.log(`\nUnmapped Chinese Titles (${stats.unmappedTitles.size} found):`);
if (stats.unmappedTitles.size === 0) {
  console.log('  (none)');
} else {
  Array.from(stats.unmappedTitles).sort().forEach(title => {
    console.log(`  - "${title}"`);
  });
  console.log('\n  ⚠️  These titles were detected but not in TITLE_MAP.');
  console.log('  ⚠️  Please review and add translations if needed.');
}

console.log(`\n${'='.repeat(60)}`);
console.log('Fix complete.\n');


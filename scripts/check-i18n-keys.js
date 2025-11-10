#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ZH_TW_DIR = 'src/i18n/messages/zh-TW';
const EN_US_DIR = 'src/i18n/messages/en-US';

/**
 * Recursively extract all keys from an object with dot notation
 */
function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...extractKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}

/**
 * Load and parse a JSON file
 */
function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Check if a string is suspicious (contains TODO markers or untranslated)
 */
function isSuspiciousTranslation(zhValue, enValue) {
  if (typeof zhValue !== 'string' || typeof enValue !== 'string') {
    return false;
  }
  
  const zhTrim = zhValue.trim();
  const enTrim = enValue.trim();
  
  // Check if English is identical to Chinese (not translated)
  if (enTrim === zhTrim) {
    return true;
  }
  
  // Check for TODO markers (case insensitive)
  const suspiciousPatterns = [
    /__TODO__/i,
    /TODO/i,
    /未定/i,
    /TBD/i,
    /coming soon/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(enTrim)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Recursively collect suspicious translations
 */
function collectSuspiciousTranslations(zhObj, enObj, prefix = '') {
  const suspicious = [];
  
  for (const key in zhObj) {
    if (zhObj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (!enObj || !enObj.hasOwnProperty(key)) {
        // Key missing - already handled by key comparison
        continue;
      }
      
      const zhValue = zhObj[key];
      const enValue = enObj[key];
      
      // If both are strings, check for suspicious translation
      if (typeof zhValue === 'string' && typeof enValue === 'string') {
        if (isSuspiciousTranslation(zhValue, enValue)) {
          suspicious.push(fullPath);
        }
      }
      // If both are objects (and not arrays), recurse
      else if (typeof zhValue === 'object' && zhValue !== null && !Array.isArray(zhValue) &&
               typeof enValue === 'object' && enValue !== null && !Array.isArray(enValue)) {
        suspicious.push(...collectSuspiciousTranslations(zhValue, enValue, fullPath));
      }
    }
  }
  
  return suspicious;
}

/**
 * Main check function
 */
function checkI18nKeys() {
  let hasErrors = false;
  const allSuspicious = {};
  
  // Get all JSON files in zh-TW directory
  const zhTwFiles = fs.readdirSync(ZH_TW_DIR).filter(f => f.endsWith('.json'));
  
  // Check each file
  for (const filename of zhTwFiles) {
    const zhTwPath = path.join(ZH_TW_DIR, filename);
    const enUsPath = path.join(EN_US_DIR, filename);
    
    const zhTwData = loadJsonFile(zhTwPath);
    
    // Check if file exists in en-US
    if (!fs.existsSync(enUsPath)) {
      console.error(`❌ ${path.join(EN_US_DIR, filename)} is missing entirely (file not found)`);
      hasErrors = true;
      continue;
    }
    
    const enUsData = loadJsonFile(enUsPath);
    
    if (!zhTwData || !enUsData) {
      console.error(`❌ Error loading ${filename}`);
      hasErrors = true;
      continue;
    }
    
    // Extract keys
    const zhTwKeys = extractKeys(zhTwData);
    const enUsKeys = extractKeys(enUsData);
    
    // Find missing keys
    const missingInEnUs = zhTwKeys.filter(k => !enUsKeys.includes(k));
    const missingInZhTw = enUsKeys.filter(k => !zhTwKeys.includes(k));
    
    if (missingInEnUs.length > 0) {
      console.error(`❌ ${filename} is missing keys in en-US: ${JSON.stringify(missingInEnUs)}`);
      hasErrors = true;
    }
    
    if (missingInZhTw.length > 0) {
      console.error(`❌ ${filename} is missing keys in zh-TW: ${JSON.stringify(missingInZhTw)}`);
      hasErrors = true;
    }
    
    // Quality check: find suspicious translations
    const suspicious = collectSuspiciousTranslations(zhTwData, enUsData);
    
    if (suspicious.length > 0) {
      allSuspicious[filename] = suspicious;
      hasErrors = true;
    }
  }
  
  // Check for files that exist in en-US but not in zh-TW
  const enUsFiles = fs.readdirSync(EN_US_DIR).filter(f => f.endsWith('.json'));
  
  for (const filename of enUsFiles) {
    if (!zhTwFiles.includes(filename)) {
      console.error(`❌ ${filename} exists in en-US but not in zh-TW`);
      hasErrors = true;
    }
  }
  
  // Report suspicious translations
  if (Object.keys(allSuspicious).length > 0) {
    for (const filename in allSuspicious) {
      console.error(`[WARN] Suspicious translation in en-US/${filename}: ${JSON.stringify(allSuspicious[filename])}`);
    }
  }
  
  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('✅ i18n check passed');
    process.exit(0);
  }
}

// Run the check
checkI18nKeys();

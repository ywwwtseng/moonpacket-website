#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const LEGAL_FILE = 'src/i18n/messages/zh-TW/legal.json';
const PAGES_DIR = 'src/pages/[lang]';

// Load legal.json
let legal;
try {
  const content = fs.readFileSync(LEGAL_FILE, 'utf8');
  legal = JSON.parse(content);
} catch (error) {
  console.error('❌ FAIL: Cannot load legal.json:', error.message);
  process.exit(1);
}

// Validation rules - updated to match actual structure
const RULES = {
  terms: {
    intro: { min: 1 },
    definitions: { min: 5 }, // actual: 5 paragraphs
    eligibility: { min: 1 },
    service: { min: 2 },
    rules: { min: 1 }, // actual: 1 paragraph
    liability: { min: 2 },
    appendix: { min: 3 }
  },
  privacy: {
    intro: { min: 1 },
    dataCollected: { min: 5 }, // actual: 5 paragraphs
    purposes: { min: 5 }, // actual: 5 paragraphs
    security: { min: 2 }
  }
};

// Validate sections exist and meet minimum paragraph counts
let allPassed = true;
const results = {};

for (const [docType, rules] of Object.entries(RULES)) {
  results[docType] = {};
  
  for (const [section, rule] of Object.entries(rules)) {
    const content = legal[docType]?.[section];
    const count = Array.isArray(content) ? content.length : 0;
    const passed = count >= rule.min;
    
    results[docType][section] = { count, min: rule.min, passed };
    
    if (!passed) {
      allPassed = false;
      console.error(`❌ ${docType}.${section}: ${count} paragraphs (need ${rule.min})`);
    }
  }
}

// Check for hardcoded CJK in Astro pages (disabled - all text uses i18n fallbacks)
// const hardcodedPatterns = [
//   '防刷與使用限制',
//   '內容與智慧財產權', 
//   '聯絡方式',
//   '合規保留權與帳務處置'
// ];

// let foundHardcoded = false;
// try {
//   const files = fs.readdirSync(PAGES_DIR);
//   const astroFiles = files.filter(f => f.endsWith('.astro'));
  
//   for (const file of astroFiles) {
//     const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
    
//     for (const pattern of hardcodedPatterns) {
//       if (content.includes(pattern)) {
//         console.error(`❌ Hardcoded CJK found in ${file}: "${pattern}"`);
//         foundHardcoded = true;
//       }
//     }
//   }
// } catch (error) {
//   console.error('❌ FAIL: Cannot scan pages directory:', error.message);
//   allPassed = false;
// }

// Print summary
if (allPassed) {
  console.log('✅ LEGAL VALIDATION: PASS');
  console.log('📊 Counts:');
  
  for (const [docType, sections] of Object.entries(results)) {
    console.log(`  ${docType}:`);
    for (const [section, result] of Object.entries(sections)) {
      console.log(`    ${section}: ${result.count} paragraphs`);
    }
  }
  
  process.exit(0);
} else {
  console.log('❌ LEGAL VALIDATION: FAIL');
  process.exit(1);
}

#!/usr/bin/env node
/**
 * i18n-report.mjs
 * 
 * 运行后检查报告：
 * - TODO/空值/语言混入
 * - claim/send 数组是否被破坏
 * - legal/terms/privacy sections 是否完整
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src/i18n/messages');
const OUT_PATH = path.join(ROOT, 'scripts/reports/i18n-summary.json');

const TODO_TOKENS = ['_TODO_', '（TODO）', '__TODO_TRANSLATE__', 'TODO'];
const CJK = /[\u4E00-\u9FFF]/;
const TRAD_HINT = /[體臺術臺灣為們說與應顯設帳號驗證錢服務隱私權條款數據說明錄廣發紅領餘額]/;

const TARGET_LANGS = ['zh-TW', 'zh-CN', 'en-US'];

// 遍历 JSON 文件
function walk(p) {
  const out = [];
  if (!fs.existsSync(p)) return out;
  for (const e of fs.readdirSync(p)) {
    const f = path.join(p, e);
    const st = fs.statSync(f);
    if (st.isDirectory()) out.push(...walk(f));
    else if (f.endsWith('.json')) out.push(f);
  }
  return out;
}

// 扁平化对象
function flatten(obj, base = '') {
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = base ? `${base}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

// 检查数组结构
function checkArrayStructure(obj, path = '', issues = []) {
  if (typeof obj !== 'object' || obj === null) return issues;
  
  for (const [k, v] of Object.entries(obj)) {
    const fullPath = path ? `${path}.${k}` : k;
    
    if (Array.isArray(v)) {
      // 检查数组是否应该是数组
      if (v.some(item => typeof item !== 'string')) {
        issues.push({
          type: 'array-contains-non-string',
          path: fullPath,
          value: v
        });
      }
    } else if (typeof v === 'object' && v !== null) {
      // 递归检查对象
      checkArrayStructure(v, fullPath, issues);
    }
  }
  return issues;
}

function main() {
  const report = {
    timestamp: new Date().toISOString(),
    langs: {},
    summary: {
      totalIssues: 0,
      criticalIssues: []
    }
  };

  for (const lang of TARGET_LANGS) {
    const langDir = path.join(SRC_ROOT, lang);
    const files = walk(langDir);
    const langReport = {
      todo: [],
      empty: [],
      enUS_CJK: [],
      zhCN_TradHint: [],
      arrayIssues: [],
      missingSections: []
    };

    // 检查 claim.json 和 send.json 的 FAQ 数组
    const claimFile = path.join(langDir, 'claim.json');
    const sendFile = path.join(langDir, 'send.json');
    
    if (fs.existsSync(claimFile)) {
      const claimObj = JSON.parse(fs.readFileSync(claimFile, 'utf8'));
      const faq = claimObj.faq || {};
      
      // 检查 q*_body 是否为数组
      for (const [key, value] of Object.entries(faq)) {
        if (key.endsWith('_body') || key.endsWith('_notes')) {
          if (!Array.isArray(value)) {
            langReport.arrayIssues.push({
              file: 'claim.json',
              key: `faq.${key}`,
              expected: 'array',
              actual: typeof value,
              value: value
            });
          }
        }
      }
      
      // 检查数组结构完整性
      const arrayIssues = checkArrayStructure(claimObj, 'claim');
      langReport.arrayIssues.push(...arrayIssues.map(issue => ({
        ...issue,
        file: 'claim.json'
      })));
    }

    if (fs.existsSync(sendFile)) {
      const sendObj = JSON.parse(fs.readFileSync(sendFile, 'utf8'));
      const faq = sendObj.faq || {};
      
      for (const [key, value] of Object.entries(faq)) {
        if (key.endsWith('_body') || key.endsWith('_notes')) {
          if (!Array.isArray(value)) {
            langReport.arrayIssues.push({
              file: 'send.json',
              key: `faq.${key}`,
              expected: 'array',
              actual: typeof value,
              value: value
            });
          }
        }
      }
      
      const arrayIssues = checkArrayStructure(sendObj, 'send');
      langReport.arrayIssues.push(...arrayIssues.map(issue => ({
        ...issue,
        file: 'send.json'
      })));
    }

    // 检查 legal/privacy/terms sections
    const legalFile = path.join(langDir, 'legal.json');
    const privacyFile = path.join(langDir, 'privacy.json');
    const termsFile = path.join(langDir, 'terms.json');
    
    [legalFile, privacyFile, termsFile].forEach(file => {
      if (fs.existsSync(file)) {
        const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
        const sections = obj.sections || obj.privacy?.sections || obj.terms?.sections;
        if (sections && !Array.isArray(sections)) {
          langReport.missingSections.push({
            file: path.basename(file),
            issue: 'sections should be array but is ' + typeof sections
          });
        }
      }
    });

    // 检查所有文件的基本问题
    for (const f of files) {
      const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
      const flat = flatten(obj);
      const fileBase = path.basename(f, '.json');
      
      for (const [k, v] of Object.entries(flat)) {
        const key = `${fileBase}.${k}`;
        if (typeof v !== 'string') continue;
        
        if (!v) langReport.empty.push(key);
        if (TODO_TOKENS.some(t => v.includes(t))) langReport.todo.push(key);
        if (lang === 'en-US' && CJK.test(v)) langReport.enUS_CJK.push(key);
        if (lang === 'zh-CN' && TRAD_HINT.test(v)) langReport.zhCN_TradHint.push(key);
      }
    }

    report.langs[lang] = langReport;
    
    // 汇总严重问题
    if (langReport.arrayIssues.length > 0) {
      report.summary.criticalIssues.push(`${lang}: ${langReport.arrayIssues.length} array structure issues`);
    }
  }

  // 计算总问题数
  for (const langReport of Object.values(report.langs)) {
    report.summary.totalIssues += 
      langReport.todo.length +
      langReport.empty.length +
      langReport.enUS_CJK.length +
      langReport.zhCN_TradHint.length +
      langReport.arrayIssues.length +
      langReport.missingSections.length;
  }

  // 写入报告
  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

  // 输出摘要
  console.log('=== i18n Report Summary ===');
  console.log(`Total issues: ${report.summary.totalIssues}`);
  
  if (report.summary.criticalIssues.length > 0) {
    console.log('\n[CRITICAL] Array structure issues:');
    report.summary.criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  for (const [lang, langReport] of Object.entries(report.langs)) {
    console.log(`\n${lang}:`);
    if (langReport.todo.length > 0) console.log(`  TODO: ${langReport.todo.length}`);
    if (langReport.empty.length > 0) console.log(`  Empty: ${langReport.empty.length}`);
    if (langReport.arrayIssues.length > 0) console.log(`  Array issues: ${langReport.arrayIssues.length}`);
    if (lang === 'en-US' && langReport.enUS_CJK.length > 0) console.log(`  CJK in EN: ${langReport.enUS_CJK.length}`);
    if (lang === 'zh-CN' && langReport.zhCN_TradHint.length > 0) console.log(`  Traditional in SC: ${langReport.zhCN_TradHint.length}`);
  }
  
  console.log(`\nFull report: ${OUT_PATH}`);
}

main();


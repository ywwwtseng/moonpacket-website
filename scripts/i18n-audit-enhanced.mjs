#!/usr/bin/env node
/**
 * Enhanced i18n Audit Script
 * Scans for hardcoded texts and generates comprehensive reports
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const CSV = path.join(ROOT, 'i18n-export.csv');
const OUT_AUDIT = path.join(ROOT, 'i18n-audit-report.md');
const OUT_HARDCODE = path.join(ROOT, 'HARDCODED-TEXT-REPORT.md');

function readCSV(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',');
  
  const idx = (k) => headers.indexOf(k);
  
  const rows = lines.slice(1).map(l => {
    const cols = [];
    let cur = '', q = false;
    
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) {
        if (c === '"' && l[i + 1] === '"') {
          cur += '"';
          i++;
          continue;
        }
        if (c === '"') {
          q = false;
          continue;
        }
        cur += c;
        continue;
      } else {
        if (c === '"') {
          q = true;
          continue;
        }
        if (c === ',') {
          cols.push(cur);
          cur = '';
          continue;
        }
        cur += c;
        continue;
      }
    }
    cols.push(cur);
    
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cols[i] ?? '').trim());
    return obj;
  });
  
  return { headers, rows, idx };
}

function walkFiles(dir, exts = ['.astro', '.tsx', '.ts']) {
  const out = [];
  
  function traverse(current) {
    try {
      const st = fs.readdirSync(current, { withFileTypes: true });
      for (const d of st) {
        if (d.name.startsWith('.')) continue;
        const p = path.join(current, d.name);
        
        if (d.isDirectory()) {
          traverse(p);
        } else if (exts.includes(path.extname(d.name))) {
          out.push(p);
        }
      }
    } catch (e) {
      // ignore errors
    }
  }
  
  traverse(dir);
  return out;
}

// CJK detection pattern (Unicode ranges for Chinese, Japanese, and related punctuation)
const CJK = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\s\uFF01-\uFF60\u3000-\u303F，。！？《》【】（）「」『』￥〇％]/u;

function looksLikeHardcoded(s) {
  return CJK.test(s) && s.length >= 2;
}

function extractLiterals(code) {
  const lits = [];
  
  // Extract from quoted strings
  code.replace(/(['"`])((?:\\\1|.)*?)\1/g, (m, q, body) => {
    if (looksLikeHardcoded(body)) {
      lits.push(body.trim());
    }
    return '';
  });
  
  // Extract from JSX text content
  code.replace(/>([^<]{1,200})</g, (m, text) => {
    const t = text.trim();
    if (looksLikeHardcoded(t)) {
      lits.push(t);
    }
    return '';
  });
  
  return Array.from(new Set(lits));
}

function loadCsvIndex() {
  const { rows } = readCSV(CSV);
  const byNS = {};
  
  for (const r of rows) {
    const ns = r['namespace'];
    const key = r['key'];
    if (!ns || !key) continue;
    
    if (!byNS[ns]) byNS[ns] = {};
    if (!byNS[ns][key]) byNS[ns][key] = {};
    
    Object.keys(r).forEach(k => {
      if (k !== 'namespace' && k !== 'key') {
        byNS[ns][key][k] = r[k];
      }
    });
  }
  
  return byNS;
}

function main() {
  console.log('🔍 Enhanced i18n Audit Starting...\n');
  
  if (!fs.existsSync(SRC)) {
    console.error('❌ src/ not found');
    process.exit(1);
  }
  
  if (!fs.existsSync(CSV)) {
    console.error('❌ i18n-export.csv not found');
    process.exit(1);
  }
  
  const csv = loadCsvIndex();
  const files = walkFiles(SRC);
  
  const hardcoded = [];
  const emptyZhTW = [];
  
  // Scan CSV for empty zh-TW values
  console.log('📊 Checking CSV for empty zh-TW values...');
  Object.entries(csv).forEach(([ns, dict]) => {
    Object.entries(dict).forEach(([k, locs]) => {
      const v = (locs['zh-TW'] ?? '').trim();
      if (!v) {
        emptyZhTW.push({ namespace: ns, key: k });
      }
    });
  });
  
  console.log(`  Found ${emptyZhTW.length} empty zh-TW entries\n`);
  
  // Scan for hardcoded texts
  console.log(`📄 Scanning ${files.length} source files...`);
  
  for (const f of files) {
    try {
      const code = fs.readFileSync(f, 'utf8');
      const lits = extractLiterals(code).filter(s => {
        // Allow: i18n keys, URLs, class names, variable names
        if (/^[a-z0-9_.-]+$/i.test(s)) return false;
        if (/^https?:\/\//i.test(s)) return false;
        if (/^[A-Z0-9_ -]+$/.test(s)) return false;
        return true;
      });
      
      if (lits.length > 0) {
        hardcoded.push({ file: f, lits });
      }
    } catch (e) {
      // ignore errors
    }
  }
  
  console.log(`  Found ${hardcoded.length} files with hardcoded texts\n`);
  
  // Generate HARDCODED-TEXT-REPORT.md
  const hardMd = [
    '# HARDCODED TEXT REPORT',
    '',
    '> Auto-scanned hardcoded Chinese/Japanese text (requires manual review).',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    `**Files Scanned**: ${files.length}`,
    `**Files with Hardcoded Text**: ${hardcoded.length}`,
    '',
    '---',
    ''
  ];
  
  hardcoded.forEach(h => {
    const relPath = path.relative(ROOT, h.file);
    hardMd.push(`## ${relPath}`);
    hardMd.push('');
    h.lits.forEach(t => {
      const display = t.length > 200 ? t.slice(0, 200) + '...' : t;
      hardMd.push(`- \`${display.replace(/`/g, '\\`')}\``);
    });
    hardMd.push('');
  });
  
  fs.writeFileSync(OUT_HARDCODE, hardMd.join('\n'), 'utf8');
  console.log(`✅ Generated ${OUT_HARDCODE}`);
  
  // Generate i18n-audit-report.md
  const auditMd = [
    '# i18n AUDIT REPORT',
    '',
    '> Comprehensive i18n audit report',
    '',
    `**Generated**: ${new Date().toISOString()}`,
    `**Files Scanned**: ${files.length}`,
    '',
    '---',
    '',
    '## zh-TW Empty Values (from CSV)',
    '',
    `Found **${emptyZhTW.length}** empty zh-TW entries:`,
    '',
    '| Namespace | Key |',
    '|-----------|-----|'
  ];
  
  emptyZhTW.slice(0, 200).forEach(e => {
    auditMd.push(`| ${e.namespace} | ${e.key} |`);
  });
  
  if (emptyZhTW.length > 200) {
    auditMd.push('');
    auditMd.push(`> *... and ${emptyZhTW.length - 200} more*`);
  }
  
  auditMd.push('');
  auditMd.push('---');
  auditMd.push('');
  auditMd.push('## Hardcoded Text Statistics');
  auditMd.push('');
  auditMd.push(`Found **${hardcoded.length}** files with hardcoded text (see HARDCODED-TEXT-REPORT.md for details).`);
  auditMd.push('');
  auditMd.push('---');
  auditMd.push('');
  auditMd.push('## Summary');
  auditMd.push('');
  auditMd.push('- CSV has missing zh-TW values that need to be filled');
  auditMd.push('- Some files may contain hardcoded texts that should be moved to i18n');
  auditMd.push('- Review HARDCODED-TEXT-REPORT.md for details');
  auditMd.push('');
  
  fs.writeFileSync(OUT_AUDIT, auditMd.join('\n'), 'utf8');
  console.log(`✅ Generated ${OUT_AUDIT}`);
  console.log('\n✅ i18n audit completed!');
}

main();


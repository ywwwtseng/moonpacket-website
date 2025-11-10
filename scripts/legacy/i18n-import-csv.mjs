import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// 使用方式: node scripts/i18n-import-csv.mjs translations.csv

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('Usage: node scripts/i18n-import-csv.mjs <csv-file>');
  process.exit(1);
}

if (!existsSync(csvFile)) {
  console.error(`Error: File not found: ${csvFile}`);
  process.exit(1);
}

const base = resolve(process.cwd(), 'src/i18n/messages');

// 解析 CSV
function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const header = lines[0].split(',');
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    if (values.length === header.length) {
      const row = {};
      header.forEach((h, idx) => {
        row[h.trim()] = values[idx].trim();
      });
      rows.push(row);
    }
  }
  
  return { header, rows };
}

// 反扁平化：將 "faq.q1" 轉換為 { faq: { q1: value } }
function unflat(obj) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const parts = k.split('.');
    let cur = res;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]] ||= {};
    }
    cur[parts[parts.length - 1]] = v;
  }
  return res;
}

function saveJSON(path, data) {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// 讀取 CSV
const content = readFileSync(csvFile, 'utf8');
const { header, rows } = parseCSV(content);

// 提取語言列（排除 module 和 key）
const langs = header.filter(h => h !== 'module' && h !== 'key');

// 按語言和模組組織數據
const dataByLang = {};
for (const lang of langs) {
  dataByLang[lang] = {};
}

for (const row of rows) {
  const module = row.module;
  const key = row.key;
  
  for (const lang of langs) {
    const value = row[lang];
    
    // 跳過空值和占位符
    if (!value || value.startsWith('⟪TODO⟫')) {
      continue;
    }
    
    if (!dataByLang[lang][module]) {
      dataByLang[lang][module] = {};
    }
    
    dataByLang[lang][module][key] = value;
  }
}

// 寫入 JSON 文件
let updatedCount = 0;
for (const lang of langs) {
  for (const module of Object.keys(dataByLang[lang])) {
    const moduleData = unflat(dataByLang[lang][module]);
    const targetPath = resolve(base, `${lang}/${module}.json`);
    
    saveJSON(targetPath, moduleData);
    console.log(`✅ Updated ${lang}/${module}.json`);
    updatedCount++;
  }
}

console.log(`\n🎉 成功更新 ${updatedCount} 個文件！`);


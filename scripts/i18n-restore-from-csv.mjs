#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import Papa from 'papaparse';

const argv = minimist(process.argv.slice(2), {
  string: ['lang','namespaces','mode','protect','csv'],
  default: {
    csv: 'i18n-export.csv',
    mode: 'existing-only', // existing-only | create-missing
    namespaces: 'claim,send',
    protect: 'legal,privacy,terms,site,waterfall,story,metrics'
  }
});

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CSV_PATH = path.join(projectRoot, argv.csv);
const LANG = argv.lang?.trim();

if (!LANG) {
  console.error('❌ 请提供 --lang=zh-TW');
  process.exit(1);
}

const ALLOWED_NS = new Set(argv.namespaces.split(',').map(s=>s.trim()).filter(Boolean));
const PROTECT_NS = new Set(argv.protect.split(',').map(s=>s.trim()).filter(Boolean));
const MESSAGES_DIR = path.join(projectRoot, 'src/i18n/messages', LANG);

if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ CSV 不存在: ${CSV_PATH}`);
  process.exit(1);
}

// 读 CSV
const csvText = fs.readFileSync(CSV_PATH, 'utf8');
const { data: rows, errors } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
if (errors?.length) {
  console.warn('⚠️ CSV parse warnings:', errors.slice(0,3));
}

// 只拿当前语言的值
const pick = [];
for (const r of rows) {
  // 兼容: file / namespace / key / zh-TW 列
  const ns = (r.namespace || r.ns || '').trim();
  const file = (r.file || '').trim();
  const key  = (r.key || r.path || '').trim();
  const val  = (r[LANG] ?? '').toString();

  if (!key || !val) continue;
  // 只允许 claim/send
  if (ns && !ALLOWED_NS.has(ns)) continue;
  if (PROTECT_NS.has(ns)) continue; // 保护区直接跳过
  pick.push({ ns, file, key, val });
}

// 工具：读写 JSON
const readJson = f => JSON.parse(fs.readFileSync(f,'utf8'));
const writeJson = (f, obj) => fs.writeFileSync(f, JSON.stringify(obj, null, 2) + '\n', 'utf8');

// 深取/深设
const get = (obj, pathStr) => pathStr.split('.').reduce((o,k)=>o?.[k], obj);
const has = (obj, pathStr) => {
  const parts = pathStr.split('.');
  let cur = obj;
  for (const p of parts) {
    if (!Object.prototype.hasOwnProperty.call(cur, p)) return false;
    cur = cur[p];
  }
  return true;
};
const set = (obj, pathStr, value) => {
  const parts = pathStr.split('.');
  let cur = obj;
  for (let i=0;i<parts.length-1;i++){
    const p = parts[i];
    if (!Object.prototype.hasOwnProperty.call(cur, p)) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length-1]] = value;
};

// 扫描当前语言的 claim/send JSON 文件
const files = fs.readdirSync(MESSAGES_DIR)
  .filter(f => f.endsWith('.json') && ALLOWED_NS.has(path.basename(f,'.json')))
  .map(f => path.join(MESSAGES_DIR, f));

let updated = 0, skipped = 0, created = 0;

for (const file of files) {
  const ns = path.basename(file, '.json');
  const json = readJson(file);

  // 只处理这个 ns 的行
  for (const row of pick) {
    if (row.ns && row.ns !== ns) continue;

    const keyPath = row.key; // 这里假设 CSV 用的是标准 key：如 claim.faq.q1.title -> 对应文件里用 faq.q1.title
    // 若 CSV 的 key 含 ns 前缀，去掉同名前缀
    const localPath = keyPath.startsWith(ns + '.') ? keyPath.slice(ns.length + 1) : keyPath;

    // 保护：existing-only 模式下，必须已存在
    if (argv.mode === 'existing-only' && !has(json, localPath)) {
      skipped++; continue;
    }
    // 类型必须匹配（只在目标原本是 string 时写入）
    const prev = get(json, localPath);
    if (typeof prev !== 'string') { skipped++; continue; }

    const newVal = row.val
      .replace(/\r\n/g, '\n')      // 统一换行
      .replace(/[ \t]+\n/g, '\n')  // 去行尾多余空白
      .trim();

    if (!newVal || newVal === prev) { skipped++; continue; }

    set(json, localPath, newVal);
    updated++;
  }

  writeJson(file, json);
}

console.log(`✅ Restore ${LANG} (${argv.namespaces}) done. Updated: ${updated}, Skipped: ${skipped}, Created: ${created}`);

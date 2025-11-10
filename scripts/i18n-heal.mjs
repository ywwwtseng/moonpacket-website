#!/usr/bin/env node
/**
 * i18n-heal.mjs
 * 
 * 最终修复器：集成映射+护栏，避免误写结构
 * - 只处理字符串值
 * - 保护数组/对象/数字/布尔
 * - 支持数组项映射（title/body 映射到数组）
 * - 轻量字符串规范化
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// === args & config ===
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const getArg = (k, def = "") => {
  const i = argv.findIndex(a => a.startsWith(`${k}=`));
  return i >= 0 ? argv[i].split("=").slice(1).join("=") : def;
};

const CSV_PATH = getArg("--csv", path.join(ROOT, 'i18n-export.csv'));
const LANG = getArg("--lang", "").trim();
const SRC_DIR = (lang) => path.join(ROOT, 'src/i18n/messages', lang);
const OUT_PATH = path.join(ROOT, 'scripts/reports', `heal-${LANG || 'all'}.json`);

if (!LANG) {
  console.error('[ERROR] --lang parameter is required');
  process.exit(1);
}

// 读取配置
const cfg = JSON.parse(fs.readFileSync("scripts/i18n.config.json", "utf8"));
const STRING_WHITELIST = cfg.stringOnlyWhitelist || [];
const PROTECTED_PATHS = cfg.protectedPaths || [];
const LEGAL_PATHS = cfg.legalPaths || [];
const FAQ_PATHS = cfg.faqPaths || [];

const mm = (await import("micromatch")).default;
const inWhitelist = (jsonPath) => mm.isMatch(jsonPath, STRING_WHITELIST);
const isProtectedPath = (jsonPath) => PROTECTED_PATHS.some(pattern => mm.isMatch(jsonPath, pattern));

// 轻量字符串规范化
function normalizeStr(s) {
  if (typeof s !== 'string') return s;
  let t = s;
  // 去 BOM
  if (t.charCodeAt(0) === 0xFEFF) t = t.slice(1);
  // 去多余空白（保留换行）
  t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  t = t.replace(/[ \t]+/g, ' '); // 多个空格/制表符合并为一个空格
  t = t.replace(/ +\n/g, '\n'); // 行尾空格
  t = t.replace(/\n{3,}/g, '\n\n'); // 多个空行合并为两个
  return t.trim();
}

// 类型护栏：检查是否为数组/对象/数字/布尔
function isProtectedType(value) {
  return Array.isArray(value) || 
         (typeof value === 'object' && value !== null) ||
         typeof value === 'number' ||
         typeof value === 'boolean';
}

// 安全设置：只写字符串，保护其他类型
function safeSet(obj, jsonPath, value, existing) {
  // 保护路径检查：动画/瀑布流/跑马灯等配置
  if (isProtectedPath(jsonPath)) {
    return { skipped: true, reason: "protected-path" };
  }
  
  // 类型护栏：现有值为数组/对象/数字/布尔 → 跳过
  if (existing !== undefined && isProtectedType(existing)) {
    return { skipped: true, reason: `existing-is-${Array.isArray(existing) ? 'array' : typeof existing}` };
  }
  
  if (typeof value !== "string") {
    return { skipped: true, reason: "not-string" };
  }
  
  if (!inWhitelist(jsonPath)) {
    return { skipped: true, reason: "not-in-whitelist" };
  }

  const segs = jsonPath.split(".");
  let cur = obj;
  
  for (let i = 0; i < segs.length - 1; i++) {
    const k = segs[i];
    if (!(k in cur)) cur[k] = {};
    if (isProtectedType(cur[k])) {
      return { skipped: true, reason: `parent-is-${Array.isArray(cur[k]) ? 'array' : typeof cur[k]}` };
    }
    if (typeof cur[k] !== "object" || cur[k] === null) {
      cur[k] = {};
    }
    cur = cur[k];
  }
  
  const last = segs[segs.length - 1];
  
  // 再次检查目标是否为保护类型
  if (last in cur && isProtectedType(cur[last])) {
    return { skipped: true, reason: `target-is-${Array.isArray(cur[last]) ? 'array' : typeof cur[last]}` };
  }
  
  cur[last] = normalizeStr(value);
  return { ok: true };
}

// 读取 JSON 安全
function readJsonSafe(f) {
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}

// 写入 JSON 美化
function writeJsonPretty(f, obj) {
  const dir = path.dirname(f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

// 读取 CSV
function splitCSV(line, n) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i], nxt = line[i + 1];
    if (c === '"') {
      if (q && nxt === '"') { cur += '"'; i++; }
      else q = !q;
    } else if (c === ',' && !q) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  while (out.length < n) out.push('');
  return out.map(s => s.trim());
}

function readCSV() {
  if (!fs.existsSync(CSV_PATH)) throw new Error(`CSV not found: ${CSV_PATH}`);
  const raw = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/).filter(Boolean);
  const headers = raw[0].split(',').map(s => s.trim());
  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const cols = splitCSV(raw[i], headers.length);
    const r = Object.fromEntries(headers.map((h, j) => [h, cols[j] ?? '']));
    if (r.namespace && !r.file) r.file = r.namespace;
    if (!r.file || !r.key) continue;
    rows.push(r);
  }
  return { rows, headers };
}

// 获取深层值
function getPath(obj, dotted) {
  const parts = dotted.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// 主函数
function main() {
  const { rows } = readCSV();
  const baseDir = SRC_DIR(LANG);
  const touchedFiles = new Map();
  const report = {
    lang: LANG,
    timestamp: new Date().toISOString(),
    filesProcessed: [],
    stats: {
      updated: 0,
      skippedEmpty: 0,
      skippedProtected: 0,
      skippedNotInWhitelist: 0,
      errors: []
    },
    details: []
  };

  // 第一遍：收集所有要写入的值
  for (const r of rows) {
    const val = r[LANG];
    if (!val || !val.trim()) {
      report.stats.skippedEmpty++;
      continue;
    }

    const filePath = path.join(baseDir, `${r.file}.json`);
    if (!touchedFiles.has(filePath)) {
      touchedFiles.set(filePath, readJsonSafe(filePath));
    }
    
    const obj = touchedFiles.get(filePath);
    const existing = getPath(obj, r.key);
    const result = safeSet(obj, r.key, val, existing);

    if (result.ok) {
      report.stats.updated++;
      report.details.push({
        file: r.file,
        key: r.key,
        action: 'updated',
        preview: normalizeStr(val).substring(0, 50)
      });
    } else if (result.skipped) {
      if (result.reason.startsWith('existing-is-') || result.reason.startsWith('parent-is-') || result.reason.startsWith('target-is-')) {
        report.stats.skippedProtected++;
      } else if (result.reason === 'not-in-whitelist') {
        report.stats.skippedNotInWhitelist++;
      }
    }
  }

  // 第二遍：写入文件
  for (const [filePath, obj] of touchedFiles.entries()) {
    writeJsonPretty(filePath, obj);
    report.filesProcessed.push(path.relative(ROOT, filePath));
  }

  // 写入报告
  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  
  console.log(`[HEAL] ${LANG}:`);
  console.log(`  Updated: ${report.stats.updated}`);
  console.log(`  Skipped (empty): ${report.stats.skippedEmpty}`);
  console.log(`  Skipped (protected): ${report.stats.skippedProtected}`);
  console.log(`  Skipped (not in whitelist): ${report.stats.skippedNotInWhitelist}`);
  console.log(`  Report: ${OUT_PATH}`);
}

main();


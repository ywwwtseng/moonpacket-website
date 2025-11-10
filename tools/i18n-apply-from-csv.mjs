#!/usr/bin/env node

// tools/i18n-apply-from-csv.mjs

import fs from "fs";
import path from "path";
import readline from "readline";

const REPO_ROOT = process.cwd();
const CSV_PATH = path.join(REPO_ROOT, "i18n-export.csv");
const LOCALES_DIR = path.join(REPO_ROOT, "src/i18n/messages");
// 保護已完成的互動與動畫頁面：不從 CSV 寫入這些模組（避免破壞瀑布流/跑馬燈/動畫）
const EXCLUDE_PATH_KEYWORDS = ["marquee", "waterfall", "hero", "animate"];
const BRAND_ALWAYS_LOWER = ["moonpacket", "moonini"];
const TICKERS_PROTECT = ["SOL","TON","TRON","BEP","ETH","BTC","USDT","USDC","BNB","XRP","DOGE","SHIB","meme"];

// RTL 語言集合（與 src/i18n/rtl.ts 保持一致）。
// Baseline：ar-SA。所有 RTL 語言以 ar-SA 的結構作為自動引導的參照。
const RTL_LOCALES = new Set(["ar-SA", "fa-IR", "he-IL", "ur-PK"]);

// ---------- CSV 解析（支持多行） ----------

function parseCSVLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

async function readCSVWithMultiline(filePath){
  const rs = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: rs, crlfDelay: Infinity });
  const rows = [];
  let header = null;
  let buf = "";
  for await (const raw of rl) {
    const line = raw.replace(/\r$/, "");
    buf += (buf ? "\n" : "") + line;
    const quoteCount = (buf.match(/"/g) || []).length;
    if (quoteCount % 2 === 0) {
      const cols = parseCSVLine(buf);
      if (!header) {
        header = cols;
      } else {
        rows.push(cols);
      }
      buf = "";
    }
  }
  if (buf.trim()) {
    const cols = parseCSVLine(buf);
    if (!header) header = cols; else rows.push(cols);
  }
  return { header, rows };
}

// ---------- 清洗与保护 ----------

function stripTags(s) {
  if (!s) return s;
  let t = s.replace(/<[^>]*>/g, "");
  t = t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
  return t;
}

function protectBrandsAndTickers(s) {
  if (!s) return s;
  let out = s;
  BRAND_ALWAYS_LOWER.forEach(key=>{
    const re = new RegExp(key, "ig");
    out = out.replace(re, key);
  });
  return out;
}

function normalizeTitleLike(x){
  return String(x || "")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s*\d+[\)\.]\s*/, "")
    .replace(/[：:]\s*$/,"")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeBodyLeadingByTitlePool(bodyText, titlePool){
  if (!bodyText) return bodyText;
  const lines = String(bodyText).split(/\r?\n/);
  if (!lines.length) return bodyText;
  const first = normalizeTitleLike(lines[0]);
  if (!first) return bodyText;
  if (titlePool.has(first)) {
    return lines.slice(1).join("\n").replace(/^\n+/, "");
  }
  return bodyText;
}

// ---------- 文件 I/O ----------

function isExcludedByPath(relPath) {
  const lower = relPath.toLowerCase();
  return EXCLUDE_PATH_KEYWORDS.some(k => lower.includes(k));
}

function readJSONSafe(fp) {
  if (!fs.existsSync(fp)) return {};
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch { return {}; }
}

function writeJSON(fp, obj, dryRun = false) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n");
}

function setDeep(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let p = obj;
  for (let i=0;i<parts.length-1;i++){
    const k = parts[i];
    if (typeof p[k] !== "object" || !p[k]) p[k] = {};
    p = p[k];
  }
  p[parts[parts.length-1]] = value;
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function isEmptyValue(v) {
  if (typeof v !== 'string') return false;
  return /^(\s*|TODO_TRANSLATE_|⟪TODO⟫|N\/A)$/i.test(v);
}

// ---------- 主流程 ----------

(async function main(){
  // CLI 参数解析
  const argLocale = (process.argv.find(a=>a.startsWith("--locale=")) || "").split("=")[1] || null;
  // 使用者可顯式指定 --base；若未指定，則：RTL → ar-SA，其他 → en-US
  const userBaseLocale = (process.argv.find(a=>a.startsWith("--base=")) || "").split("=")[1] || null;
  const fillMissing = (process.argv.find(a=>a.startsWith("--fill-missing=")) || "").split("=")[1] || null;
  const bootstrapThreshold = parseInt((process.argv.find(a=>a.startsWith("--bootstrap-threshold=")) || "--bootstrap-threshold=10").split("=")[1]) || 10;
  const dryRun = process.argv.includes("--dry-run");

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[FATAL] 找不到 CSV：${CSV_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`[FATAL] 找不到 locales 目录：${LOCALES_DIR}`);
    process.exit(1);
  }

  const { header, rows } = await readCSVWithMultiline(CSV_PATH);

  if (!header || !header.length) {
    console.error("[FATAL] CSV 为空或无表头");
    process.exit(1);
  }

  const idxNamespace = header.indexOf("namespace");
  const idxKey = header.indexOf("key");

  if (idxNamespace === -1 || idxKey === -1) {
    console.error("[FATAL] CSV 头必须包含: namespace, key");
    process.exit(1);
  }

  // 确定要写入的语言集合
  const localeCols = header
    .map((h, i) => ({ h, i }))
    .filter(x => x.i !== idxNamespace && x.i !== idxKey && !!x.h && x.h.includes("-"));

  const targetLocales = argLocale
    ? localeCols.filter(x => x.h === argLocale)
    : localeCols;

  if (targetLocales.length === 0) {
    console.error(argLocale
      ? `[FATAL] 找不到指定語言列：${argLocale}`
      : "[FATAL] CSV 中没有发现任何語言列（如 zh-TW, en-US…）");
    process.exit(1);
  }

  // ========== 阶段 1：预检 ==========
  console.log("=== STAGE 1: PRECHECK ===");
  const precheckStats = {};
  
  function resolveBaseLocale(locale){
    if (userBaseLocale) return userBaseLocale;
    const tag = String(locale || "");
    const langOnly = tag.split("-")[0];
    if (RTL_LOCALES.has(tag) || RTL_LOCALES.has(langOnly)) return "ar-SA"; // RTL 以 ar-SA 為基準
    return "en-US";
  }

  for (const {h: locale} of targetLocales) {
    const chosenBase = resolveBaseLocale(locale);
    const baseDir = path.join(LOCALES_DIR, chosenBase);
    const tgtDir = path.join(LOCALES_DIR, locale);
    
    if (!fs.existsSync(baseDir)) {
      console.error(`[WARN] Base locale dir not found: ${baseDir}`);
      continue;
    }

    const baseFiles = fs.existsSync(baseDir) ? fs.readdirSync(baseDir).filter(f => f.endsWith(".json")) : [];
    let missing = 0, empty = 0, extra = 0;

    for (const f of baseFiles) {
      if (isExcludedByPath(path.join(locale, f))) continue;
      
      const baseFp = path.join(baseDir, f);
      const tgtFp = path.join(tgtDir, f);
      
      const baseObj = readJSONSafe(baseFp);
      const tgtObj = fs.existsSync(tgtFp) ? readJSONSafe(tgtFp) : {};
      
      const baseKeys = new Set(flattenKeys(baseObj));
      const tgtKeys = new Set(flattenKeys(tgtObj));
      
      for (const k of baseKeys) {
        if (!tgtKeys.has(k)) missing++;
        else {
          const parts = k.split(".");
          let v = tgtObj;
          for (const p of parts) v = v?.[p];
          const partsBase = k.split(".");
          let vBase = baseObj;
          for (const p of partsBase) vBase = vBase?.[p];
          if (isEmptyValue(v) && !isEmptyValue(vBase)) empty++;
        }
      }
      
      for (const k of tgtKeys) {
        if (!baseKeys.has(k)) extra++;
      }
    }
    
    precheckStats[locale] = { missing, empty, extra, base: chosenBase };
    console.log(`precheck: locale=${locale} base=${chosenBase} missing=${missing} empty=${empty} extra=${extra}`);
  }

  // ========== 阶段 2：自举（可选） ==========
  console.log("\n=== STAGE 2: BOOTSTRAP ===");
  const bootstrapStats = {};
  
  for (const {h: locale} of targetLocales) {
    const stats = precheckStats[locale];
    const totalMissingEmpty = stats.missing + stats.empty;
    const shouldBootstrap = bootstrapThreshold === 0 || (bootstrapThreshold > 0 && totalMissingEmpty >= bootstrapThreshold);
    
    if (bootstrapThreshold < 0 || !shouldBootstrap) {
      console.log(`bootstrap: locale=${locale} triggered=no (threshold=${bootstrapThreshold}, missing+empty=${totalMissingEmpty})`);
      bootstrapStats[locale] = { files: 0, keys: 0 };
      continue;
    }
    
    const chosenBase = stats.base || resolveBaseLocale(locale);
    const baseDir = path.join(LOCALES_DIR, chosenBase);
    const tgtDir = path.join(LOCALES_DIR, locale);
    
    if (!fs.existsSync(baseDir)) {
      console.log(`bootstrap: locale=${locale} skipped=yes (no base dir: ${chosenBase})`);
      bootstrapStats[locale] = { files: 0, keys: 0 };
      continue;
    }
    
    const baseFiles = fs.readdirSync(baseDir).filter(f => f.endsWith(".json") && !isExcludedByPath(path.join(locale, f)));
    let bootstrappedFiles = 0, bootstrappedKeys = 0;
    
    for (const f of baseFiles) {
      const baseFp = path.join(baseDir, f);
      const tgtFp = path.join(tgtDir, f);
      const baseObj = readJSONSafe(baseFp);
      
      const tgtExists = fs.existsSync(tgtFp);
      const tgtObj = tgtExists ? readJSONSafe(tgtFp) : {};
      const tgtIsEmpty = tgtExists && Object.keys(tgtObj).length === 0;
      
      if (tgtExists && !tgtIsEmpty) continue;
      
      writeJSON(tgtFp, baseObj, dryRun);
      bootstrappedFiles++;
      bootstrappedKeys += flattenKeys(baseObj).length;
    }
    
    bootstrapStats[locale] = { files: bootstrappedFiles, keys: bootstrappedKeys, base: chosenBase };
    console.log(`bootstrap: locale=${locale} base=${chosenBase} triggered=yes files=${bootstrappedFiles} keys=${bootstrappedKeys}`);
  }

  // ========== 阶段 3：导入（CSV 同步） ==========
  console.log("\n=== STAGE 3: IMPORT ===");
  
  // 建立标题池
  const titlePools = new Map();
  function poolOf(ns, locale){
    const k = `${ns}@@${locale}`;
    if (!titlePools.has(k)) titlePools.set(k, new Set());
    return titlePools.get(k);
  }

  for (const cols of rows) {
    const ns = String(cols[idxNamespace] || "").trim();
    const key = String(cols[idxKey] || "").trim();
    if (!ns || !key) continue;

    const isTitleKey = /\.title$/.test(key) || /_title$/.test(key) || /\.sections\.[^\.]+\.title$/.test(key);

    if (isTitleKey) {
      for (const {h, i} of targetLocales) {
        const raw = cols[i] ?? "";
        const clean = protectBrandsAndTickers(stripTags(raw));
        const norm = normalizeTitleLike(clean);
        if (norm) poolOf(ns, h).add(norm);
      }
    }
  }

  // 写入 JSON
  const importStats = {};
  for (const {h: locale} of targetLocales) {
    importStats[locale] = { records: 0, updated: 0, skipped: 0, strippedTags: 0, brandHits: 0, dedupedBody: 0, filled: 0 };
  }

  for (const cols of rows) {
    const ns = String(cols[idxNamespace] || "").trim();
    const key = String(cols[idxKey] || "").trim();
    if (!ns || !key) { 
      for (const {h} of targetLocales) importStats[h].skipped++; 
      continue; 
    }

    for (const {h: locale, i: colIdx} of targetLocales) {
      const stats = importStats[locale];
      stats.records++;

      let val = cols[colIdx] ?? "";
      const before = val;
      
      if (fillMissing && (!val || /^(\s*|TODO_TRANSLATE_|N\/A)$/i.test(val))) {
        const baseIdx = header.indexOf(fillMissing);
        if (baseIdx >= 0) {
          const baseVal = cols[baseIdx] ?? "";
          if (baseVal && !/^(\s*|TODO_TRANSLATE_|N\/A)$/i.test(baseVal)) {
            val = baseVal;
            stats.filled++;
          }
        }
      }

      const stripped = stripTags(val);
      if (stripped !== before) stats.strippedTags++;

      let safe = protectBrandsAndTickers(stripped);
      if (safe !== stripped) stats.brandHits++;

      const looksLikeBody = /\.body$/.test(key) || /_body$/.test(key) || /\.section_\d+$/.test(key) || /\.sections\.[^\.]+\.body$/.test(key) || /\.faq\.section_\d+$/.test(key);

      if (looksLikeBody) {
        const pool = poolOf(ns, locale);
        const after = dedupeBodyLeadingByTitlePool(safe, pool);
        if (after !== safe) stats.dedupedBody++;
        safe = after;
      }

      const rel = path.join(locale, `${ns}.json`);
      if (isExcludedByPath(rel)) { stats.skipped++; continue; }

      const fp = path.join(LOCALES_DIR, rel);
      const cur = readJSONSafe(fp);
      const beforeStr = JSON.stringify(cur);
      setDeep(cur, key, String(safe));
      const afterStr = JSON.stringify(cur);

      if (beforeStr !== afterStr) {
        if (!isExcludedByPath(rel)) writeJSON(fp, cur, dryRun);
        stats.updated++;
      } else {
        stats.skipped++;
      }
    }
  }

  // 打印导入统计
  for (const {h: locale} of targetLocales) {
    const s = importStats[locale];
    console.log(`import: locale=${locale} records=${s.records} updated=${s.updated} skipped=${s.skipped} filled=${s.filled}`);
  }

  // ========== 最终报告 ==========
  console.log("\n=== FINAL REPORT ===");
  for (const {h: locale} of targetLocales) {
    const pre = precheckStats[locale];
    const boot = bootstrapStats[locale];
    const imp = importStats[locale];
    console.log(`--- ${locale} ---`);
    console.log(`precheck: base=${pre.base} missing=${pre.missing} empty=${pre.empty} extra=${pre.extra}`);
    console.log(`bootstrap: base=${boot.base} files=${boot.files} keys=${boot.keys} ${boot.files > 0 ? 'triggered' : 'skipped'}`);
    console.log(`import: records=${imp.records} updated=${imp.updated} skipped=${imp.skipped} filled=${imp.filled}`);
  }

})().catch(e=>{ console.error(e); process.exit(1); });

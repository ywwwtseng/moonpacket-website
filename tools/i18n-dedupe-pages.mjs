#!/usr/bin/env node

import fs from "fs";
import path from "path";

const REPO_ROOT = process.cwd();
const LOCALES_DIR = path.join(REPO_ROOT, "src/i18n/messages");
const locale = (process.argv.find(a => a.startsWith("--locale=")) || "--locale=zh-TW").split("=")[1];

// 1) 题目标题配对：q1_body.* => q1_title
const BODY_TO_TITLE = [
  // send
  { ns: "send", bodyPrefix: /^faq\.q(\d+)_body\./, title: (m) => `faq.q${m[1]}_title` },
  // claim
  { ns: "claim", bodyPrefix: /^faq\.q(\d+)_body\./, title: (m) => `faq.q${m[1]}_title` },
];

// 2) 区块层标题（外层卡片标题），遇到正文首行等于其中之一也去重
const SECTION_TITLE_KEYS = new Set([
  "faq.section_1",
  "faq.section_2",
  "faq.section_3",
  "claim.faq.section_1",
  "claim.faq.section_2",
  "sections.rules",
  "terms.sections.rules",
]);

function readJSON(fp) {
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); } catch { return null; }
}

// 递归取值
function getDeep(obj, dotted) {
  return dotted.split(".").reduce((p, k) => (p && p[k] !== undefined ? p[k] : undefined), obj);
}

// 递归设值
function setDeep(obj, dotted, val) {
  const parts = dotted.split(".");
  let p = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!p[k] || typeof p[k] !== "object") p[k] = {};
    p = p[k];
  }
  p[parts[parts.length - 1]] = val;
}

function normalizeTitle(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/^[\s　]*\d+[\)\.、]\s*/u, "") // 1) / 1. / 1、等编号
    .replace(/[：:]\s*$/u, "")             // 尾部冒号（全/半形）
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function firstLine(text) {
  const t = String(text || "");
  const idx = t.indexOf("\n");
  return (idx === -1 ? t : t.slice(0, idx)).trim();
}

function dedupeOne(ns, nsObj, sectionTitles) {
  let fixed = 0;

  // 找出所有 body.* 键
  const walk = (obj, prefix = "") => {
    Object.keys(obj || {}).forEach(k => {
      const full = prefix ? `${prefix}.${k}` : k;
      const v = obj[k];
      if (typeof v === "object" && v) walk(v, full);
      else if (typeof v === "string" && /\.body\./.test(full)) {
        // 1) 找对应题目标题
        let titleKey = null;
        for (const rule of BODY_TO_TITLE) {
          if (rule.ns !== ns) continue;
          const m = full.match(rule.bodyPrefix);
          if (m) { titleKey = rule.title(m); break; }
        }
        const titleText = titleKey ? getDeep(nsObj, titleKey) : "";
        const secTitleMatches = sectionTitles; // 已准备好的集合

        // 2) 首行
        const head = firstLine(v);

        const headNorm = normalizeTitle(head);
        const titleNorm = normalizeTitle(titleText);

        // 3) 判断是否与"题目标题"相同
        let isDup = (headNorm && titleNorm && headNorm === titleNorm);

        // 4) 或者与"区块层标题"相同
        if (!isDup) {
          for (const sec of secTitleMatches) {
            if (headNorm && normalizeTitle(sec) === headNorm) {
              isDup = true; break;
            }
          }
        }

        if (isDup) {
          const rest = String(v).split("\n");
          rest.shift(); // 去掉首行标题
          const newText = rest.join("\n").trimStart();
          setDeep(nsObj, full, newText);
          fixed++;
        }
      }
    });
  };

  walk(nsObj);
  return fixed;
}

function collectSectionTitles(ns, nsObj) {
  const out = [];
  for (const key of SECTION_TITLE_KEYS) {
    // 只拿当前 namespace 的
    if (!key.startsWith(ns + ".")) continue;
    const v = getDeep(nsObj, key.slice(ns.length + 1));
    if (v) out.push(v);
  }
  return out;
}

function processNamespace(ns) {
  const fp = path.join(LOCALES_DIR, locale, `${ns}.json`);
  const obj = readJSON(fp);
  if (!obj) return { ns, fixed: 0, fp };

  const secTitles = collectSectionTitles(ns, obj);
  const fixed = dedupeOne(ns, obj, secTitles);

  if (fixed > 0) {
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n");
  }
  return { ns, fixed, fp };
}

function main() {
  const targets = ["send", "claim"]; // 只处理这两页
  let total = 0;
  const results = targets.map(processNamespace);
  results.forEach(r => { total += r.fixed; });
  console.log(`[dedupe] locale=${locale} files=${targets.length} fixed=${total}`);
}

main();

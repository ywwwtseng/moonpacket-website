#!/usr/bin/env node
/**
 * scripts/i18n-postprocess-faq.mjs
 * 
 * Post-process FAQ: convert flat qN/aN + section_M to structured sections array
 * Supports claim/send pages, zh-TW/zh-CN/en-US locales
 * Only modifies i18n JSON, never touches styles/animations/waterfall
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'src/i18n/messages';
const PAGES = ['claim', 'send'];              // 需要 FAQ 的頁面
const LOCALES = ['zh-TW', 'zh-CN', 'en-US'];  // 一次處理三語

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function toSections(faq) {
  // 把 flat 的 qN/aN + section_M 轉成 sections[]
  if (!faq || typeof faq !== 'object') return null;

  // 取所有 q/a
  const qa = [];
  for (let i = 1; i <= 999; i++) {
    const q = faq[`q${i}`];
    const a = faq[`a${i}`];
    if (typeof q === 'string' || typeof a === 'string') {
      qa.push({ idx: i, q: q ?? '', a: a ?? '' });
    }
  }
  if (!qa.length) return null;

  // 取所有 section 標題（保持數字序）
  const sections = [];
  for (let s = 1; s <= 99; s++) {
    const title = faq[`section_${s}`];
    if (typeof title === 'string' && title.trim()) {
      sections.push({ s, title });
    }
  }

  // 如果沒有 section，做單段
  if (!sections.length) {
    return [{ title: undefined, items: qa.map(x => ({ q: x.q, a: x.a })) }];
  }

  // 依 CSV 原始鍵序粗略切段：q/a 依 idx 遞增，平均分配到 sections 數
  //（想更精準可在 CSV 增欄位明確標注每題屬於哪個 section）
  const items = qa.map(x => ({ q: x.q, a: x.a }));
  const per = Math.ceil(items.length / sections.length);
  const out = [];
  for (let i = 0; i < sections.length; i++) {
    const start = i * per;
    const end = start + per;
    out.push({
      title: sections[i].title,
      items: items.slice(start, end),
    });
  }
  return out;
}

for (const lang of LOCALES) {
  for (const page of PAGES) {
    const fp = path.join(ROOT, lang, `${page}.json`);
    if (!fs.existsSync(fp)) continue;

    const j = loadJSON(fp);
    if (!j.faq) continue;

    // 已經有結構化 sections 就不覆蓋；沒有才建立
    if (!Array.isArray(j.faq.sections) || j.faq.sections.length === 0) {
      const built = toSections(j.faq);
      if (built) {
        j.faq.sections = built;
        saveJSON(fp, j);
        console.log(`[postprocess] ${lang}/${page}.json → faq.sections built (${built.length} sections)`);
      }
    } else {
      console.log(`[postprocess] ${lang}/${page}.json → faq.sections already exists, skipped`);
    }
  }
}

console.log('FAQ postprocess done.');


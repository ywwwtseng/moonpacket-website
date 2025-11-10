import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 同步所有語言，使其至少包含 zh-TW 擁有的鍵；缺失鍵將寫入占位值
const targets = [
  'en-US','en-GB','zh-CN','ja-JP','ko-KR','ar-SA','de-DE','fr-FR','es-ES','pt-BR','pt-PT','ru-RU','it-IT','nl-NL','sv-SE','da-DK','fi-FI','no-NO','pl-PL','cs-CZ','hu-HU','ro-RO','tr-TR','uk-UA','he-IL','fa-IR','ur-PK','hi-IN','id-ID','vi-VN','th-TH','bn-BD'
];
const root = process.cwd();
const base = resolve(root, 'src/i18n/messages');

// 支持的模块文件（不包括 story，因为它只在 zh-TW 中存在）
const modules = ['site', 'claim', 'send', 'privacy', 'terms', 'waterfall'];

function flat(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out[key] = v;
  }
  return out;
}

function unflat(obj) {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const parts = k.split('.');
    let cur = res;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] ||= {};
    cur[parts[parts.length - 1]] = v;
  }
  return res;
}

function loadJSON(p) {
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, 'utf8'));
}

function saveJSON(p, data) {
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

// 加载 zh-TW 的所有模块
const zhByModule = {};
for (const mod of modules) {
  const modPath = resolve(base, `zh-TW/${mod}.json`);
  zhByModule[mod] = loadJSON(modPath);
}

// 同步到每个目标语言
for (const lg of targets) {
  let anyChanged = false;
  
  for (const mod of modules) {
    const sourcePath = resolve(base, `zh-TW/${mod}.json`);
    const targetPath = resolve(base, `${lg}/${mod}.json`);
    
    const source = zhByModule[mod];
    const target = loadJSON(targetPath);
    
    const sourceFlat = flat(source);
    const targetFlat = flat(target);
    
    let changed = false;
    for (const [k, v] of Object.entries(sourceFlat)) {
      if (!(k in targetFlat)) {
        targetFlat[k] = `⟪TODO⟫ zh-TW: ${String(v)}`;
        changed = true;
      }
    }
    
    if (changed) {
      const next = unflat(targetFlat);
      saveJSON(targetPath, next);
      console.log(`[i18n-sync] updated ${lg}/${mod}.json`);
      anyChanged = true;
    }
  }
  
  if (!anyChanged) {
    console.log(`[i18n-sync] no changes for ${lg}`);
  }
}

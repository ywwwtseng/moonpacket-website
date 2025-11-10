#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const I18N_DIR = resolve(ROOT, 'src/i18n/messages');
const SOURCE_LANG = 'zh-TW';

function loadJson(p){ return JSON.parse(readFileSync(p, 'utf8')); }
function saveJson(p, obj){ writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

function getDesc(obj){
  if (obj && typeof obj === 'object'){
    if (obj.site && obj.site.description) return obj.site.description;
    if (obj.description) return obj.description;
  }
  return '';
}

function setDesc(obj, value){
  if (obj.site && typeof obj.site === 'object'){
    obj.site.description = value;
    return true;
  }
  if (Object.prototype.hasOwnProperty.call(obj, 'description')){
    obj.description = value;
    return true;
  }
  // if neither exists, create site container
  obj.site = obj.site || {};
  obj.site.description = value;
  return true;
}

function main(){
  const langs = readdirSync(I18N_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  const srcPath = resolve(I18N_DIR, SOURCE_LANG, 'site.json');
  const src = loadJson(srcPath);
  const zhDesc = getDesc(src);
  if(!zhDesc){
    console.error('❌ 無法讀取 zh-TW 的 description');
    process.exit(1);
  }
  console.log('🔄 同步 description：', zhDesc);
  for (const lang of langs){
    const p = resolve(I18N_DIR, lang, 'site.json');
    try {
      const j = loadJson(p);
      const value = (lang === SOURCE_LANG) ? zhDesc : `⟪TODO⟫ ${SOURCE_LANG}: ${zhDesc}`;
      setDesc(j, value);
      saveJson(p, j);
      console.log(`✅ ${lang} 已更新`);
    } catch (e){
      console.warn(`⚠️ 略過 ${lang}: ${e.message}`);
    }
  }
  console.log('🎉 完成');
}

main();




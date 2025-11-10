#!/usr/bin/env node
// === args & config ===
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// === args & config ===
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const getArg = (k, def = "") => {
  const i = argv.findIndex(a => a.startsWith(`${k}=`));
  return i >= 0 ? argv[i].split("=").slice(1).join("=") : def;
};

const CSV_PATH = getArg("--csv", path.join(ROOT, 'i18n-export.csv'));
const LANGS_ARG = getArg("--langs", "").trim();
const LANGS_TO_PROCESS = LANGS_ARG ? LANGS_ARG.split(',').map(l => l.trim()) : ['zh-TW','zh-CN','en-US'];
const STRICT = has("--strict");
const OUT_PATH = getArg("--out", path.join(ROOT, 'scripts/reports/i18n-audit.json'));

const SRC_DIR = (lang) => path.join(ROOT, 'src/i18n/messages', lang);
const LANGS = ['zh-TW','zh-CN','en-US'];       // 之後要擴語言只要在這裡 + CSV 欄位即可
const TODO_TOKENS = ['_TODO_', '（TODO）', '__TODO_TRANSLATE__', 'TODO'];
const TRAD_HINT = /[體臺術臺灣為們說與應顯設帳號驗證錢服務隱私權條款數據說明錄廣發紅領餘額]/;
const CJK_HINT = /[\u4E00-\u9FFF]/;

function readJson(f){ return JSON.parse(fs.readFileSync(f,'utf8')); }
function walkJsonFiles(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir)){
    const p=path.join(dir,e); const st=fs.statSync(p);
    if(st.isDirectory()) out.push(...walkJsonFiles(p));
    else if(p.endsWith('.json')) out.push(p);
  } return out;
}
function flatten(obj, base=''){
  const out={};
  for(const k of Object.keys(obj)){
    const v=obj[k]; const key=base?`${base}.${k}`:k;
    if(v && typeof v==='object' && !Array.isArray(v)) Object.assign(out, flatten(v,key));
    else out[key]=v;
  } return out;
}
function splitCSV(line,n){
  const out=[]; let cur='',q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i],nxt=line[i+1];
    if(c==='"'){ if(q&&nxt==='"'){cur+='"';i++;} else q=!q; }
    else if(c===',' && !q){ out.push(cur); cur=''; }
    else cur+=c;
  } out.push(cur); while(out.length<n) out.push(''); return out.map(s=>s.trim());
}
function readCSV(csvPath = CSV_PATH){
  if(!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);
  const raw=fs.readFileSync(csvPath,'utf8').split(/\r?\n/).filter(Boolean);
  const headers=raw[0].split(',').map(s=>s.trim());
  const idx=Object.fromEntries(headers.map((h,i)=>[h,i]));
  // 支持 file 或 namespace 作为文件标识
  if(!('key' in idx) || (!('file' in idx) && !('namespace' in idx))) throw new Error(`CSV 必須含 file/namespace 和 key 欄位`);
  const rows=[];
  for(let i=1;i<raw.length;i++){
    const cols=splitCSV(raw[i],headers.length);
    const r=Object.fromEntries(headers.map((h,j)=>[h,cols[j]??'']));
    // 统一使用 file 字段（如果 CSV 用 namespace，则映射为 file）
    if(r.namespace && !r.file) r.file = r.namespace;
    if(!r.key || !r.file) continue;
    rows.push(r);
  } return {rows, headers};
}
function collectLangKeyset(lang){
  const files=walkJsonFiles(SRC_DIR(lang));
  const perFile=new Map();
  for(const f of files){
    // 过滤受保护的文件
    if(isProtectedFile(f)) continue;
    if(!shouldProcessFile(f)) continue;
    
    const obj=readJson(f);
    const flat=flatten(obj);
    const fileBase=path.basename(f,'.json');
    for(const [k,v] of Object.entries(flat)){
      const key=`${fileBase}.${k}`;
      if(!perFile.has(fileBase)) perFile.set(fileBase,new Map());
      perFile.get(fileBase).set(key,v);
    }
  } return perFile;
}

const LANG = getArg("--lang", process.env.LANG_FILTER || "").trim();

// 使用 config 文件的保护列表
let PROTECT = [];
try {
  const cfg = JSON.parse(fs.readFileSync("scripts/i18n.config.json", "utf8"));
  PROTECT = cfg.protectedGlobs || [];
} catch(err){
  // 如果 config 不存在，使用默认值
}

const mm = (await import("micromatch")).default;
function shouldProcessFile(file) {
  if (!LANG) return true;
  return file.includes(`/messages/${LANG}/`);
}

function isProtectedFile(filePath) {
  if (!mm || PROTECT.length === 0) return false;
  return mm.isMatch(filePath.replace(/\\/g, "/"), [...PROTECT]);
}

function main(){
  const {rows:csv, headers} = readCSV();
  const csvLangs = headers.filter(h=>!['file','key','namespace'].includes(h));
  let langSet = Array.from(new Set([...LANGS, ...csvLangs])); // 容錯：若 CSV 多欄位也納入
  
  // 如果指定了 --langs，只处理指定语言
  if(LANGS_ARG){
    langSet = LANGS_TO_PROCESS.filter(l => langSet.includes(l));
    if(langSet.length === 0){
      console.error(`[ERROR] No valid languages found. Available: ${langSet.join(', ')}`);
      process.exit(1);
    }
    console.log(`[AUDIT] Processing languages: ${langSet.join(', ')}`);
  } else if(LANG){
    // 兼容旧参数 --lang
    if(!langSet.includes(LANG)){
      console.error(`[ERROR] Language '${LANG}' not in baseline. Available: ${langSet.join(', ')}`);
      process.exit(1);
    }
    langSet = [LANG];
    console.log(`[AUDIT] Processing language: ${LANG} only`);
  }
  const csvByKey = new Map(csv.map(r=>[`${r.file}.${r.key}`, r]));
  
  // 始终收集 zh-TW 作为基准（即使只处理其他语言）
  const allLangsForBaseline = Array.from(new Set([...LANGS, ...csvLangs]));
  const allLangMaps = Object.fromEntries(allLangsForBaseline.map(l=>[l, collectLangKeyset(l)]));
  const langMaps = Object.fromEntries(langSet.map(l=>[l, allLangMaps[l]]));

  // baseline = zh-TW（可改成你要的基準）
  const baseline = allLangMaps['zh-TW'];
  const baseKeys=new Set();
  if(baseline){
    for(const [,map] of baseline.entries()) for(const k of map.keys()) baseKeys.add(k);
  }

  const report = {
    baseline: 'zh-TW',
    totals: { csv: csv.length, baseline: baseKeys.size },
    missingInCSV: [],          // baseline 有、CSV 沒
    csvUnknownTarget: [],      // CSV 有、baseline 無
    perLang: Object.fromEntries(langSet.map(l=>[l,{
      extra: [],               // CSV 有、該語言 JSON 檔/路徑無（待補）
      missing: [],             // 該語言 JSON 有、CSV 無
      typeMismatch: [],        // CSV 是字串、現值不是字串 → 需人工判斷
      todo: [],                // CSV 值含 TODO
      zhCNTradHint: [],        // zh-CN 疑似含繁體
      enUS_CJK: []             // 英文疑似夾中文
    }]))
  };

  // baseline 有但 CSV 無
  for(const k of baseKeys) if(!csvByKey.has(k)) report.missingInCSV.push(k);
  // CSV 有但 baseline 無
  for(const r of csv){
    const k = `${r.file}.${r.key}`;
    const has = baseline.get(r.file)?.has(k);
    if(!has) report.csvUnknownTarget.push(k);
  }

  // per-lang 檢查
  for(const lang of langSet){
    const maps = langMaps[lang];
    const per = report.perLang[lang];

    // a) CSV 有但 JSON 找不到（正常：代表要寫入）
    for(const r of csv){
      const k=`${r.file}.${r.key}`;
      if(!maps.get(r.file)?.has(k)) per.extra.push(k);

      const val = r[lang] ?? '';
      if(typeof val==='string' && TODO_TOKENS.some(t=>val.includes(t))) per.todo.push(k);
      if(lang==='zh-CN' && typeof val==='string' && /[^\u4e00-\u9fa5]/.test(val) && TRAD_HINT.test(val)) per.zhCNTradHint.push(k);
      if(lang==='en-US' && typeof val==='string' && CJK_HINT.test(val)) per.enUS_CJK.push(k);
    }
    // b) JSON 有但 CSV 無
    for(const [,map] of maps.entries()){
      for(const k of map.keys()){
        if(!csvByKey.has(k)) per.missing.push(k);
      }
    }
    // c) 型別不合（CSV 一律字串；現值若是 array/object/number/boolean → 提醒）
    for(const r of csv){
      const k=`${r.file}.${r.key}`; const cur = maps.get(r.file)?.get(k);
      if(cur==null) continue;
      const t = Array.isArray(cur)?'array':typeof cur;
      if(t!=='string') per.typeMismatch.push({key:k,current:t,incoming:'string'});
    }
  }

  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(OUT_PATH, JSON.stringify(report,null,2));
  console.log(`Audit done → ${OUT_PATH}`);
  
  if(STRICT){
    const issues = [];
    if(report.missingInCSV.length > 0) issues.push(`${report.missingInCSV.length} keys missing in CSV`);
    if(report.csvUnknownTarget.length > 0) issues.push(`${report.csvUnknownTarget.length} CSV entries without JSON target`);
    for(const [lang, per] of Object.entries(report.perLang)){
      if(per.todo.length > 0) issues.push(`${lang}: ${per.todo.length} TODO markers`);
      if(per.typeMismatch.length > 0) issues.push(`${lang}: ${per.typeMismatch.length} type mismatches`);
      if(lang === 'zh-CN' && per.zhCNTradHint.length > 0) issues.push(`${lang}: ${per.zhCNTradHint.length} traditional Chinese hints`);
      if(lang === 'en-US' && per.enUS_CJK.length > 0) issues.push(`${lang}: ${per.enUS_CJK.length} CJK characters`);
    }
    if(issues.length > 0){
      console.error(`[STRICT MODE] Issues found:`);
      issues.forEach(issue => console.error(`  - ${issue}`));
      process.exit(1);
    }
  }
}

main();


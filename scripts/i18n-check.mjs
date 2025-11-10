#!/usr/bin/env node
// === args & config ===
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src/i18n/messages');

// === args & config ===
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const getArg = (k, def = "") => {
  const i = argv.findIndex(a => a.startsWith(`${k}=`));
  return i >= 0 ? argv[i].split("=").slice(1).join("=") : def;
};

const LANGS_ARG = getArg("--langs", "").trim();
const LANGS_TO_PROCESS = LANGS_ARG ? LANGS_ARG.split(',').map(l => l.trim()) : null;
const OUT_PATH = getArg("--out", path.join(ROOT, 'scripts/reports/i18n-check.json'));
const FAIL_ON_TODO = has("--fail-on-todo");
const FAIL_ON_EMPTY = has("--fail-on-empty");
const FAIL_ON_CN_IN_EN = has("--fail-on-cn-in-en");
const FAIL_ON_TC_IN_ZHCN = has("--fail-on-tc-in-zhCN");

const TODO_TOKENS = ['_TODO_', '（TODO）', '__TODO_TRANSLATE__', 'TODO'];
const CJK = /[\u4E00-\u9FFF]/;
const TRAD_HINT = /[體臺術臺灣為們說與應顯設帳號驗證錢服務隱私權條款數據說明錄廣發紅領餘額]/;

function walk(p){
  const out=[]; if(!fs.existsSync(p)) return out;
  for(const e of fs.readdirSync(p)){
    const f=path.join(p,e), st=fs.statSync(f);
    if(st.isDirectory()) out.push(...walk(f));
    else if(f.endsWith('.json')) out.push(f);
  } return out;
}
function flatten(obj, base=''){
  const out={};
  for(const k of Object.keys(obj)){
    const v=obj[k], key=base?`${base}.${k}`:k;
    if(v && typeof v==='object' && !Array.isArray(v)) Object.assign(out, flatten(v,key));
    else out[key]=v;
  } return out;
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
  let langs = fs.readdirSync(SRC_ROOT).filter(d=>fs.statSync(path.join(SRC_ROOT,d)).isDirectory());
  
  // 如果指定了 --langs，只处理指定语言
  if(LANGS_TO_PROCESS){
    const allLangs = [...langs];
    langs = LANGS_TO_PROCESS.filter(l => allLangs.includes(l));
    if(langs.length === 0){
      console.error(`[ERROR] No valid languages found. Requested: ${LANGS_TO_PROCESS.join(', ')}, Available: ${allLangs.join(', ')}`);
      process.exit(1);
    }
    console.log(`[CHECK] Processing languages: ${langs.join(', ')}`);
  } else if(LANG){
    // 兼容旧参数 --lang
    if(!langs.includes(LANG)){
      console.error(`[ERROR] Language '${LANG}' not found. Available: ${langs.join(', ')}`);
      process.exit(1);
    }
    langs = [LANG];
    console.log(`[CHECK] Processing language: ${LANG} only`);
  }
  const report = {};
  for(const lang of langs){
    const files = walk(path.join(SRC_ROOT,lang));
    const rec = report[lang] = { todo:[], empty:[], enUS_CJK:[], zhCN_TradHint:[] };

    for(const f of files){
      // 过滤受保护的文件
      if(isProtectedFile(f)) continue;
      if(!shouldProcessFile(f)) continue;
      
      const obj = JSON.parse(fs.readFileSync(f,'utf8'));
      const flat = flatten(obj);
      for(const [k,v] of Object.entries(flat)){
        const key = `${path.basename(f,'.json')}.${k}`;
        if(typeof v!=='string') continue;
        if(!v) rec.empty.push(key);
        if(TODO_TOKENS.some(t=>v.includes(t))) rec.todo.push(key);
        if(lang==='en-US' && CJK.test(v)) rec.enUS_CJK.push(key);
        if(lang==='zh-CN' && TRAD_HINT.test(v)) rec.zhCN_TradHint.push(key);
      }
    }
  }
  const outDir = path.dirname(OUT_PATH);
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(OUT_PATH, JSON.stringify(report,null,2));
  console.log(`Check done → ${OUT_PATH}`);
  
  // 检查失败条件
  const issues = [];
  for(const [lang, rec] of Object.entries(report)){
    if(FAIL_ON_TODO && rec.todo.length > 0) issues.push(`${lang}: ${rec.todo.length} TODO markers`);
    if(FAIL_ON_EMPTY && rec.empty.length > 0) issues.push(`${lang}: ${rec.empty.length} empty strings`);
    if(FAIL_ON_CN_IN_EN && lang === 'en-US' && rec.enUS_CJK.length > 0) issues.push(`${lang}: ${rec.enUS_CJK.length} CJK characters`);
    if(FAIL_ON_TC_IN_ZHCN && lang === 'zh-CN' && rec.zhCN_TradHint.length > 0) issues.push(`${lang}: ${rec.zhCN_TradHint.length} traditional Chinese hints`);
  }
  
  if(issues.length > 0){
    console.error(`[CHECK FAILED] Issues found:`);
    issues.forEach(issue => console.error(`  - ${issue}`));
    process.exit(1);
  }
}

main();


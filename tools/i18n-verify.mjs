#!/usr/bin/env node
import fs from "fs";
import path from "path";

const REPO = process.cwd();
const LOCALES = path.join(REPO, "src/i18n/messages");

const base = (process.argv.find(a=>a.startsWith("--base="))||"--base=en-US").split("=")[1];
const target = (process.argv.find(a=>a.startsWith("--locale="))||"--locale=ar-SA").split("=")[1];

const nsFiles = fs.readdirSync(path.join(LOCALES, base)).filter(f=>f.endsWith(".json"));

const r = (p)=>JSON.parse(fs.readFileSync(p,"utf8"));

const fl = (o,pfx="") => Object.entries(o).flatMap(([k,v]) => typeof v==="object"&&v? fl(v, pfx?`${pfx}.${k}`:k) : [pfx?`${pfx}.${k}`:k]);

let missing=[], extra=[], empty=[];

for (const f of nsFiles){
  const baseObj = r(path.join(LOCALES, base, f));
  const tgtPath = path.join(LOCALES, target, f);
  const tgtObj = fs.existsSync(tgtPath)? r(tgtPath) : {};
  const bKeys = new Set(fl(baseObj));
  const tKeys = new Set(fl(tgtObj));
  for (const k of bKeys) if(!tKeys.has(k)) missing.push(`${f}:${k}`);
  for (const k of tKeys) if(!bKeys.has(k)) extra.push(`${f}:${k}`);
  for (const k of tKeys){
    const parts = k.split("."); let p=tgtObj; let pBase = baseObj;
    for (const part of parts) { p = p?.[part]; pBase = pBase?.[part]; }
    // 只有目标为空且基准也为空时才不算empty（因为填充了基准的空值）
    if (typeof p==="string" && /^(\s*|TODO_TRANSLATE_|N\/A)$/i.test(p) && !(typeof pBase==="string" && /^(\s*|TODO_TRANSLATE_|N\/A)$/i.test(pBase))) empty.push(`${f}:${k}`);
  }
}

const out = `i18n verify (base=${base} vs ${target})
missing=${missing.length}
extra=${extra.length}
empty=${empty.length}

-- missing --
${missing.join("\n")}

-- empty --
${empty.join("\n")}

-- extra --
${extra.join("\n")}
`;

console.log(out);
fs.writeFileSync(`i18n-verify-${target}.txt`, out);


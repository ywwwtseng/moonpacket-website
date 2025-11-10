// scripts/i18n-normalize.mjs

import fs from "fs";
import path from "path";

const ROOT = "src/i18n/messages";
const targets = ["zh-TW", "zh-CN", "en-US"]; // 需要就加其它语言

// 这些 key 的值在页面里按数组来使用（会 .map）
const ARRAY_FIELDS = [
  // claim 页
  { file: "claim.json", paths: [
    /^faq\.q\d+_body$/,   // q1_body, q2_body ...
    /^faq\.q\d+_notes$/,  // 如果有 notes 之类
  ]},
  // send/claim 里如果也有类似数组字段，可以按需加：
  { file: "send.json", paths: [
    /^faq\.q\d+_body$/,
  ]},
  // privacy/terms 若也存在段落数组，可再添加：
  // { file: "privacy.json", paths: [ /^sections\.\w+\.body$/ ] },
];

function get(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

function set(obj, dotted, val) {
  const ks = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    const k = ks[i];
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[ks[ks.length - 1]] = val;
}

function allKeys(obj, prefix = "") {
  let out = [];
  if (typeof obj !== "object" || obj === null) return out;
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    out.push(full);
    if (typeof obj[k] === "object" && obj[k] !== null) {
      out = out.concat(allKeys(obj[k], full));
    }
  }
  return out;
}

let changedFiles = 0, changedFields = 0;

for (const lang of targets) {
  for (const spec of ARRAY_FIELDS) {
    const file = path.join(ROOT, lang, spec.file);
    if (!fs.existsSync(file)) continue;
    const json = JSON.parse(fs.readFileSync(file, "utf8"));

    const keys = allKeys(json);
    const needFix = [];
    for (const k of keys) {
      if (spec.paths.some(re => re.test(k))) {
        const v = get(json, k);
        if (typeof v === "string") needFix.push(k);        // 本应为数组，却是字符串
        // 若有人误写为对象/数字，一律包一层数组
        if (v !== null && typeof v !== "string" && !Array.isArray(v)) needFix.push(k);
      }
    }

    if (needFix.length) {
      for (const k of needFix) {
        const v = get(json, k);
        // 最稳妥：直接包裹为单段数组；若你希望按空行拆段，可用 v.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean)
        const arr = Array.isArray(v) ? v : [String(v)];
        set(json, k, arr);
        changedFields++;
      }
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
      changedFiles++;
      console.log(`✔ normalized ${lang}/${spec.file}:`, needFix);
    }
  }
}

if (!changedFiles) {
  console.log("No normalization needed. All good ✅");
} else {
  console.log(`Done. Files changed: ${changedFiles}, fields fixed: ${changedFields}`);
}


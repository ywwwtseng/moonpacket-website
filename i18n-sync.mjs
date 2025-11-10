#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import fg from "fast-glob";
import { parse } from "csv-parse/sync";

/** ---------- helpers ---------- */
const loadJson = async (p) => (await fs.pathExists(p)) ? (await fs.readJson(p)) : {};
const saveJson = async (p, obj) => {
  await fs.ensureDir(path.dirname(p));
  await fs.writeJson(p, obj, { spaces: 2 });
};
const normKey = (s) => String(s || "").trim();
const stripTags = (s) =>
  String(s ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .trim();

/** 品牌/币种保护：保持准确大小写与拼写 */
function enforceBrandAndTickers(txt, brandTerms, tickers) {
  if (!txt) return txt;
  // 品牌词：强制成小写且不变形（把大小写错的纠正回小写原样）
  brandTerms.forEach((b) => {
    const re = new RegExp(`\\b${b}\\b`, "gi");
    txt = txt.replace(re, b); // b 是小写
  });
  // 币种：强制完全大写匹配（把小写/混合大小写纠回大写）
  tickers.forEach((t) => {
    const re = new RegExp(`\\b${t}\\b`, "gi");
    txt = txt.replace(re, t); // t 是大写
  });
  return txt;
}

/** 解析 "ns:key" */
function splitNsKey(s) {
  const i = s.indexOf(":");
  if (i === -1) return { ns: "", key: s };
  return { ns: s.slice(0, i), key: s.slice(i + 1) };
}

/** 从代码中扫描到的 key 使用 */
async function scanUsedKeys(globs, patterns) {
  const files = await fg(globs, { dot: true, ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**"] });
  const res = new Set();
  const regexes = patterns.map((p) => new RegExp(p, "g"));
  for (const f of files) {
    const txt = await fs.readFile(f, "utf8");
    regexes.forEach((rx) => {
      let m;
      while ((m = rx.exec(txt))) {
        const raw = m[0];
        const q = /['"]([^'"]+)['"]/.exec(raw);
        if (q && q[1]) res.add(q[1]);
      }
    });
  }
  return res;
}

/** 把 CSV 的行 => Map(ns)->Map(key)->value */
function buildCsvMap(rows, targetLocale) {
  const m = new Map();
  for (const r of rows) {
    const ns = normKey(r.namespace);
    const k = normKey(r.key);
    if (!ns || !k) continue;
    const v = stripTags(r[targetLocale] ?? "");
    if (!m.has(ns)) m.set(ns, new Map());
    m.get(ns).set(k, v);
  }
  return m;
}

/** 载入目标语言所有 namespace JSON */
async function loadLocaleNamespaceMaps(localesDir, targetLocale, pattern) {
  const base = path.join(localesDir, targetLocale);
  const files = await fg(path.join(base, pattern).replace(/\\/g, "/"));
  const maps = new Map();
  for (const f of files) {
    const ns = path.basename(f, path.extname(f));
    maps.set(ns, { file: f, data: await loadJson(f) });
  }
  return maps;
}

/** 报告容器 */
function makeReport() {
  return {
    targetLocale: "",
    totalCsvRows: 0,
    updated: 0,
    created: 0,
    skippedDenyNs: [],
    missingInProject: [],
    extraInProject: [],
    emptyCsvEntries: [],
    brandTickerFixes: 0,
    notTouchedNamespaces: [],
    perNamespace: {}, // { ns: { updated, created, skipped, extraKeys, missingKeys } }
    keyUsageStats: { usedButMissing: [], definedButUnused: [] }
  };
}

/** 输出 Markdown 报告 */
async function writeReportMD(reportPath, R) {
  const lines = [];
  lines.push(`# i18n 同步报告 (${new Date().toISOString()})`);
  lines.push(`- 目标语言：\`${R.targetLocale}\``);
  lines.push(`- CSV 行数：${R.totalCsvRows}`);
  lines.push(`- 更新：${R.updated}，新增：${R.created}，品牌/币种修正：${R.brandTickerFixes}`);
  lines.push(`- 跳过命名空间（保护 hero/跑马灯/瀑布流/动画）：${[...new Set(R.skippedDenyNs)].join(", ") || "无"}`);
  lines.push("");

  lines.push("## 命名空间明细");
  for (const [ns, d] of Object.entries(R.perNamespace)) {
    lines.push(`### ${ns}`);
    lines.push(`- 更新：${d.updated}，新增：${d.created}，跳过：${d.skipped || 0}`);
    if (d.extraKeys?.length) lines.push(`- 项目中存在但 CSV 未提供的 key（保留原值）：${d.extraKeys.length}`);
    if (d.missingKeys?.length) lines.push(`- 代码中使用但项目/CSV缺失的 key：${d.missingKeys.length}`);
    lines.push("");
  }

  lines.push("## 代码使用检查");
  lines.push(`- 代码中使用但 **未找到任何定义** 的 key：${R.keyUsageStats.usedButMissing.length}`);
  if (R.keyUsageStats.usedButMissing.length) {
    lines.push("```");
    lines.push(...R.keyUsageStats.usedButMissing.slice(0, 200));
    lines.push("```");
  }
  lines.push(`- 定义了但 **代码未使用** 的 key（仅供参考）：${R.keyUsageStats.definedButUnused.length}`);
  if (R.keyUsageStats.definedButUnused.length) {
    lines.push("```");
    lines.push(...R.keyUsageStats.definedButUnused.slice(0, 200));
    lines.push("```");
  }
  await fs.writeFile(reportPath, lines.join("\n"), "utf8");
}

/** ---------- main ---------- */
(async function main() {
  const cfg = JSON.parse(await fs.readFile("i18n.config.json", "utf8"));
  const {
    csvPath, targetLocale, localesDir, namespaceFilePattern,
    denyNamespaces, brandTerms, tickers, keyUsageGlobs, keyUsagePatterns,
    reportPath, dryRun
  } = cfg;

  const R = makeReport();
  R.targetLocale = targetLocale;

  // 读取 CSV
  const csvTxt = await fs.readFile(csvPath, "utf8");
  const csv = parse(csvTxt, { columns: true, skip_empty_lines: true });
  R.totalCsvRows = csv.length;

  // CSV -> map
  const csvMap = buildCsvMap(csv, targetLocale);

  // 载入现有 zh-TW 命名空间文件
  const nsMaps = await loadLocaleNamespaceMaps(localesDir, targetLocale, namespaceFilePattern);
  const allNsInProject = new Set(nsMaps.keys());

  // 扫描代码使用的 keys（ns:key）
  const usedKeySet = await scanUsedKeys(keyUsageGlobs, keyUsagePatterns);

  // 汇总：项目中已有的所有 ns:key
  const definedKeys = new Set();
  for (const [ns, { data }] of nsMaps) {
    for (const k of Object.keys(data)) definedKeys.add(`${ns}:${k}`);
  }

  // 对每个命名空间处理
  for (const [ns, keyMap] of csvMap) {
    const deny = denyNamespaces.includes(ns);
    const nsRec = (R.perNamespace[ns] = R.perNamespace[ns] || { updated: 0, created: 0, skipped: 0, extraKeys: [], missingKeys: [] });

    if (deny) {
      R.skippedDenyNs.push(ns);
      nsRec.skipped += keyMap.size;
      continue;
    }

    // 读取或初始化该 ns 的 JSON
    let holder = nsMaps.get(ns);
    if (!holder) {
      holder = { file: path.join(localesDir, targetLocale, `${ns}.json`), data: {} };
      nsMaps.set(ns, holder);
    }

    const data = holder.data;

    // 回填
    for (const [k, rawV] of keyMap) {
      const v0 = stripTags(rawV);
      if (!v0) {
        R.emptyCsvEntries.push(`${ns}:${k}`);
        continue;
      }
      const protectedV = enforceBrandAndTickers(v0, brandTerms, tickers);
      if (protectedV !== v0) R.brandTickerFixes++;

      if (Object.prototype.hasOwnProperty.call(data, k)) {
        if (normKey(data[k]) !== normKey(protectedV)) {
          data[k] = protectedV;
          R.updated++; nsRec.updated++;
        }
      } else {
        data[k] = protectedV;
        R.created++; nsRec.created++;
      }
    }

    // 统计项目里有但 CSV 未给的 key（保留原值，仅报表）
    const csvKeys = new Set([...keyMap.keys()]);
    const extra = Object.keys(data).filter((k) => !csvKeys.has(k));
    if (extra.length) nsRec.extraKeys = extra;

    // 代码使用但此 ns 未提供的 key（缺失提示）
    const missingInThisNs = [...usedKeySet]
      .filter((s) => splitNsKey(s).ns === ns)
      .map(splitNsKey)
      .filter(({ key }) => !(key in data))
      .map(({ key }) => `${ns}:${key}`);
    if (missingInThisNs.length) nsRec.missingKeys = missingInThisNs;
  }

  // 哪些命名空间完全没动到
  R.notTouchedNamespaces = [...allNsInProject].filter((ns) => !(ns in R.perNamespace));

  // 代码使用检查：used but missing / defined but unused
  R.keyUsageStats.usedButMissing = [...usedKeySet].filter((s) => !definedKeys.has(s));
  R.keyUsageStats.definedButUnused = [...definedKeys].filter((s) => !usedKeySet.has(s));

  // 写回（非 dryRun）
  if (!dryRun) {
    for (const [ns, holder] of nsMaps) {
      if (denyNamespaces.includes(ns)) continue; // 保护
      await saveJson(holder.file, holder.data);
    }
  }

  // 报告
  await writeReportMD(reportPath, R);

  // 终端摘要
  console.log(`✅ i18n sync done. targetLocale=${targetLocale} updated=${R.updated} created=${R.created}`);
  console.log(`↗ report: ${reportPath}`);
  if (R.skippedDenyNs.length) {
    console.log(`⚠ skipped namespaces: ${[...new Set(R.skippedDenyNs)].join(", ")}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});


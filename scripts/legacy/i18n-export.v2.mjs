import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ----------------------
// 可按项目实际情况改这里
// ----------------------
const LOCALES = ['zh-TW', 'zh-CN', 'en-US'];
const MESSAGES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/i18n/messages'
);
const OUTPUT_CSV = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../i18n-export.csv'
);

// 读取每种语言的 messages JSON
function loadLocaleMap(locale) {
  const localeDir = path.join(MESSAGES_DIR, locale);
  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
  const obj = {};
  for (const file of files) {
    const namespace = file.replace('.json', '');
    const filePath = path.join(localeDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      obj[namespace] = JSON.parse(content);
    } catch (err) {
      console.warn(`⚠️ Failed to parse ${filePath}: ${err.message}`);
      obj[namespace] = {};
    }
  }
  return obj;
}

// 判断是否是「纯字串数组」
function isArrayOfStrings(v) {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

// 我们要"拍平"对象，把所有可翻译节点抓成一堆 { namespace, key, valuesPerLocale }
function collectTranslatableStrings(allLocalesData) {
  // allLocalesData = { 'zh-TW': {...}, 'zh-CN': {...}, 'en-US': {...} }

  // 为了收集时有完整 key 路径，我们写一个递归
  // pathParts: 例如 ["claim","faq","q1_body"] / 再加上 ".0" ".1" for array
  const rows = [];

  // 帮助函数：把 (namespace + 在该 namespace 内的路径) 组合成我们最终 CSV 的 key 栏
  function makeKey(pathParts) {
    // pathParts[0] 其实就是 namespace
    // 我们 CSV 里要分成两个字段：
    //   namespace: pathParts[0]
    //   key: pathParts.slice(1).join('.')
    // 这里不直接组，等 pushRow 的时候再拆。
    return pathParts;
  }

  function pushRow(pathParts, localeValuesByLang) {
    // localeValuesByLang = { 'zh-TW': "...", 'zh-CN': "...", 'en-US': "..." }
    // pathParts[0] 是 namespace
    const namespace = pathParts[0];
    const key = pathParts.slice(1).join('.'); // 剩下当成 key
    rows.push({
      namespace,
      key,
      ...localeValuesByLang
    });
  }

  // 递归扫描所有 locale 的并集路径
  function walk(pathParts, localeObjs) {
    // localeObjs: { 'zh-TW': <any>, 'zh-CN': <any>, 'en-US': <any> }
    // 先聚合这些 locale 的值 (每个 locale 某条路径下的值)
    const sampleVal = localeObjs['zh-TW'] ?? localeObjs['en-US'] ?? localeObjs['zh-CN'];

    // 如果是 string => 直接收
    if (typeof sampleVal === 'string') {
      const rowLocales = {};
      for (const lang of LOCALES) {
        const val = localeObjs[lang];
        rowLocales[lang] = (typeof val === 'string') ? val : '';
      }
      pushRow(pathParts, rowLocales);
      return;
    }

    // 如果是「纯字串数组」=> 每个 index 收一行
    if (isArrayOfStrings(sampleVal)) {
      const maxLen = Math.max(
        ...LOCALES.map(lang => {
          const v = localeObjs[lang];
          return isArrayOfStrings(v) ? v.length : 0;
        })
      );
      for (let i = 0; i < maxLen; i++) {
        const rowLocales = {};
        for (const lang of LOCALES) {
          const arr = localeObjs[lang];
          if (isArrayOfStrings(arr) && typeof arr[i] === 'string') {
            rowLocales[lang] = arr[i];
          } else {
            rowLocales[lang] = '';
          }
        }
        pushRow([...pathParts, String(i)], rowLocales);
      }
      return;
    }

    // 如果是 object => 继续往下走
    if (sampleVal && typeof sampleVal === 'object' && !Array.isArray(sampleVal)) {
      // 遍历所有 keys (并集)
      const keySet = new Set();
      for (const lang of LOCALES) {
        const obj = localeObjs[lang];
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          for (const k of Object.keys(obj)) {
            keySet.add(k);
          }
        }
      }
      for (const k of keySet) {
        const childLocales = {};
        for (const lang of LOCALES) {
          const obj = localeObjs[lang];
          childLocales[lang] = (obj && typeof obj === 'object')
            ? obj[k]
            : undefined;
        }
        walk([...pathParts, k], childLocales);
      }
      return;
    }

    // 其它类型 (number, boolean, array<obj>...) => 跳过，不收
  }

  // 顶层是 namespace 层：claim / nav / hero / ...
  // 以 zh-TW 为基准拿所有 namespace；也合并 zh-CN / en-US 以防差异
  const allNamespaces = new Set();
  for (const lang of LOCALES) {
    const rootObj = allLocalesData[lang] || {};
    Object.keys(rootObj).forEach(ns => allNamespaces.add(ns));
  }

  for (const ns of allNamespaces) {
    const perLocaleNsVal = {};
    for (const lang of LOCALES) {
      const rootObj = allLocalesData[lang] || {};
      perLocaleNsVal[lang] = rootObj[ns];
    }
    walk([ns], perLocaleNsVal);
  }

  return rows;
}

// 简单 CSV 转义+输出
function toCSV(rows) {
  // header
  const header = ['namespace','key',...LOCALES];
  const lines = [header];

  for (const r of rows) {
    const line = [
      r.namespace,
      r.key,
      ...LOCALES.map(lang => r[lang] ?? '')
    ].map( cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    lines.push(line);
  }

  return lines.map(cols => cols.join(',')).join('\n');
}

function main() {
  // 1. 读入每个语言的 JSON
  const allLocalesData = {};
  for (const lang of LOCALES) {
    allLocalesData[lang] = loadLocaleMap(lang);
  }

  // 2. 拍平 -> rows
  const rows = collectTranslatableStrings(allLocalesData);

  // 3. 排序 (为了稳定性，排一下 namespace + key)
  rows.sort((a,b)=>{
    if (a.namespace !== b.namespace) return a.namespace.localeCompare(b.namespace);
    return a.key.localeCompare(b.key);
  });

  // 4. 写 CSV
  const csvText = toCSV(rows);
  fs.writeFileSync(OUTPUT_CSV, csvText, 'utf8');
  console.log(`Exported ${rows.length} rows -> ${OUTPUT_CSV}`);
}

main();

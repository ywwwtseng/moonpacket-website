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
const INPUT_CSV = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../i18n-export.csv'
);

// 工具：读取 JSON
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
  return { filePath: localeDir, data: obj };
}

// 工具：安全写回 JSON
function saveLocaleMap(localeDir, data) {
  // data 是 { namespace: {...} } 格式
  for (const [namespace, content] of Object.entries(data)) {
    const filePath = path.join(localeDir, `${namespace}.json`);
    const out = JSON.stringify(content, null, 2) + '\n';
    fs.writeFileSync(filePath, out, 'utf8');
  }
}

// 把 "a.b.c.0" 拆成 path = ["a","b","c"], index=0 (或 null)
// 我们要支持 array index，像 faq.q1_body.0 -> q1_body 是 array, 0 是 index
function splitKeyToPathAndMaybeIndex(fullKey) {
  const parts = fullKey.split('.');
  if (parts.length === 0) return { pathParts: [], arrayIndex: null };

  // 如果最后一段是纯数字，代表 array index
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) {
    return {
      pathParts: parts.slice(0, -1),
      arrayIndex: Number(last)
    };
  }
  return {
    pathParts: parts,
    arrayIndex: null
  };
}

// 取到原本对象里对应的值，以及它的 parent 方便回写
function getRefAndType(root, namespace, pathParts, arrayIndex) {
  // root[namespace]...pathParts
  let parent = root;
  if (!(namespace in parent)) return { kind: 'missing' };
  parent = parent[namespace];

  // 走 pathParts
  for (let i=0; i<pathParts.length; i++) {
    const key = pathParts[i];
    if (
      parent &&
      typeof parent === 'object' &&
      !Array.isArray(parent) &&
      key in parent
    ) {
      parent = parent[key];
    } else {
      return { kind: 'missing' };
    }
  }

  // 现在 parent 可能是 string / array / object ...
  if (arrayIndex === null) {
    // 直接在 parent 上写
    if (typeof parent === 'string') {
      return { kind: 'string', parentContainer: null, parentKey: null, valueRef: parent, containerRef: null };
    }
    if (Array.isArray(parent) && parent.every(x => typeof x === 'string')) {
      // 这里是 array 整体，但没指定 index => 不允许整体覆盖
      return { kind: 'stringArrayWhole', arrRef: parent };
    }
    if (parent && typeof parent === 'object') {
      // 是对象，不是字串 => 不允许覆盖
      return { kind: 'objectLike' };
    }
    return { kind: 'other' };
  } else {
    // 有 arrayIndex，期望 parent 是 array<string>
    if (Array.isArray(parent) && parent.every(x => typeof x === 'string')) {
      if (parent[arrayIndex] === undefined) {
        // index 不存在 => 也当 missing
        return { kind: 'missing' };
      }
      return {
        kind: 'stringArrayIndex',
        arrRef: parent,
        idx: arrayIndex,
        currentVal: parent[arrayIndex]
      };
    }
    return { kind: 'other' };
  }
}

// 设值函数：根据 kind 去更新
// 注意：只有在 newVal 非空字串时才做
function tryApplyUpdate(root, namespace, fullKey, newVal) {
  if (!newVal || newVal.trim() === '') {
    // 空字串 => 跳过，不覆盖旧值
    return { updated: false, reason: 'empty' };
  }

  const { pathParts, arrayIndex } = splitKeyToPathAndMaybeIndex(fullKey);
  const refInfo = getRefAndType(root, namespace, pathParts, arrayIndex);

  if (refInfo.kind === 'string') {
    // 我们要沿路重新拿 parent container 来真正写值，而不是只读
    // 重走一遍到它的上层，最后一段写入
    let container = root[namespace];
    for (let i=0; i<pathParts.length-1; i++) {
      container = container[pathParts[i]];
    }
    const finalKey = pathParts[pathParts.length-1];
    if (typeof container[finalKey] === 'string') {
      container[finalKey] = newVal;
      return { updated: true };
    }
    return { updated: false, reason: 'type-changed' };
  }

  if (refInfo.kind === 'stringArrayIndex') {
    // 直接改 arrRef[idx]
    refInfo.arrRef[refInfo.idx] = newVal;
    return { updated: true };
  }

  // 其它类型 / object / missing / arrayWhole不让改
  return { updated: false, reason: refInfo.kind };
}

// 简易 CSV 读取器（我们假设 CSV 是我们导出的格式，所以是安全的、逗号分隔、双引号包裹）
function parseCSV(text) {
  // 非完整通用 CSV parser，但满足我们的导出格式：
  // 每行： "field1","field2","field3",...
  // 双引号内可能有 "" 代表转义的 "
  // 不考虑换行嵌在单元格里的情况（如果需要换行，我们导出时已经转义在同一个字段里，不会打断行）
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (!lines.length) return { header: [], rows: [] };

  function parseLine(line) {
    const cells = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // 读一个引号包的字段
        i++;
        let buf = '';
        while (i < line.length) {
          if (line[i] === '"') {
            // 遇到引号，可能是结束或转义
            if (line[i+1] === '"') {
              // 转义的 ""
              buf += '"';
              i += 2;
            } else {
              // 字段结束
              i++;
              break;
            }
          } else {
            buf += line[i];
            i++;
          }
        }
        // 之后可能遇到逗号
        if (line[i] === ',') i++;
        cells.push(buf);
      } else {
        // 理论上我们导出时每格都会双引号包住，所以这里不该进来
        // 但为了容错，读到下一个逗号或行尾
        let start = i;
        while (i < line.length && line[i] !== ',') i++;
        const raw = line.slice(start, i).trim();
        if (line[i] === ',') i++;
        cells.push(raw.replace(/^"|"$/g,''));
      }
    }
    return cells;
  }

  const header = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { header, rows };
}

function main() {
  // 1. 读入 CSV
  const csvText = fs.readFileSync(INPUT_CSV, 'utf8');
  const { header, rows } = parseCSV(csvText);

  // header 应该是: ["namespace","key","zh-TW","zh-CN","en-US"]
  const nsIdx = header.indexOf('namespace');
  const keyIdx = header.indexOf('key');
  const langColIdx = {};
  for (const lang of LOCALES) {
    langColIdx[lang] = header.indexOf(lang);
  }

  // 2. 载入各语言的 JSON 为 in-memory 可修改对象
  const localeStates = {};
  for (const lang of LOCALES) {
    const { filePath, data } = loadLocaleMap(lang);
    localeStates[lang] = { filePath, data };
  }

  // 3. 合并
  // 对 CSV 的每一行：
  //   namespace = row[nsIdx]
  //   fullKey = row[keyIdx]
  //   针对每个 lang:
  //     newVal = row[langColIdx[lang]]
  //     tryApplyUpdate(localeStates[lang].data, namespace, fullKey, newVal)
  //
  // 规则：空字串 newVal => 跳过（保留原本）
  // 只更新 string or string[] index
  rows.forEach(cells => {
    const namespace = cells[nsIdx];
    const fullKey   = cells[keyIdx];

    // 如果 namespace 或 key 是空的，直接跳过
    if (!namespace || !fullKey) return;

    for (const lang of LOCALES) {
      const colIndex = langColIdx[lang];
      if (colIndex === -1) continue; // CSV 里根本没这一列
      const newVal = cells[colIndex] ?? '';
      tryApplyUpdate(localeStates[lang].data, namespace, fullKey, newVal);
    }
  });

  // 4. 写回文件 (格式化 + '\n')
  for (const lang of LOCALES) {
    const { filePath, data } = localeStates[lang];
    saveLocaleMap(filePath, data);
    console.log(`Updated ${filePath}`);
  }

  console.log('Import merge done. Please run dev and manually QA pages before merging branch.');
}

main();

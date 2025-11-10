// src/utils/text.ts
export function stripTags(s = ""): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function normalizeForCompare(s = ""): string {
  return stripTags(s)
    .replace(/[（）\(\)\[\]【】]/g, " ")
    .replace(/^[\s　]*([QＱ]?\s*\d+[\)\.．、:：）]?)/, "") // 去前导编号: "1) "、"1."、"１）" 等
    .replace(/^\s*[-–—•]\s*/, "")                       // 去项目符号
    .replace(/[：:]\s*$/, "")                           // 行末冒号
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const A = new Set(a.split(" "));
  const B = new Set(b.split(" "));
  const inter = [...A].filter(x => B.has(x)).length;
  return inter / Math.max(A.size, B.size);
}

export function normalizeTitleLike(s: string): string {
  if (!s) return "";
  let t = s.replace(/<[^>]*>/g, "")
           .replace(/&lt;|&gt;|&amp;|&quot;|&#39;/g, m =>
             ({ "&lt;":"<","&gt;":">","&amp;":"&","&quot;":'"',"&#39;":"'"} as any)[m]
           );
  t = t.replace(/[：﹕]/g, ":")
       .replace(/[，﹐]/g, ",")
       .replace(/[（﹙]/g, "(")
       .replace(/[）﹚]/g, ")")
       .replace(/[．。]/g, ".")
       .replace(/[、]/g, ",")
       .replace(/^\s*([0-9０-９①-⑨]+[)\]\.、．]|[-•\*])\s*/u, "");
  return t.trim().toLowerCase().replace(/\s+/g, " ");
}

export function dropLeadingDupFromBody(
  body: string | string[],
  title?: string,
  sectionTitle?: string
): string | string[] {
  const arr = Array.isArray(body) ? body.slice() : String(body).split(/\r?\n/);
  // 找正文第一条有效行
  const idx = arr.findIndex(x => String(x).trim().length > 0);
  if (idx < 0) return body;

  const first = String(arr[idx]);
  const A = normalizeTitleLike(first);
  const B = normalizeTitleLike(title || "");
  const C = normalizeTitleLike(sectionTitle || "");

  // 完全等价就删掉首行
  if (A && (A === B || A === C)) {
    arr.splice(idx, 1);
  }
  return Array.isArray(body) ? arr : arr.join("\n");
}

/**
 * 若 body 首行与 title 重复/极相似，则移除该首行，仅保留正文。
 * - 只在渲染时处理，不改 i18n 源数据。
 * - 不影响品牌词、链接、动画与其它区块。
 */
export function bodyWithoutRepeatedHeading(title = "", body = ""): string {
  if (!body) return body;
  const lines = String(body).split(/\r?\n/);

  // 找第一条非空行
  let i = -1;
  for (let k = 0; k < lines.length; k++) {
    if (String(lines[k]).trim()) { i = k; break; }
  }
  if (i < 0) return body;

  const first = lines[i];
  const tNorm = normalizeForCompare(title);
  const fNorm = normalizeForCompare(first);

  if (tNorm && fNorm && (tNorm === fNorm || similarity(tNorm, fNorm) >= 0.9)) {
    lines.splice(i, 1);
  }
  return lines.join("\n");
}

/**
 * 按空行分段；单行内保留换行为 <br>
 */
export function renderParagraphs(raw: string): string[] {
  const text = String(raw || "");
  const blocks = text.split(/\r?\n\r?\n/);        // 按空行切成段
  return blocks.map(b => b.replace(/\r?\n/g, "<br/>")).filter(Boolean);
}

/**
 * 安全地把 \n 映射成 <br/>，不影响已存在的 <br/>
 */
export function htmlWithLineBreaks(s: string): string {
  return (s || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '<br/>');
}

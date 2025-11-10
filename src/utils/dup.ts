// src/utils/dup.ts
function normTitleLike(s: string): string {
  return (s || "")
    .replace(/<[^>]*>/g, "")     // 去 HTML 標籤
    .replace(/^\s*\d+\)\s*/, "") // 去「1) 」「2) 」等
    .replace(/[：:]\s*$/, "")    // 去尾端冒號
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

// Dice 相似度（bigrams）
function dice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (t: string) => {
    const r: string[] = [];
    for (let i = 0; i < t.length - 1; i++) r.push(t.slice(i, i + 2));
    return r;
  };
  const A = grams(a), B = grams(b);
  if (!A.length || !B.length) return 0;
  let inter = 0;
  const m = new Map<string, number>();
  for (const g of A) m.set(g, (m.get(g) || 0) + 1);
  for (const g of B) {
    const n = m.get(g) || 0;
    if (n > 0) { inter++; m.set(g, n - 1); }
  }
  return (2 * inter) / (A.length + B.length);
}

export function isDup(line: string, title: string, th = 0.90): boolean {
  const L = normTitleLike(line);
  const T = normTitleLike(title);
  if (!L || !T) return false;
  if (L === T) return true;
  return dice(L, T) >= th;
}

/**
 * 僅在渲染前移除「正文開頭那一段若與標題相似」；
 * 其它 HTML/換行（<br/>、\n）全部保留，不重排。
 */
export function dropLeadingDupFromBodyHtml(html: string, title: string): string {
  if (!html) return "";
  const splitter = /(?:<br\s*\/?>|\r?\n)+/i;           // 以 <br> 或換行視為段落分隔
  const trimmed = html.replace(/^\s+/, "");
  const firstSplit = trimmed.split(splitter, 1)[0] ?? "";
  const firstText = firstSplit.replace(/<[^>]*>/g, "").trim();
  if (isDup(firstText, title)) {
    return trimmed.slice(firstSplit.length).replace(splitter, ""); // 砍掉重複首段與緊鄰分隔
  }
  return html;
}

// src/utils/normalize.ts

export function linesArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  
  if (typeof val === 'string') {
    // 支持 csv 里用 \n 或 \\n 的两种情况
    return val.replace(/\\n/g, '\n').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  
  return [];
}

// 容錯陣列：將未知型別值標準化為陣列，避免 .map() 在字串/undefined 上崩潰
export function ensureArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value === null || value === undefined) return [];
  return [value as T];
}


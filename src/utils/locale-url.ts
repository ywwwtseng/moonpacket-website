// src/utils/locale-url.ts

export type TrailingSlash = "always" | "never" | "ignore";

// 若 astro.config.mjs 改了 trailingSlash，请同步这里或由调用方传入
export const SITE_TRAILING_SLASH: TrailingSlash = "always";

/**
 * 把当前 URL 切换到目标语言：
 * - 保留 path（剔除当前语言段）
 * - 保留 search 与 hash
 * - 遵守 trailingSlash 规则
 * - 语言段统一用 "<locale>/"
 */
export function buildLocaleUrl(targetLocale: string, current: URL, supported: string[]): string {
  const parts = current.pathname.split("/").filter(Boolean); // ["en-US","claim"]
  const curLocale = supported.includes(parts[0]) ? parts[0] : null;
  const rest = curLocale ? parts.slice(1) : parts;          // ["claim"]
  let newPath = `/${targetLocale}/${rest.join("/")}`;

  if (SITE_TRAILING_SLASH === "always") {
    if (!newPath.endsWith("/")) newPath += "/";
  } else if (SITE_TRAILING_SLASH === "never") {
    if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
  }
  // ignore 就保持原样

  const qs = current.search; // ?tab=...&page=...
  const hash = current.hash || "";
  return newPath + qs + hash;
}


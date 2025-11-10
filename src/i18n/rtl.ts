// RTL baseline: ar-SA. Other RTL locales must follow the exact same layout rules.
export const RTL_LOCALES = new Set(["ar-SA","fa-IR","he-IL","ur-PK"]);

export function isRTL(locale?: string) {
  const s = (locale || "").trim();
  return RTL_LOCALES.has(s) || RTL_LOCALES.has(s.split("-")[0]);
}


export type Locale = {
  code: string; // e.g., en-US
  name: string; // English (US)
  rtl?: boolean;
  published?: boolean; // Whether to build static pages and show in UI
};

// 1. 未来路线图里我们会维护 / 接受翻译的所有语言
export const ALL_AVAILABLE_LOCALES = [
  { code: 'ar-SA', name: 'العربية' },
  { code: 'bn-BD', name: 'বাংলা' },
  { code: 'cs-CZ', name: 'Čeština' },
  { code: 'da-DK', name: 'Dansk' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'el-GR', name: 'Ελληνικά' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fa-IR', name: 'فارسی' },
  { code: 'fi-FI', name: 'Suomi' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'he-IL', name: 'עברית' },
  { code: 'hi-IN', name: 'हिन्दी' },
  { code: 'hu-HU', name: 'Magyar' },
  { code: 'id-ID', name: 'Bahasa Indonesia' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'nl-NL', name: 'Nederlands' },
  { code: 'no-NO', name: 'Norsk' },
  { code: 'pl-PL', name: 'Polski' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Português (Portugal)' },
  { code: 'ro-RO', name: 'Română' },
  { code: 'ru-RU', name: 'Русский' },
  { code: 'sv-SE', name: 'Svenska' },
  { code: 'th-TH', name: 'ไทย' },
  { code: 'tr-TR', name: 'Türkçe' },
  { code: 'uk-UA', name: 'Українська' },
  { code: 'ur-PK', name: 'اردو' },
  { code: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
] as const;

// 2. 目前正式对外开放 (UI 菜单、SEO hreflang、静态路由都会用它)
export const PUBLIC_LOCALES = [
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English (US)' },
] as const;

// 2b. 所有语言代码数组（包含草稿语言）
export const ALL_LOCALES = [
  'zh-TW', 'zh-CN', 'en-US',
  // 草稿语言（保留列表，不影响当前 build）
  'ja-JP', 'ko-KR', 'ar-SA', 'pt-BR', 'fr-FR', 'de-DE', 'es-ES', 'ru-RU', 'it-IT', 'id-ID', 'th-TH', 'vi-VN', 'uk-UA', 'tr-TR', 'pt-PT', 'pl-PL', 'nl-NL', 'sv-SE', 'fa-IR', 'he-IL', 'hi-IN', 'hu-HU', 'el-GR', 'bn-BD', 'cs-CZ', 'da-DK', 'no-NO', 'ro-RO', 'ur-PK', 'en-GB', 'fi-FI'
] as const;

// 3. 工具函数
export const ALL_LOCALE_CODES = ALL_AVAILABLE_LOCALES.map(l => l.code);
export const PUBLIC_LOCALE_CODES = PUBLIC_LOCALES.map(l => l.code);

// 向后兼容：保留原有的 locales 数组和 publicLocales
export const locales: Locale[] = ALL_AVAILABLE_LOCALES.map(loc => ({
  ...loc,
  published: PUBLIC_LOCALE_CODES.includes(loc.code as any),
  rtl: ['ar-SA', 'fa-IR', 'he-IL', 'ur-PK'].includes(loc.code)
}));

export const defaultLocale = 'zh-TW';

export const publicLocales = locales.filter(l => l.published);

// 获取用于构建的语言列表（根据 PUBLIC_ONLY 环境变量）
export function getLocalesForBuild(): typeof locales {
  // 在 Astro 构建时，process.env 和 import.meta.env 都尝试读取
  const isPublicOnly = 
    (typeof process !== 'undefined' && process.env && process.env.PUBLIC_ONLY === '1') ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_ONLY === '1');
  if (isPublicOnly) {
    return publicLocales;
  }
  return locales;
}

export function isRTL(code: string): boolean {
  return locales.some((l) => l.code === code && l.rtl);
}

export function normalizeLocale(code: string): string {
  const found = locales.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found ? found.code : defaultLocale;
}



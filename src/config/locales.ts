// src/config/locales.ts

export const LOCALE_ORDER = [
  'en-US','en-GB',
  'zh-TW','zh-CN',
  'ja-JP','ko-KR',
  'de-DE','fr-FR','es-ES','it-IT','pt-PT','pt-BR',
  'nl-NL','sv-SE','da-DK','no-NO','fi-FI','pl-PL','cs-CZ','hu-HU','ro-RO','ru-RU','uk-UA','el-GR',
  'tr-TR',
  'id-ID','vi-VN','th-TH','hi-IN','bn-BD',
  'ar-SA','he-IL','fa-IR','ur-PK'
] as const;

type Meta = { code:string; nativeName:string; englishName:string; rtl:boolean };

export const LOCALES: Record<string, Meta> = {
  'zh-TW': { code:'zh-TW', nativeName:'繁體中文（台灣）', englishName:'Traditional Chinese (Taiwan)', rtl:false },
  'zh-CN': { code:'zh-CN', nativeName:'简体中文（中国）', englishName:'Simplified Chinese (China)', rtl:false },
  'en-US': { code:'en-US', nativeName:'English (US)', englishName:'English (United States)', rtl:false },
  'ar-SA': { code:'ar-SA', nativeName:'العربية (السعودية)', englishName:'Arabic (Saudi Arabia)', rtl:true },
  'bn-BD': { code:'bn-BD', nativeName:'বাংলা (বাংলাদেশ)', englishName:'Bengali (Bangladesh)', rtl:false },
  'cs-CZ': { code:'cs-CZ', nativeName:'Čeština (Česko)', englishName:'Czech (Czech Republic)', rtl:false },
  'da-DK': { code:'da-DK', nativeName:'Dansk (Danmark)', englishName:'Danish (Denmark)', rtl:false },
  'de-DE': { code:'de-DE', nativeName:'Deutsch (Deutschland)', englishName:'German (Germany)', rtl:false },
  'el-GR': { code:'el-GR', nativeName:'Ελληνικά (Ελλάδα)', englishName:'Greek (Greece)', rtl:false },
  'en-GB': { code:'en-GB', nativeName:'English (UK)', englishName:'English (United Kingdom)', rtl:false },
  'es-ES': { code:'es-ES', nativeName:'Español (España)', englishName:'Spanish (Spain)', rtl:false },
  'fa-IR': { code:'fa-IR', nativeName:'فارسی (ایران)', englishName:'Persian (Iran)', rtl:true },
  'fi-FI': { code:'fi-FI', nativeName:'Suomi (Suomi)', englishName:'Finnish (Finland)', rtl:false },
  'fr-FR': { code:'fr-FR', nativeName:'Français (France)', englishName:'French (France)', rtl:false },
  'he-IL': { code:'he-IL', nativeName:'עברית (ישראל)', englishName:'Hebrew (Israel)', rtl:true },
  'hi-IN': { code:'hi-IN', nativeName:'हिन्दी (भारत)', englishName:'Hindi (India)', rtl:false },
  'hu-HU': { code:'hu-HU', nativeName:'Magyar (Magyarország)', englishName:'Hungarian (Hungary)', rtl:false },
  'id-ID': { code:'id-ID', nativeName:'Bahasa Indonesia', englishName:'Indonesian (Indonesia)', rtl:false },
  'it-IT': { code:'it-IT', nativeName:'Italiano (Italia)', englishName:'Italian (Italy)', rtl:false },
  'ja-JP': { code:'ja-JP', nativeName:'日本語', englishName:'Japanese (Japan)', rtl:false },
  'ko-KR': { code:'ko-KR', nativeName:'한국어', englishName:'Korean (South Korea)', rtl:false },
  'nl-NL': { code:'nl-NL', nativeName:'Nederlands (Nederland)', englishName:'Dutch (Netherlands)', rtl:false },
  'no-NO': { code:'no-NO', nativeName:'Norsk (Norge)', englishName:'Norwegian (Norway)', rtl:false },
  'pl-PL': { code:'pl-PL', nativeName:'Polski (Polska)', englishName:'Polish (Poland)', rtl:false },
  'pt-BR': { code:'pt-BR', nativeName:'Português (Brasil)', englishName:'Brazilian Portuguese (Brazil)', rtl:false },
  'pt-PT': { code:'pt-PT', nativeName:'Português (Portugal)', englishName:'European Portuguese (Portugal)', rtl:false },
  'ro-RO': { code:'ro-RO', nativeName:'Română (România)', englishName:'Romanian (Romania)', rtl:false },
  'ru-RU': { code:'ru-RU', nativeName:'Русский (Россия)', englishName:'Russian (Russia)', rtl:false },
  'sv-SE': { code:'sv-SE', nativeName:'Svenska (Sverige)', englishName:'Swedish (Sweden)', rtl:false },
  'th-TH': { code:'th-TH', nativeName:'ไทย (ประเทศไทย)', englishName:'Thai (Thailand)', rtl:false },
  'tr-TR': { code:'tr-TR', nativeName:'Türkçe (Türkiye)', englishName:'Turkish (Türkiye)', rtl:false },
  'uk-UA': { code:'uk-UA', nativeName:'Українська (Україна)', englishName:'Ukrainian (Ukraine)', rtl:false },
  'ur-PK': { code:'ur-PK', nativeName:'اردو (پاکستان)', englishName:'Urdu (Pakistan)', rtl:true },
  'vi-VN': { code:'vi-VN', nativeName:'Tiếng Việt (Việt Nam)', englishName:'Vietnamese (Vietnam)', rtl:false },
};

export function isRtl(code:string){ return LOCALES[code]?.rtl === true; }

export async function listLocalesWithStatus() {
  // 运行时用 import.meta.glob 检查存在性（仅检测 site.json 作为"已开站"的信号）
  const siteFiles = import.meta.glob('../../src/i18n/messages/**/site.json', { eager: true });

  const readySet = new Set<string>();

  Object.keys(siteFiles).forEach(p=>{
    const m = p.match(/messages\/([^/]+)\/site\.json$/);
    if (m) readySet.add(m[1]);
  });

  // 若為公開部署（PUBLIC_ONLY=1），只顯示公開語言，避免連到未生成的路由
  const publicOnly = (import.meta as any)?.env?.PUBLIC_ONLY === '1' || (typeof process !== 'undefined' && (process as any)?.env?.PUBLIC_ONLY === '1');
  let allowOrder: readonly string[] = LOCALE_ORDER;
  try {
    if (publicOnly) {
      // 動態載入以避免循環依賴
      const mod = await import('../i18n/locales.config');
      const PUB = (mod as any)?.PUBLIC_LOCALE_CODES as readonly string[];
      if (Array.isArray(PUB) && PUB.length) allowOrder = PUB;
    }
  } catch {}

  return allowOrder.map(code => {
    const meta = LOCALES[code];
    return { ...meta, ready: readySet.has(code) };
  });
}


export type Dict = Record<string, any>;

function get(obj: Dict, path: string): any {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}

/**
 * t(lang, messagesAll, key, fallback?) -> string
 * Priority (dynamic fallback by current locale):
 * - If lang = "zh-TW": zh-TW -> en-US -> fallback -> key
 * - If lang = "en-US": en-US -> zh-TW -> fallback -> key
 * - If lang = "ja-JP": ja-JP -> zh-TW -> en-US -> fallback -> key
 * - (future languages follow same pattern: current -> zh-TW -> en-US -> fallback -> key)
 * 
 * Searches within module structure: { common: { roadmap: { title: "..." } } }
 */
// Helper to check if string is empty/TODO
function isEmpty(s: any): boolean {
  if (typeof s !== 'string') return false;
  return /^(\s*|TODO_TRANSLATE_|⟪TODO⟫|N\/A)$/i.test(s);
}

export function t(
  lang: string,
  messagesAll: Record<string, Dict>,
  key: string,
  fallback?: string
): string {
  // Helper to search within module structure
  const searchInModules = (messages: Dict): string | undefined => {
    if (!messages || typeof messages !== 'object') return undefined;
    
    // First try direct key access
    const direct = get(messages, key);
    if (typeof direct === 'string' && !isEmpty(direct)) return direct;
    
    // Then search within each module
    for (const moduleName of Object.keys(messages)) {
      const module = messages[moduleName];
      if (module && typeof module === 'object') {
        const found = get(module, key);
        if (typeof found === 'string' && !isEmpty(found)) return found;
      }
    }
    
    return undefined;
  };

  // Priority: current lang -> zh-TW -> en-US -> fallback -> key
  const cur = searchInModules(messagesAll?.[lang]);
  if (cur) return cur;
  
  const zhTW = searchInModules(messagesAll?.['zh-TW']);
  if (zhTW) return zhTW;
  
  const en = searchInModules(messagesAll?.['en-US'] ?? messagesAll?.['en']);
  if (en) return en;
  
  return fallback ?? key;
}
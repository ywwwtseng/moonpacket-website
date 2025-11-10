import { loadAllMessages } from "./loadMessages";
import { t } from "./t";

export async function buildI18nHelper(lang: string) {
  const current = await loadAllMessages(lang as any);
  const zhTW   = await loadAllMessages("zh-TW" as any);
  const enUS   = await loadAllMessages("en-US" as any);

  const messagesAll = {
    [lang]: current,
    "zh-TW": zhTW,
    "en-US": enUS,
  };

  // returns a lookup function L(key, fallback?)
  return function L(key: string, fallback?: string): string {
    return t(lang, messagesAll, key, fallback);
  };
}


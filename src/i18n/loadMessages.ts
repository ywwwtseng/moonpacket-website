import { ALL_LOCALES } from './locales.config';
type LocaleCode = typeof ALL_LOCALES[number];

// 定义消息模块类型
export type MessageModule = 
  | 'site'
  | 'claim' 
  | 'send'
  | 'privacy'
  | 'terms'
  | 'waterfall'
  | 'groups'
  | 'metrics'
  | 'roadmap'
  | 'story'
  | 'legal'
  | 'common';

// 加载指定语言和模块的消息
export async function loadMessages(locale: LocaleCode, module: MessageModule) {
  try {
    const messages = await import(`./messages/${locale}/${module}.json`);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load ${module} messages for ${locale}:`, error);
    // 如果当前语言加载失败，尝试使用 zh-TW 作为 fallback
    if (locale !== 'zh-TW') {
      try {
        const fallbackMessages = await import(`./messages/zh-TW/${module}.json`);
        return fallbackMessages.default;
      } catch (fallbackError) {
        console.warn(`Failed to load fallback ${module} messages for zh-TW:`, fallbackError);
        return {};
      }
    }
    return {};
  }
}

// 加载指定语言的所有消息模块
export async function loadAllMessages(locale: LocaleCode) {
  const modules: MessageModule[] = ['site', 'claim', 'send', 'privacy', 'terms', 'waterfall', 'groups', 'metrics', 'roadmap', 'common'];
  
  // 为所有语言添加 story 和 legal 模块
  modules.push('story', 'legal');
  
  const allMessages = await Promise.all(
    modules.map(async (module) => {
      const messages = await loadMessages(locale, module);
      return { module, messages };
    })
  );

  // 合并所有模块的消息
  const mergedMessages: Record<string, any> = {};
  
  for (const { module, messages } of allMessages) {
    mergedMessages[module] = messages;
  }

  return mergedMessages;
}

// 向后兼容：加载传统的 common.json
export async function loadCommonMessages(locale: LocaleCode) {
  try {
    const messages = await import(`./messages/${locale}/common.json`);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load common messages for ${locale}:`, error);
    return {};
  }
}

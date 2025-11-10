// 統一從 links.ts 導入所有鏈接常量，避免重複定義
export { BOT_URL, SOCIAL, externals } from './links';

// CTA 連結（主要行動按鈕）
export const CTA_LINKS = {
  mainBot: "https://t.me/moonpacket_bot",
} as const;

// 社群連結（官方社群媒體）
export const SOCIAL_LINKS = {
  channel: "https://t.me/moonpacketofficial",   // Telegram 公告频道
  group: "https://t.me/moonpacketchat",         // Telegram 群组
  x: "https://x.com/mooniniofficial",           // X / Twitter
  youtube: "https://www.youtube.com/@moonpacket", // YouTube
} as const;



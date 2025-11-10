/**
 * 集中式連結與品牌常量配置
 * 所有頁面和組件應引用此處的常量，避免硬編碼 URL
 */

export const LINKS = {
  // 品牌名稱
  brandName: "moonpacket",
  
  // 官方網站
  website: "https://yourdomain.com", // TODO: replace with production domain
  
  // Telegram 相關
  telegramPublicGroup: "https://t.me/+example-group", // TODO: replace with production group link
  telegramChannel: "https://t.me/+example-channel", // TODO: replace with production channel link
  telegramSupport: "https://t.me/MoonPackageDevBot", // TODO: replace with production bot username
  
  // 社群媒體
  xAccount: "https://twitter.com/moonpacket", // TODO: replace with production X/Twitter account
  youtubeChannel: "https://www.youtube.com/@moonpacket", // TODO: replace with production YouTube channel
  
  // 電子郵件
  emailPrivacy: "mailto:privacy@moonpacket.example", // TODO: replace with production privacy email
  emailSecurity: "mailto:security@moonpacket.example", // TODO: replace with production security email
  emailSupport: "mailto:support@moonpacket.example" // TODO: replace with production support email
} as const;

// 向後兼容：保持與現有 app.ts 的兼容性
export const externals = {
  telegram: {
    supergroup: LINKS.telegramPublicGroup,
    channel: LINKS.telegramChannel,
    supportBot: LINKS.telegramSupport
  },
  x: LINKS.xAccount,
  youtube: LINKS.youtubeChannel,
  email: {
    privacy: LINKS.emailPrivacy,
    security: LINKS.emailSecurity,
    support: LINKS.emailSupport
  },
  website: { 
    homepage: LINKS.website
  }
} as const;

export const SOCIAL = {
  telegram_group: LINKS.telegramPublicGroup,
  telegram_channel: LINKS.telegramChannel,
  x: LINKS.xAccount,
  youtube: LINKS.youtubeChannel
} as const;

export const BOT_URL = LINKS.telegramSupport;

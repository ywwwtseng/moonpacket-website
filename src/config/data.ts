// 中央化外部資料 API 端點（暫以示意 URL，請依實際替換）
// 說明：
// - 若某端點留空，前端會退回使用現有的靜態 JSON（/public/data/*）。
// - 服務端若支援 ETag，前端已以 no-store 拉取，避免被瀏覽器快取住舊資料。

export const DATA_ENDPOINTS = {
  metrics: 'https://stage-app.moonpacket.com/api/metrics',
  waterfall: 'https://stage-app.moonpacket.com/api/waterfall',
  events: 'https://stage-app.moonpacket.com/api/events',
  chats: 'https://stage-app.moonpacket.com/api/chats',
};

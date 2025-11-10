// src/config/i18n-defaults.ts

export const DEFAULT_LOCALE = 'en-US'; // Root page uses

export const RTL_LOCALES = new Set(['ar-SA','fa-IR','he-IL','ur-PK']);

export function isBot(ua='') {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(ua);
}


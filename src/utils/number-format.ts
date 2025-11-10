export function formatFiat(value: number, locale: string, currency = 'USD'): string {
  const n = Number(value == null ? 0 : value);
  // USDT 固定 8 位小數（不使用 Intl 貨幣樣式，避免非 ISO 貨幣代碼報錯）
  if (currency === 'USDT') {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCrypto(value: number, locale: string): string {
  const n = Number(value == null ? 0 : value);
  if (Math.abs(n) >= 1) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(n);
  }
  // < 1: show more precision without losing significant digits
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  }).format(n);
}

export function formatPercent(value: number, locale: string): string {
  const n = Number(value == null ? 0 : value);
  const sign = n === 0 ? '' : n > 0 ? '+' : '';
  const abs = Math.abs(n);
  const text = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${text}%`;
}

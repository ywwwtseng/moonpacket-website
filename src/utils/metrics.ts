export type Placeholders = {
  as_of: string;
  prices: { BTC_USDT: number };
  red_packets: { total_sent: number; total_claimed: number; total_amount_usdt: number };
};

export async function readPlaceholders(fetchFn: typeof fetch, base: string = ''): Promise<Placeholders> {
  const normalizedBase = (base || '').replace(/\/$/, '');
  const isHttp = /^https?:\/\//i.test(normalizedBase);
  if (isHttp) {
    const res = await fetchFn(`${normalizedBase}/data/placeholders.json`);
    if (!res.ok) throw new Error('Failed to load placeholders');
    return (await res.json()) as Placeholders;
  }
  // Build-time or non-HTTP: read from local public directory
  const { readFile } = await import('node:fs/promises');
  const { resolve } = await import('node:path');
  const filePath = resolve(process.cwd(), 'public', 'data', 'placeholders.json');
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as Placeholders;
}

export function formatInteger(value: number): string {
  return Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}



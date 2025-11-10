import { useEffect } from 'react';

type Props = {
  rootSelector?: string;
  intervalMs?: number;
};

function get(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export default function LiveMetrics({ rootSelector = '[data-api-src][data-api-path]', intervalMs = 60000 }: Props) {
  useEffect(() => {
    let cancelled = false;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(rootSelector));

    async function refresh() {
      const bySrc = new Map<string, HTMLElement[]>();
      nodes.forEach((el) => {
        const src = el.getAttribute('data-api-src');
        if (!src) return;
        if (!bySrc.has(src)) bySrc.set(src, []);
        bySrc.get(src)!.push(el);
      });

      for (const [src, group] of bySrc.entries()) {
        try {
          const res = await fetch(src, { cache: 'no-store' });
          if (!res.ok) throw new Error('bad status');
          const json = await res.json();
          const asOf = (json && typeof json.as_of === 'string') ? Date.parse(json.as_of) : undefined;
          const now = Date.now();
          const isStaleByAge = typeof asOf === 'number' && Number.isFinite(asOf)
            ? now - asOf > 10 * 60 * 1000
            : false;
          group.forEach((el) => {
            const path = el.getAttribute('data-api-path')!;
            const value = get(json, path);
            const metric = el.querySelector('[data-metric]');
            const stale = el.querySelector('[data-stale]') as HTMLElement | null;
            if (metric && typeof value !== 'undefined') {
              metric.textContent = String(value);
              if (stale) stale.hidden = !isStaleByAge;
            } else if (stale) {
              stale.hidden = false;
            }
          });
        } catch (e) {
          group.forEach((el) => {
            const stale = el.querySelector('[data-stale]') as HTMLElement | null;
            if (stale) stale.hidden = false;
          });
        }
      }
    }

    const id = window.setInterval(refresh, intervalMs);
    refresh();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [rootSelector, intervalMs]);

  return null;
}



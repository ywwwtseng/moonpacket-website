import { useEffect } from 'react';

type Props = { selector: string };

// DYNAMIC METRICS: tiny island to fetch latest numbers and animate with a flip.
// HOW TO REPLACE API LATER:
// - Change data-api-src on the metric elements to your real endpoint
// - Ensure JSON shape matches the paths used in data-api-path
export default function FlipCounter({ selector }: Props) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!nodes.length) return;

    const bySrc = new Map<string, HTMLElement[]>();
    nodes.forEach((el) => {
      const src = el.getAttribute('data-api-src');
      if (!src) return;
      if (!bySrc.has(src)) bySrc.set(src, []);
      bySrc.get(src)!.push(el);
    });

    function get(obj: any, path: string) {
      return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);
    }

    function format(val: number, decimals: number) {
      try {
        return Intl.NumberFormat(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val);
      } catch {
        const anyVal = val as any;
        return String(anyVal && typeof anyVal.toFixed === 'function' ? anyVal.toFixed(decimals) : val);
      }
    }

    // smooth count-up animation (unified with claim/send hero)
    function parseNumber(text: string) {
      const n = Number(String(text || '').replace(/[^0-9.-]/g, ''));
      return isNaN(n) ? 0 : n;
    }
    function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
    function animateCount(el: HTMLElement, to: number, decimals: number) {
      const firstRun = !el.getAttribute('data-initialized');
      const from = firstRun ? 0 : parseNumber(el.getAttribute('data-prev') || el.textContent || '0');
      const duration = 800; // ms
      const start = performance.now();
      if (firstRun) el.setAttribute('data-initialized', '1');
      function step(now: number) {
        const p = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(p);
        const cur = from + (to - from) * eased;
        el.textContent = format(cur, decimals);
        if (p < 1) requestAnimationFrame(step); else el.setAttribute('data-prev', String(to));
      }
      requestAnimationFrame(step);
    }

    const abort = new AbortController();
    bySrc.forEach(async (els, src) => {
      try {
        const res = await fetch(src, { signal: abort.signal, cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        els.forEach((el) => {
          const path = el.getAttribute('data-api-path') || '';
          const v = get(json, path);
          if (typeof v === 'number') {
            const target = (el.querySelector('[data-metric]') as HTMLElement) || el;
            const dAttr = (el.getAttribute('data-decimals') || '').trim();
            const decimals = dAttr !== '' && !isNaN(Number(dAttr)) ? Number(dAttr) : (/usdt/i.test(path) ? 8 : 0);
            animateCount(target, v, decimals);
          }
        });
      } catch {}
    });

    const vis = () => {
      if (document.visibilityState === 'visible') {
        // re-trigger by reloading (simple and robust)
        bySrc.forEach((els, src) => {
          fetch(src, { cache: 'no-store' })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
              if (!j) return;
              els.forEach((el) => {
                const path = el.getAttribute('data-api-path') || '';
                const v = get(j, path);
                if (typeof v === 'number') {
                  const target = (el.querySelector('[data-metric]') as HTMLElement) || el;
                  const dAttr = (el.getAttribute('data-decimals') || '').trim();
                  const decimals = dAttr !== '' && !isNaN(Number(dAttr)) ? Number(dAttr) : (/usdt/i.test(path) ? 8 : 0);
                  animateCount(target, v, decimals);
                }
              });
            })
            .catch(() => {});
        });
      }
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      abort.abort();
      document.removeEventListener('visibilitychange', vis);
    };
  }, [selector]);

  return null;
}



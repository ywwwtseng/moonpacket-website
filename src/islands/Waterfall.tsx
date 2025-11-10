import { useEffect } from 'react';
import { externals } from '@/config/app';

interface WaterfallProps {
  src: string;
  selector: string;
  intervalMs?: number;
  sentFromLabel?: string;
  claimedLabel?: string;
  totalLabel?: string;
  progressLabel?: string;
  userFallback?: string;
  groupFallback?: string;
}

// DYNAMIC: Red packet waterfall placeholder
// HOW TO REPLACE API LATER:
// - Change `src` to your real endpoint; JSON schema in /public/data/waterfall.json
export default function Waterfall({
  src,
  selector,
  intervalMs,
  sentFromLabel,
  claimedLabel,
  totalLabel,
  progressLabel,
  userFallback,
  groupFallback,
}: WaterfallProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window !== 'undefined') {
      console.debug('[Waterfall] component mounted, selector:', selector);
    }

    const root = document.querySelector(selector) as HTMLElement | null;
    if (!root) {
      if (typeof window !== 'undefined') {
        console.error('[Waterfall] selector not found:', selector);
      }
      return;
    }
    const container = root as HTMLElement;

    if (typeof window !== 'undefined') {
      console.debug('[Waterfall] root element found, current children:', container.children.length);
    }
    // detect RTL from <html dir="rtl">
    const isRtl =
      typeof document !== 'undefined' &&
      document.documentElement &&
      document.documentElement.getAttribute('dir') === 'rtl';
    let data: any[] = [];
    let idx = 0;
    let timer: any = null;

    function mapGroupUrl(name: string): string {
      if (/TON Builders/i.test(name)) return externals.telegram.supergroup;
      if (/Meme Rocket/i.test(name)) return externals.telegram.supergroup;
      if (/Moon Club A/i.test(name)) return externals.telegram.supergroup;
      if (/moonpacket/i.test(name)) return externals.telegram.supergroup;
      return '';
    }

    function mock(n: number): any[] {
      const users = [
        'Alice',
        'Bob',
        'Carol',
        'Dave',
        'Erin',
        'Frank',
        'Grace',
        'Heidi',
        'Ivan',
        'Judy',
        'Ken',
        'Lily',
        'Ming',
        'Nina',
        'Owen',
        'Paul',
        'Queenie',
        'Ray',
        'Sara',
        'Tom',
        'Una',
        'Vic',
        'Will',
        'Xena',
        'Yao',
        'Zack',
      ];
      const groups = ['Moon Club A', 'TON Builders', 'Meme Rocket', 'moonpacket 總群'];
      const ccys = ['USDT', 'ETH', 'SOL', 'TON'];
      const now = Date.now();
      const items: any[] = [];
      for (let i = 0; i < n; i++) {
        const total = +(Math.random() * 200 + 50).toFixed(2);
        const claimed = Math.floor(Math.random() * 100);
        const quota = 100;
        items.push({
          id: `mock_${i}`,
          user: users[i % users.length],
          group: groups[i % groups.length],
          link: mapGroupUrl(groups[i % groups.length]),
          amount: +(Math.random() * 12 + 1).toFixed(2),
          ccy: ccys[i % ccys.length],
          ts: new Date(now - i * 20_000).toISOString(),
          total_amount: total,
          claimed_count: claimed,
          total_count: quota,
        });
      }
      return items;
    }

    function redPacketIcon(): string {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="#E32521"/><path d="M4 8l8 4 8-4" fill="#FFBA00"/></svg>`;
    }

    function currencyIcon(ccy: string): string {
      const base =
        'width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"';
      if (ccy === 'USDT') {
        return `<svg ${base}><circle cx="12" cy="12" r="10" fill="#26A17B"/><path d="M7 7h10v2h-4v3.5c2.5.2 4 .7 4 1.5s-2.9 1.5-5 1.5-5-.7-5-1.5c0-.8 1.5-1.3 4-1.5V9H7V7z" fill="#fff"/></svg>`;
      }
      if (ccy === 'ETH') {
        return `<svg ${base}><circle cx="12" cy="12" r="10" fill="#627EEA"/><path d="M12 4l5 8-5 3-5-3 5-8zm0 16l5-7-5 3-5-3 5 7z" fill="#fff"/></svg>`;
      }
      if (ccy === 'SOL') {
        return `<svg ${base}><circle cx="12" cy="12" r="10" fill="#14F195"/><path d="M7 9l2-2h8l-2 2H7zm0 4l2-2h8l-2 2H7zm0 4l2-2h8l-2 2H7z" fill="#0B1F1A"/></svg>`;
      }
      if (ccy === 'BNB') {
        return `<svg ${base}><circle cx="12" cy="12" r="10" fill="#F3BA2F"/><path d="M12 4l2.5 2.5-5.5 5.5L12 17l3-3-5.5-5.5L12 4zm-2.5 2.5L7 9l2.5 2.5L12 9l-2.5-2.5zm5 0L17 9l-2.5 2.5L12 9l2.5-2.5zM7 15l2.5 2.5L12 15l-2.5-2.5L7 15zm10 0l-2.5 2.5L12 15l2.5-2.5L17 15z" fill="#fff"/></svg>`;
      }
      // TON default
      return `<svg ${base}><circle cx="12" cy="12" r="10" fill="#0098EA"/><path d="M12 6c3 0 5 1.5 5 3.7 0 .9-.3 1.7-.8 2.4L12 18l-4.2-5.9c-.5-.7-.8-1.5-.8-2.4C7 7.5 9 6 12 6z" fill="#fff"/></svg>`;
    }

    function fmtInt(n: any): string {
      try {
        return new Intl.NumberFormat(undefined).format(Number(n || 0));
      } catch (_) {
        return String(n || 0);
      }
    }

    // 转换新 API 格式到组件期望的格式
    function transformApiItem(apiItem: any): any {
      // 解析 token_id，格式如 "BNB:18:bsc" -> 提取币种和精度
      let ccy = 'USDT';
      let decimals = 18;
      if (apiItem.token_id) {
        const parts = String(apiItem.token_id).split(':');
        if (parts.length >= 1) {
          ccy = parts[0].toUpperCase();
        }
        if (parts.length >= 2) {
          decimals = parseInt(parts[1], 10) || 18;
        }
      }

      // 转换金额：从 wei/最小单位转换为正常单位
      const divisor = Math.pow(10, decimals);
      const balance = Number(apiItem.balance || 0) / divisor;
      const total = Number(apiItem.total || 0) / divisor;

      // sented_usdt 是已发送的 USDT 等价金额（可能已经是转换后的值）
      const sentedUsdt = apiItem.sented_usdt ? Number(apiItem.sented_usdt) : null;
      const recipients = Number(apiItem.recipients || 0);

      const amount = total - balance;

      // total_amount 使用 sented_usdt（如果存在，这是已发送的总 USDT 等价金额）
      // 否则使用转换后的 total（原始代币总金额）
      const totalAmount = total;

      // 构建 Telegram 群组链接
      let link = '';
      if (apiItem.tg_chat_username) {
        link = `https://t.me/${apiItem.tg_chat_username}`;
      } else if (apiItem.tg_chat_id) {
        // 如果是数字 ID，可能需要特殊处理
        link = mapGroupUrl(apiItem.tg_chat_name || '');
      } else {
        link = mapGroupUrl(apiItem.tg_chat_name || '');
      }

      // 计算 total_count：如果没有明确的值，使用一个合理的默认值
      // 可以根据 claimed_count 和 total_amount 估算，或使用固定值
      const claimedCount = Number(apiItem.recipients || 0);
      const totalCount =
        apiItem.total_count || (claimedCount > 0 ? Math.max(claimedCount * 2, 50) : 100);

      return {
        id: apiItem.id || `evt_${Date.now()}_${Math.random()}`,
        user: apiItem.user_first_name || userFallback || 'User',
        group: apiItem.tg_chat_name || groupFallback || 'Group',
        link: link,
        amount: amount,
        ccy: ccy,
        ts: apiItem.updated_at || new Date().toISOString(),
        total_amount: totalAmount,
        claimed_count: claimedCount,
        total_count: totalCount,
      };
    }

    function renderOne(item: any) {
      const card = document.createElement('div');
      // 版型：所有斷點一列（更緊湊的間距）
      card.className =
        'col-span-1 sm:col-span-2 lg:col-span-3 p-2 rounded-lg bg-white ring-1 ring-black/5 text-sm';
      card.style.transition = 'transform .28s ease, opacity .28s ease';
      card.style.transform = 'translateY(-12px)';
      card.style.opacity = '0';
      const ccy = item && item.ccy ? String(item.ccy) : 'USDT';
      function formatAmt(v: any, curr: string): string {
        var n = Number(v == null ? 0 : v);
        var opts = { minimumFractionDigits: 8, maximumFractionDigits: 8 };
        try {
          return new Intl.NumberFormat(undefined, opts).format(n);
        } catch (_) {
          return String(n.toFixed(8));
        }
      }
      const groupHref =
        (item && (item.link || item.group_link)) ||
        mapGroupUrl(item && item.group ? String(item.group) : '');
      const sideJustify = isRtl ? 'justify-start' : 'justify-end';
      const innerJustify = isRtl ? 'justify-start' : 'justify-end';
      const textAlignTail = isRtl ? 'text-left' : 'text-right';
      card.innerHTML = `
        <div class="flex flex-col sm:flex-row ${isRtl ? 'sm:flex-row-reverse' : ''} sm:items-center sm:justify-between gap-1 sm:gap-3 leading-[1.5] text-[13px] sm:text-sm">
          <div class="min-w-0 flex flex-wrap sm:flex-nowrap items-center overflow-hidden">
            <span class="inline-flex items-center gap-1 font-semibold whitespace-nowrap sm:w-[96px]">${redPacketIcon()} ${item.user || userFallback || ''}</span>
            <span class="hidden sm:inline mx-2 text-gray-400 dark:text-gray-600">|</span>
            <span class="text-textSubtle whitespace-nowrap sm:w-[180px]">${sentFromLabel || ''}${groupHref ? `<a href="${groupHref}" target="_blank" rel="noopener" class="underline hover:opacity-80">${item.group || groupFallback || ''}</a>` : item.group || groupFallback || ''}</span>
            <span class="hidden sm:inline mx-2 text-gray-400 dark:text-gray-600">|</span>
            <span class="text-textSubtle whitespace-nowrap sm:w-[220px]">${totalLabel || ''} <span class="num">${formatAmt(item.total_amount ?? item.amount * 100, ccy)}</span> ${ccy}</span>
            <span class="hidden sm:inline mx-2 text-gray-400 dark:text-gray-600">|</span>
            <span class="text-textSubtle whitespace-nowrap sm:w-[120px]">${progressLabel || ''} <span class="font-semibold">${fmtInt(item.claimed_count ?? 0)}</span>/<span class="font-semibold">${fmtInt(item.total_count ?? 100)}</span></span>
          </div>
          <div class="${textAlignTail} whitespace-nowrap flex items-center sm:${sideJustify}">
            <span class="inline-flex items-center gap-1 sm:w-[240px] ${innerJustify}">${currencyIcon(ccy)} <span>${claimedLabel || ''} <span class="num">${formatAmt(item.amount, ccy)}</span> ${ccy}</span></span>
            <span class="hidden sm:inline mx-2 text-gray-400 dark:text-gray-600">|</span>
            <span class="text-xs text-textSubtle sm:w-[64px] ${textAlignTail}">${new Date(item.ts || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>
      `;
      // FLIP：插入前記錄既有元素位置
      const existing = Array.from(container.children) as HTMLElement[];
      const prevTops = existing.map((el) => el.getBoundingClientRect().top);

      // 插入到容器頂部
      container.prepend(card);

      // 既有元素位置改變後，進行轉場（被向下「擠壓」）
      const afterChildren = Array.from(container.children) as HTMLElement[];
      for (let i = 1; i < afterChildren.length; i++) {
        // 跳過剛插入的新卡片
        const el = afterChildren[i];
        const newTop = el.getBoundingClientRect().top;
        const oldTop = prevTops[i - 1];
        const delta = oldTop - newTop;
        if (Math.abs(delta) > 0.5) {
          el.style.willChange = 'transform';
          el.style.transition = 'transform .28s ease';
          el.style.transform = `translateY(${delta}px)`;
          // 下一幀回到 0，完成平滑下移
          requestAnimationFrame(() => {
            el.style.transform = 'translateY(0)';
          });
        }
      }

      // 新卡片落下動效
      requestAnimationFrame(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      });
      const max = 20;
      while (container.children.length > max) {
        const last = container.lastElementChild as HTMLElement | null;
        if (last && last.parentNode) last.parentNode.removeChild(last);
        else break;
      }
    }

    function cycle() {
      if (!data.length) return;
      // 以不規則節奏推入（1~3 條），讓流感更自然
      const batch = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < batch; i++) {
        renderOne(data[idx % data.length]);
        idx++;
      }
    }

    async function load() {
      try {
        const r = await fetch(src, { cache: 'no-store' });
        if (!r.ok) {
          // API 失败，清空数据
          data = [];
          idx = 0;
          container.innerHTML = '';
          if (typeof window !== 'undefined') {
            console.warn('[Waterfall] API not ok, status:', r.status);
          }
          return Promise.resolve();
        }
        const j = await r.json();
        // 支持新格式 { data: [...] } 和旧格式 { items: [...] }
        const rawItems = (j && j.data) || (j && j.items) || [];
        // 转换 API 数据格式
        const jsonItems = rawItems.map((item: any) => {
          // 如果已经是转换后的格式（有 ccy 字段），直接返回
          if (item.ccy) {
            return item;
          }
          // 否则转换为新格式
          return transformApiItem(item);
        });
        // 使用真实数据，不补充 mock 数据
        data = jsonItems.slice(0, 30);
        // 清空 SSR 占位符
        container.innerHTML = '';
        // 首次載入：显示所有可用数据（最多 20 条）
        const initial = Math.min(20, data.length);
        if (typeof window !== 'undefined') {
          console.debug(
            '[Waterfall] About to render',
            initial,
            'items. data.length:',
            data.length,
            'jsonItems.length:',
            jsonItems.length,
          );
        }
        for (let i = 0; i < initial; i++) {
          if (data[i]) {
            renderOne(data[i]);
          }
        }
        if (typeof window !== 'undefined') {
          console.debug(
            '[Waterfall] initial rendered',
            initial,
            'items. root.children.length:',
            container.children.length,
          );
          if (container.children.length !== initial) {
            console.error(
              '[Waterfall] MISMATCH! Expected',
              initial,
              'children but got',
              container.children.length,
            );
          }
        }
        idx = initial;
        return Promise.resolve();
      } catch (err) {
        // 网络错误或其他异常，清空数据
        if (typeof window !== 'undefined') {
          console.error('[Waterfall] load() error:', err);
        }
        data = [];
        idx = 0;
        container.innerHTML = '';
        return Promise.resolve();
      }
    }

    // 使用不同間隔，形成「波浪」般的周期感
    const wave = [1100, 1500, 900, 1400, 1200];
    let wi = 0;
    let tick: any = null;
    function schedule() {
      tick = setTimeout(() => {
        cycle();
        wi = (wi + 1) % wave.length;
        schedule();
      }, wave[wi]);
    }

    // 先加载数据，然后启动动画调度
    load()
      .then(() => {
        // 数据加载完成后，立即开始动画调度
        if (typeof window !== 'undefined') {
          console.debug(
            '[Waterfall] data loaded, starting animation schedule. data.length:',
            data.length,
          );
        }
        schedule();
      })
      .catch((err) => {
        if (typeof window !== 'undefined') {
          console.error('[Waterfall] load() failed:', err);
        }
        // 即使失败也启动动画调度（如果有数据的话）
        if (data.length > 0) {
          schedule();
        }
      });

    timer = setInterval(async () => {
      await load();
    }, intervalMs || 60000);
    return () => {
      timer && clearInterval(timer);
      if (tick) clearTimeout(tick);
    };
  }, [src, selector, intervalMs]);
  return null;
}

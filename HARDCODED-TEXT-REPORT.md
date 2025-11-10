# HARDCODED TEXT REPORT

> Auto-scanned hardcoded Chinese/Japanese text (requires manual review).

**Generated**: 2025-10-30T01:18:54.836Z
**Files Scanned**: 59
**Files with Hardcoded Text**: 47

---

## src/components/BrandWord.astro

- `brand-word font-brand ${className}`

## src/components/BrandWordMoonini.astro

- `brand-mark ${className}`

## src/components/BrandWordMoonini.tsx

- `brand-mark ${className}`

## src/components/BrandWordMoonpacket.astro

- `brand-mark ${className}`

## src/components/BrandWordMoonpacket.tsx

- `brand-mark ${className}`

## src/components/CTA.astro

- `p-6 rounded-2xl gradient-primary text-white flex items-center justify-between`
- `px-4 py-2 rounded bg-white text-text font-semibold`

## src/components/FeatureCard.astro

- `p-6 rounded-xl bg-white ring-1 ring-black/5 min-h-[120px]`
- `text-sm text-textSubtle mt-1`
- `{desc ?`
- `: null}`

## src/components/GroupsHero.astro

- `mx-auto max-w-6xl px-4 py-6`
- `flex flex-col gap-4`
- `rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-0 overflow-hidden`
- `relative w-full whitespace-nowrap text-sm`
- `marquee flex items-center gap-8 px-4 py-2`
- `flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3`
- `inline-flex rounded-lg bg-black/5 p-1`
- `px-3 py-1.5 rounded-md text-sm font-medium bg-white shadow`
- `px-3 py-1.5 rounded-md text-sm font-medium text-black/70`
- `flex items-center gap-2`
- `absolute left-2 top-1/2 -translate-y-1/2`
- `M10 4a6 6 0 104.472 10.028l4.75 4.75 1.415-1.415-4.75-4.75A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z`
- `w-[220px] md:w-[280px] pl-7 pr-3 py-2 rounded-md border border-black/10 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30`
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4`
- `packet block rounded-2xl overflow-hidden ring-1 ring-black/20 hover:shadow transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-[#FFBA00]`
- `lid relative px-4 pt-3 pb-2 flex items-center justify-between`
- `flex items-center gap-2 text-sm font-semibold truncate`
- `text-xs text-white/90 mt-0.5`
- `body px-4 pb-2 pt-1`
- `grid grid-cols-3 gap-2 text-center`
- `stat-box rounded-md p-2`
- `text-[10px] text-white`
- `num num-hero whitespace-nowrap`
- `flex items-center justify-between mt-3 px-4 pb-4`
- `text-xs text-textSubtle`
- `${initialTotalItems} groups (Page ${initialPage} / ${initialTotalPages})`
- `共 ${initialTotalItems} 個群組｜第 ${initialPage} / ${initialTotalPages} 頁`
- `Page info`
- `頁面資訊`
- `inline-flex items-center gap-2`
- `px-2 py-1 rounded border border-black/10 bg-white text-sm`
- `上一頁`
- `下一頁`
- `btn btn-primary inline-flex items-center gap-2`
- `noopener noreferrer`
- `Owner:`
- `成員數`
- `累計發送 (USDT)`
- `Total Sent (USDT)`
- `本期發送 (USDT)`
- `This Period (USDT)`
- `${totalItems} groups (Page ${currentPage} / ${totalPages})`
- `共 ${totalItems} 個群組｜第 ${currentPage} / ${totalPages} 頁`
- `{tickerEvents.map((ev) => (`
- `{initialSlice.map((g) => (`
- `{isEN ? 'Page info' : '頁面資訊'}`
- `{claimMessages?.pagination?.prev || (isEN ? 'Prev' : '上一頁')}`
- `{claimMessages?.pagination?.next || (isEN ? 'Next' : '下一頁')}`
- `{
      const ownerLabel = claimMessages?.groups?.owner_label?.replace('{handle}', g.owner) || 
                        (claimMessages?.groups?.owner || 'Owner: ') + g.owner;
      return \``
- `${lang === 'zh-TW' ? '成員數' : 'Members'}`
- `${lang === 'zh-TW' ? '累計發送 (USDT)' : 'Total Sent (USDT)'}`
- `${lang === 'zh-TW' ? '本期發送 (USDT)' : 'This Period (USDT)'}`
- `1) {
      currentPage--;
      render();
    }
  });

  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(getSource().length / itemsPerPage);
    if (currentPage`

## src/components/HeroTextAnimated.astro

- `relative py-20 sm:py-28`
- `absolute inset-0 opacity-10 gradient-primary`
- `relative mx-auto max-w-5xl px-4`
- `text-4xl md:text-5xl lg:text-6xl font-bold`
- `block brand-mark`
- `block bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent`
- `mt-4 max-w-2xl text-base sm:text-lg text-textSubtle`
- `mt-6 flex gap-3`
- `btn btn-primary btn-text`
- `noopener noreferrer`
- `btn btn-outline btn-text`
- `{withBackground &&`
- `{ctaPrimaryHref && (`
- `)}
      {ctaSecondaryHref && (`

## src/components/LangSwitcher.astro

- `relative text-sm text-textSubtle flex items-center gap-2`
- `block sm:hidden rounded border border-black/10 bg-white px-2 py-1`
- `opacity-80 globe-icon`
- `Language menu`
- `hidden sm:hidden absolute right-0 top-full mt-2 w-56 rounded border border-black/10 bg-white shadow-lg max-h-[50vh] overflow-auto z-50`
- `w-full text-left px-3 py-2 hover:bg-black/5 ${l.code === current ? 'font-semibold' : ''}`
- `hidden sm:flex items-center gap-2`
- `px-2 py-1 rounded border border-black/10 bg-white`
- `m.loadAllMessages(current as any)).catch(async () => {
  const fallback = await import(\`@/i18n/loadMessages\`).then(m => m.loadAllMessages(defaultLocale));
  return fallback;
});
---`
- `{messages.site?.a11y?.language_menu || 'Language menu'}`
- `{locales.map((l) => (`
- `{messages.site?.a11y?.language || 'Language'}`

## src/components/MetricCard.astro

- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex flex-col gap-1 min-h-[88px] justify-between`
- `text-xs text-textSubtle tracking-wide`
- `text-2xl font-semibold num price num-right`
- `text-[11px] text-textSubtle/80`
- `;
---`

## src/components/PricingTable.astro

- `Basic features`
- `Community support`
- `All Starter`
- `Advanced localization`
- `SLA & support`
- `Custom integrations`
- `grid grid-cols-1 sm:grid-cols-3 gap-6`
- `p-6 rounded-xl ring-1 ring-black/5 bg-white flex flex-col`
- `text-3xl font-extrabold my-2`
- `text-sm text-textSubtle space-y-1`
- `mt-4 inline-block px-4 py-2 rounded bg-navy text-white text-sm text-center`
- `relative p-6 rounded-xl ring-2 ring-primary/60 bg-white shadow-lg scale-[1.02] flex flex-col`
- `absolute -top-3 right-3 text-xs px-2 py-0.5 rounded bg-primary text-white`
- `mt-4 inline-block px-4 py-2 rounded bg-primary text-white text-sm text-center`
- `p-6 rounded-xl ring-1 ring-primary/40 bg-white flex flex-col`
- `mt-4 inline-block px-4 py-2 rounded border border-primary text-primary text-sm text-center`
- `{safe.bullets.starter.map((b) => (`
- `Get started`
- `{safe.bullets.pro.map((b) => (`
- `Buy {safe.pro}`
- `{safe.bullets.enterprise.map((b) => (`
- `Contact {safe.enterprise}`

## src/components/Roadmap.astro

- `[Roadmap] roadmapMessages prop is required`
- `${updatedLabelRaw}：${updatedText}`
- `mx-auto max-w-5xl px-4 py-16`
- `text-3xl font-semibold tracking-tight`
- `opacity-70 text-sm`
- `relative border-s border-white/10 ms-4 space-y-6`
- `ms-6 reveal`
- `flex items-center justify-between gap-3`
- `text-lg font-semibold`
- `badge status-${st}`
- `mt-1 text-sm opacity-80`
- `mt-2 text-xs opacity-70`
- `mt-4 flex items-center gap-3`
- `${progressLabel} ${p}%，${status}`
- `Math.max(min,Math.min(max,n ?? 0));

// utility: derive status from progress (`
- `{roadmapMessages?.title || ''}`
- `{roadmapMessages?.accept || ''}：{accept}`
- `{/* progress bar: SSR visible; CSS animates from 0 to --p */}`
- `{progressLabel} {p}%`
- `);
      })}`

## src/components/Section.astro

- `mx-auto max-w-6xl px-4 py-12 ${className || ''}`
- `text-xl font-semibold`
- `text-textSubtle mt-1`
- `{title &&`
- `}
  {subtitle &&`

## src/components/SocialLinks.astro

- `Social links`
- `w-full flex justify-center items-center gap-3`
- `flex items-center gap-3`
- `noopener noreferrer`
- `Telegram Channel`
- `p-2 rounded hover:bg-black/5 text-textSubtle transition-opacity hover:opacity-80`
- `M9.5 15.5l-.3 4.2c.4 0 .6-.2.8-.4l2-1.9 4.2 3.1c.8.4 1.4.2 1.6-.7l2.9-13.6c.3-1.2-.4-1.7-1.2-1.4L3.6 9.2c-1.1.4-1.1 1-.2 1.3l4.3 1.3 9.9-6.2c.5-.3.9-.1.6.2`
- `Telegram Group`
- `X / Twitter`
- `M3 3h4l5.1 7L17 3h4l-7.2 9.8L21 21h-4l-5.4-7.5L7 21H3l7.9-10.8L3 3z`
- `M3 7.5C3 6.1 4.1 5 5.5 5h13c1.4 0 2.5 1.1 2.5 2.5v9c0 1.4-1.1 2.5-2.5 2.5h-13C4.1 19 3 17.9 3 16.5v-9zM10 9v6l5-3-5-3z`

## src/components/Testimonial.astro

- `p-6 rounded-xl bg-white ring-1 ring-black/5`
- `text-xs text-textSubtle mt-2`
- `— {author}`

## src/i18n/loadMessages.ts

- `Failed to load ${module} messages for ${locale}:`
- `Failed to load fallback ${module} messages for zh-TW:`
- `Failed to load common messages for ${locale}:`
- `{
      const messages = await loadMessages(locale, module);
      return { module, messages };
    })
  );

  // 合并所有模块的消息
  const mergedMessages: Record`

## src/i18n/locales.config.ts

- `English (UK)`
- `English (US)`
- `Bahasa Indonesia`
- `日本語`
- `Português (Brasil)`
- `Português (Portugal)`
- `Tiếng Việt`
- `简体中文`
- `繁體中文`

## src/i18n/t.ts

- `zh-TW -> en-US -> fallback -> key)
 * 
 * Searches within module structure: { common: { roadmap: { title: "..." } } }
 */
export function t(
  lang: string,
  messagesAll: Record`

## src/islands/FlipCounter.tsx

- `{
    const nodes = Array.from(document.querySelectorAll`
- `(selector));
    if (!nodes.length) return;

    const bySrc = new Map`

## src/islands/LiveMetrics.tsx

- `bad status`
- `{
    let cancelled = false;
    const nodes = Array.from(document.querySelectorAll`
- `(rootSelector));

    async function refresh() {
      const bySrc = new Map`

## src/islands/RedPacketAnimation.tsx

- `0.6) p.vx = 0.6; else if (p.vx`

## src/islands/Waterfall.tsx

- `[Waterfall] component mounted, selector:`
- `[Waterfall] selector not found:`
- `[Waterfall] root element found, current children:`
- `Moon Club A`
- `TON Builders`
- `Meme Rocket`
- `moonpacket 總群`
- `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="#E32521"/><path d="M4 8l8 4 8-4"...`
- `width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"`
- `<svg ${base}><circle cx="12" cy="12" r="10" fill="#26A17B"/><path d="M7 7h10v2h-4v3.5c2.5.2 4 .7 4 1.5s-2.9 1.5-5 1.5-5-.7-5-1.5c0-.8 1.5-1.3 4-1.5V9H7V7z" fill="#fff"/></svg>`
- `<svg ${base}><circle cx="12" cy="12" r="10" fill="#627EEA"/><path d="M12 4l5 8-5 3-5-3 5-8zm0 16l5-7-5 3-5-3 5 7z" fill="#fff"/></svg>`
- `<svg ${base}><circle cx="12" cy="12" r="10" fill="#14F195"/><path d="M7 9l2-2h8l-2 2H7zm0 4l2-2h8l-2 2H7zm0 4l2-2h8l-2 2H7z" fill="#0B1F1A"/></svg>`
- `<svg ${base}><circle cx="12" cy="12" r="10" fill="#0098EA"/><path d="M12 6c3 0 5 1.5 5 3.7 0 .9-.3 1.7-.8 2.4L12 18l-4.2-5.9c-.5-.7-.8-1.5-.8-2.4C7 7.5 9 6 12 6z" fill="#fff"/></svg>`
- `col-span-1 sm:col-span-2 lg:col-span-3 p-2 rounded-lg bg-white ring-1 ring-black/5 text-sm`
- `transform .28s ease, opacity .28s ease`
- `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 leading-[1.5] text-[13px] sm:text-sm`
- `min-w-0 flex flex-wrap sm:flex-nowrap items-center overflow-hidden`
- `inline-flex items-center gap-1 font-semibold whitespace-nowrap sm:w-[96px]`
- `hidden sm:inline mx-2 text-gray-400 dark:text-gray-600`
- `text-textSubtle whitespace-nowrap sm:w-[180px]`
- `<a href="${groupHref}" target="_blank" rel="noopener" class="underline hover:opacity-80">${item.group || groupFallback || ''}</a>`
- `text-textSubtle whitespace-nowrap sm:w-[220px]`
- `text-textSubtle whitespace-nowrap sm:w-[120px]`
- `text-right whitespace-nowrap flex items-center sm:justify-end`
- `inline-flex items-center gap-1 sm:w-[240px] justify-end`
- `text-xs text-textSubtle sm:w-[64px] text-right`
- `transform .28s ease`
- `[Waterfall] API not ok, using mock data. data.length:`
- `[Waterfall] fallback rendered 20 from mock (API not ok). root.children.length:`
- `[Waterfall] About to render`
- `items. data.length:`
- `[Waterfall] initial rendered`
- `items. root.children.length:`
- `[Waterfall] MISMATCH! Expected`
- `children but got`
- `[Waterfall] load() error:`
- `[Waterfall] Using mock data due to error. data.length:`
- `[Waterfall] fallback rendered 20 from mock (error). root.children.length:`
- `[Waterfall] data loaded, starting animation schedule. data.length:`
- `[Waterfall] load() failed:`
- `\`;
      }
      if (ccy === 'ETH') {
        return \``
- `\`;
      }
      if (ccy === 'SOL') {
        return \``
- `\`;
      }
      // TON default
      return \``
- `${redPacketIcon()} ${item.user || userFallback || ''}`
- `${sentFromLabel || ''}${groupHref ? \``
- `${item.group || groupFallback || ''}`
- `\` : (item.group || groupFallback || '')}`
- `${totalLabel || ''}`
- `${formatAmt(item.total_amount ?? item.amount*100, ccy)}`
- `${progressLabel || ''}`
- `${fmtInt(item.claimed_count ?? 0)}`
- `${fmtInt(item.total_count ?? 100)}`
- `${claimedLabel || ''}`
- `${formatAmt(item.amount, ccy)}`
- `${new Date(item.ts || Date.now()).toLocaleTimeString()}`

## src/layouts/BaseLayout.astro

- `width=device-width, initial-scale=1`
- `shortcut icon`
- `fixed inset-0 z-[60] hidden items-center justify-center transition-opacity duration-300`
- `spinner h-10 w-10 rounded-full border-2 border-t-[#FFBA00] animate-spin`
- `; Max-Age=`
- `; Path=/`
- `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-text focus:px-3 focus:py-2 focus:rounded`
- `Skip to main content`
- `mx-auto max-w-6xl px-4 py-4 flex items-center justify-between relative z-30`
- `flex items-center gap-5`
- `h-12 w-12 md:h-14 md:w-14 rounded`
- `inline leading-none text-2xl md:text-3xl text-[var(--text)]`
- `flex items-center gap-6`
- `nav-link hover:underline`
- `mx-auto max-w-6xl px-4 pt-6 pb-10 text-sm text-textSubtle`
- `pb-4 border-b border-black/10`
- `flex items-center justify-between gap-3 mt-4`
- `flex items-center gap-4 items-center`
- `ml-2 px-2 py-1 rounded border border-black/10 bg-white text-text text-xs`
- `dark hidden`
- `; Path=/; Max-Age=`
- `(prefers-color-scheme: dark)`
- `{
  const fallback = await import(\`@/i18n/loadMessages\`).then(m => m.loadAllMessages(defaultLocale));
  return fallback;
});
const year = new Date().getFullYear();
---`
- `{locales.map((l) => (`
- `{messages.site?.a11y?.skip_to_main || 'Skip to main content'}`
- `{messages.site?.nav?.claim || 'Claim'}`
- `{messages.site?.nav?.send || 'Send'}`
- `© {year}`
- `. {messages.site?.footer?.copyright || ''}`
- `{messages.site?.footer?.privacy || 'Privacy'}`
- `{messages.site?.footer?.terms || 'Terms'}`
- `=18 || h`
- `and dir, plus SEO tags and hreflang links. -->`

## src/lib/brandify.ts

- `/g,`
- `<span class="brand-mark">moonpacket</span>`
- `<span class="brand-mark">moonini</span>`
- `');
  // Replace all occurrences of "moonini" (case-insensitive) with brand-mark span.
  result = result.replace(/moonini/gi, '`

## src/pages/[lang]/404.astro

- `404 - Page Not Found`
- `Crypto red packets on Telegram`
- `relative mx-auto max-w-6xl px-4 py-6 overflow-visible`
- `pointer-events-none absolute inset-0 z-[5]`
- `relative z-10 text-center py-20`
- `text-6xl font-extrabold mb-6 text-[#0C1E3A]`
- `text-2xl font-semibold mb-4`
- `Page Not Found`
- `text-lg text-textSubtle mb-8`
- `Sorry, the page you are looking for does not exist or has been moved.`
- `flex flex-col sm:flex-row gap-4 justify-center`
- `inline-flex items-center px-6 py-3 bg-[#0C1E3A] text-white rounded-lg hover:bg-[#0C1E3A]/90 transition-colors`
- `inline-flex items-center px-6 py-3 border border-[#0C1E3A] text-[#0C1E3A] rounded-lg hover:bg-[#0C1E3A]/5 transition-colors`
- `m.loadAllMessages(defaultLocale));
  return fallback;
});
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `{messages.site?.errors?.not_found || 'Page Not Found'}`
- `{messages.site?.errors?.not_found_desc || 'Sorry, the page you are looking for does not exist or has been moved.'}`
- `{messages.site?.nav?.home || 'Home'}`
- `{messages.site?.nav?.claim || 'Claim'}`

## src/pages/[lang]/about.astro

- `mx-auto max-w-4xl px-4 py-12`
- `text-3xl font-bold mb-4`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`

## src/pages/[lang]/blog/[slug].astro

- `${messages.site.title} — ${slug}`
- `mx-auto max-w-3xl px-4 py-12 prose`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `Localized article placeholder.`

## src/pages/[lang]/blog/index.astro

- `mx-auto max-w-4xl px-4 py-12`
- `text-3xl font-bold mb-4`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`

## src/pages/[lang]/careers.astro

- `mx-auto max-w-6xl px-4 py-12 space-y-6`
- `p-6 rounded-xl bg-white ring-1 ring-black/5`
- `text-sm text-textSubtle`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `Frontend Engineer`
- `Remote · Full-time`
- `Product Designer`
- `Remote · Contract`

## src/pages/[lang]/claim.astro

- `Admin Ken`
- `in the reward pool`
- `System update: SOL support is now live support is now live`
- `Today's lucky red packet just dropped!`
- `TON 空投研究所`
- `Meme Power Guild`
- `Solana Developers`
- `DeFi Explorers`
- `NFT Collectors`
- `Web3 Builders`
- `Crypto Traders`
- `Blockchain Society`
- `DAO Governance`
- `Layer2 Alliance`
- `Yield Farmers Hub`
- `Cross-chain Ninjas`
- `TON Memelords`
- `Degens United`
- `Airdrop Watchdogs`
- `Gas Saver Squad`
- `Bridge Hackers`
- `Rug Pull Survivors`
- `Solana Whales`
- `Arb Snipers`
- `OTC Liquidity Hub`
- `Governance Maxis`
- `Tokenomics Guild`
- `Compliance Watch`
- `Anti-Scam Patrol`
- `Stablecoin Council`
- `Meme Ops Lab`
- `grid grid-cols-1 gap-4`
- `text-base font-semibold mb-2`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5 mb-4`
- `space-y-3 text-base leading-6`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5`
- `brandify(s ?? "");

// FAQ 段落自動換行：依標點切句並加上`
- `function renderFaqParagraph(raw: string): string {
  if (!raw) return '';

  // 先保留品牌字上色 (using the same brandify as privacy/terms)
  const marked = brandify(raw);

  // 如果內容已經包含`
- `標籤，說明是問答格式（問題 + 答案），直接返回
  if (marked.includes('`
- `，視覺上就是單行間距，不要太鬆
  const joined = pieces
    .map(seg => seg.trim())
    .filter(seg => seg.length > 0)
    .map(seg => \`${seg}`
- `0 && 
  (faqVM.sections[0].items?.length > 0 || 
   claimMessages?.faq?.sections?.length > 0);
const faqOrder = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11'];
---`
- `{useStructured ? (
          // New structured format with sections
          faqVM.sections.map((sec) => (`
- `{sec.title &&`
- `}
              {sec.items.map((it) => (`
- `{it.title &&`
- `{it.body?.map((line: string) => (`
- `))
        ) : (
          // Fallback to old flat format
          faqOrder.map((key) => (`
- `{claimMessages?.faq?.[\`${key}_body\`]?.map((line: string) => (`
- `))
        )}`

## src/pages/[lang]/contact.astro

- `mx-auto max-w-4xl px-4 py-12`
- `text-3xl font-bold mb-4`
- `text-textSubtle mb-6`
- `grid gap-4 max-w-md`
- `border rounded px-3 py-2`
- `bg-primary text-white px-4 py-2 rounded`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `{(messages.form && messages.form.send) || messages.cta.primary}`

## src/pages/[lang]/faq.astro

- `mx-auto max-w-4xl px-4 py-12 space-y-6`
- `p-4 rounded-lg bg-white ring-1 ring-black/5`
- `text-textSubtle mt-2`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `{(messages.features && messages.features.f3) || 'Feature'}`
- `{(messages.features_desc && messages.features_desc.f3) || ''}`

## src/pages/[lang]/groups.astro

- `Groups Directory`
- `Send crypto red packets`
- `mx-auto max-w-6xl px-4 py-10`
- `text-2xl font-semibold mb-4`
- `moonpacket Metrics`
- `px-2 py-1 rounded border border-black/10 bg-white`
- `Most Users`
- `Least Users`
- `p-4 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-between`
- `font-semibold underline-offset-2 hover:underline`
- `text-xs text-textSubtle`
- `text-sm text-textSubtle`
- `num font-semibold`
- `m.loadAllMessages(defaultLocale));
  return fallback;
});
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`
- `{(messages.metrics && messages.metrics.title) || 'moonpacket Metrics'}`
- `{messages.metrics?.sort?.label || 'Sort'}`
- `{(messages.metrics && messages.metrics.sort && messages.metrics.sort.latest) || 'Latest'}`
- `{(messages.metrics && messages.metrics.sort && messages.metrics.sort.oldest) || 'Oldest'}`
- `{(messages.metrics && messages.metrics.sort && messages.metrics.sort.most) || 'Most Users'}`
- `{(messages.metrics && messages.metrics.sort && messages.metrics.sort.least) || 'Least Users'}`
- `{
          const li = document.createElement('li');
          li.className = 'p-4 rounded-lg bg-white ring-1 ring-black/5 flex items-center justify-between';
          li.innerHTML = \``
- `${new Date(g.created_at).toLocaleString()}`
- `${I18N_GROUPS.card?.members || 'Members'}:`
- `${new Intl.NumberFormat().format(g.members||0)}`
- `\`;
          list.appendChild(li);
        });
      }

      select.addEventListener('change', load);
      load();`

## src/pages/[lang]/index.astro

- `<span class="brand-mark">${hasDollar ? '$' : ''}moonini</span>`
- `hundred million`
- `${convert(a)} ~ ${convert(b)}`
- `cryptocurrency red packet platform`
- `relative mx-auto max-w-6xl px-4 py-6 overflow-visible`
- `pointer-events-none absolute inset-0 z-[5]`
- `relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-center`
- `hidden md:block md:col-span-1`
- `hidden sm:block pointer-events-none absolute bottom-0 right-0 md:right-[-12px] z-20 overflow-hidden h-[260px] sm:h-[320px] md:h-[380px] lg:h-[440px]`
- `select-none block h-[420px] sm:h-[500px] md:h-[560px] lg:h-[620px] -translate-y-[6%] object-contain drop-shadow-2xl`
- `mx-auto max-w-6xl px-4 py-10`
- `text-xl font-semibold mb-4`
- `grid grid-cols-1 sm:grid-cols-3 gap-4`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex flex-col gap-1 min-h-[88px] justify-between`
- `text-xs text-textSubtle tracking-wide`
- `text-[28px] md:text-[30px] font-[800] num text-center`
- `text-xs text-textSubtle/80`
- `mx-auto max-w-6xl px-4 py-16`
- `text-xl font-semibold mb-6`
- `grid grid-cols-1 gap-2`
- `col-span-1 sm:col-span-2 lg:col-span-3 p-2 rounded-lg bg-white ring-1 ring-black/5 text-sm`
- `flex items-center justify-between gap-3`
- `text-xs text-textSubtle`
- `mx-auto max-w-6xl px-4 py-16 overflow-hidden border-0 ring-0 outline-none`
- `🌕 Moonini\'s story`
- `grid grid-cols-1 md:grid-cols-5 gap-8 items-start`
- `md:col-span-2 bg-transparent border-0 ring-0 outline-none`
- `w-full h-auto object-contain block border-0 ring-0 outline-none`
- `clip-path: inset(0 0 0 2px)`
- `flex flex-col gap-2`
- `mt-8 font-semibold`
- `🌸 his secrets`
- `mt-10 px-3 sm:px-4 md:px-6`
- `token release schedule`
- `mt-3 rounded-lg bg-white ring-1 ring-black/5 overflow-hidden`
- `w-full min-w-[640px] text-sm border-collapse`
- `bg-black/5 text-left`
- `px-3 py-2`
- `border-b border-black/10 even:bg-black/5`
- `px-3 py-2 font-medium`
- `num font-[800]`
- `px-3 py-2 text-textSubtle`
- `🌕 lunar energy and red packet faith`
- `💫 future applications`
- `mt-2 list-disc pl-6`
- `⚠️ disclaimer`
- `user testimonials`
- `plans and pricing`
- `{
    const hasDollar = m[0] === '$';
    return \``
- `${hasDollar ? '$' : ''}moonini`
- `{new Intl.NumberFormat(Astro.locals?.locale ?? "zh-TW", { maximumFractionDigits: 0 }).format(3456789)}`
- `{new Intl.NumberFormat(Astro.locals?.locale ?? "zh-TW", { maximumFractionDigits: 8 }).format(91234.56000000)}`
- `{messages.waterfall?.sent_from} Moon Club A`
- `{messages.waterfall?.sent_from} TON Builders`
- `{messages.waterfall?.sent_from} SOL Community`
- `{messages.waterfall?.sent_from} ETH Developers`
- `{messages.story && (`
- `{Array.isArray(messages.story?.origin) && (`
- `{messages.story.origin.map((p: string) => (`
- `{messages.story?.secrets_title || '🌸 his secrets'}`
- `{messages.story?.secrets_intro && (`
- `)}
            {messages.story?.secrets_flow && (`
- `)}
            {Array.isArray(messages.story?.secrets_halving) && messages.story.secrets_halving.map((p: string) => (`
- `{messages.story?.schedule_title || 'token release schedule'}`
- `{Array.isArray(messages.story?.schedule_headers) && messages.story.schedule_headers.map((h: string) => (`
- `{Array.isArray(messages.story?.schedule_rows) && messages.story.schedule_rows.map((row: string[]) => (`
- `{Array.isArray(messages.story?.cap_note) && messages.story.cap_note.map((p: string) => (`
- `{messages.story?.belief_title || '🌕 lunar energy and red packet faith'}`
- `{Array.isArray(messages.story?.belief_paragraphs) && messages.story.belief_paragraphs.map((p: string) => (`
- `{messages.story?.future_title || '💫 future applications'}`
- `{messages.story?.future_intro && (`
- `)}
          {Array.isArray(messages.story?.future_list) && (`
- `{messages.story.future_list.map((li: string) => (`
- `{messages.story?.disclaimer_title || '⚠️ disclaimer'}`
- `{Array.isArray(messages.story?.disclaimer_paragraphs) && messages.story.disclaimer_paragraphs.map((p: string) => (`
- `))}

          {Array.isArray(messages.story?.closing) && messages.story.closing.map((p: string) => (`

## src/pages/[lang]/pricing.astro

- `moonpacket 價格方案`
- `價格`
- `mx-auto max-w-6xl px-4 py-12`
- `text-3xl font-bold mb-6`
- `{messages.site?.nav?.pricing || '價格'}`

## src/pages/[lang]/privacy.astro

- `[legal-check] privacy paragraphs:`
- `moonpacket 隱私權條款（Privacy Policy）`
- `relative mx-auto max-w-6xl px-4 py-6 overflow-visible`
- `pointer-events-none absolute inset-0 z-[5]`
- `relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-center`
- `hidden md:block md:col-span-1`
- `text-xl font-semibold`
- `grid grid-cols-1 gap-4`
- `mb-4 max-w-screen-lg w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-textSubtle flex flex-row flex-wrap items-start`
- `inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-2 py-0.5 text-[10px] font-semibold leading-none text-black mr-2`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5`
- `text-base text-textSubtle leading-relaxed space-y-5 legal-prose`
- `版本`
- `更新`
- `text-base font-semibold`
- `簡介`
- `list-decimal pl-5 space-y-1`
- `定義`
- `list-disc pl-5`
- `適用範圍`
- `我們收集的資料`
- `資料來源`
- `使用目的`
- `法規依據`
- `Cookie 與本地儲存`
- `雲端錢包與區塊鏈`
- `防刷與風控`
- `資料分享對象`
- `跨境傳輸`
- `保存期間`
- `安全性`
- `未成年人`
- `您的權利與行使`
- `常見問答（隱私與安全）`
- `條款更新`
- `聯絡方式`
- `客服機器人`
- `{(lang !== 'en-US' && messages.legal?.privacy?.notice?.disclaimer_binding) && (`
- `{messages.legal?.privacy?.version_label || '版本'}`
- `：{(messages.privacy && messages.privacy.version) || 'v1.1.0'}`
- `{messages.legal?.privacy?.updated_label || '更新'}`
- `：{(messages.privacy && messages.privacy.updated) || '2025-10-05'}`
- `{messages.legal?.privacy?.owner_label || 'Owner'}`
- `{messages.legal?.sections?.intro || '簡介'}`
- `{messages.legal?.privacy?.intro?.map(item =>`
- `{messages.legal?.sections?.definitions || '定義'}`
- `{messages.legal?.privacy?.definitions?.map(item =>`
- `{messages.legal?.sections?.scope || '適用範圍'}`
- `{messages.legal?.privacy?.scope?.map(item =>`
- `{messages.legal?.sections?.data_collection || '我們收集的資料'}`
- `{messages.legal?.privacy?.dataCollected?.map(item =>`
- `{messages.legal?.privacy?.data_sources || '資料來源'}`
- `{messages.legal?.privacy?.sources?.map(item =>`
- `{messages.legal?.sections?.data_usage || '使用目的'}`
- `{messages.legal?.privacy?.purposes?.map(item =>`
- `{messages.legal?.sections?.legal_basis || '法規依據'}`
- `{messages.legal?.privacy?.legalBases?.map(item =>`
- `{messages.legal?.sections?.cookies || 'Cookie 與本地儲存'}`
- `{messages.legal?.privacy?.cookies?.map(item =>`
- `{messages.legal?.sections?.wallet || '雲端錢包與區塊鏈'}`
- `{messages.legal?.privacy?.wallet?.map(item =>`
- `{messages.legal?.sections?.restrictions || '防刷與風控'}`
- `{messages.legal?.privacy?.antiFraud?.map(item =>`
- `{messages.legal?.sections?.data_sharing || '資料分享對象'}`
- `{messages.legal?.privacy?.sharing?.map(item =>`
- `{messages.legal?.sections?.cross_border || '跨境傳輸'}`
- `{messages.legal?.privacy?.crossBorder?.map(item =>`
- `{messages.legal?.sections?.retention || '保存期間'}`
- `{messages.legal?.privacy?.retention?.map(item =>`
- `{messages.legal?.sections?.security || '安全性'}`
- `{messages.legal?.privacy?.security?.map(item =>`
- `{messages.legal?.sections?.minors || '未成年人'}`
- `{messages.legal?.privacy?.minors?.map(item =>`
- `{messages.legal?.sections?.rights || '您的權利與行使'}`
- `{messages.legal?.privacy?.rights?.map(item =>`
- `{messages.legal?.sections?.faq || '常見問答（隱私與安全）'}`
- `{messages.legal?.privacy?.faq?.map(item =>`
- `{messages.legal?.sections?.updates || '條款更新'}`
- `{messages.legal?.privacy?.updates?.map(item =>`
- `{messages.legal?.sections?.contact_info || '聯絡方式'}`
- `{messages.legal?.contact?.support || '客服機器人'}`

## src/pages/[lang]/send.astro

- `|| 'English default'`
- `mx-auto max-w-6xl px-4 py-6`
- `grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch`
- `rounded-2xl ring-1 ring-black/5 bg-[#0C1E3A] text-[#D1FAE5] p-4 md:p-6 overflow-hidden h-[300px] md:h-[340px] flex flex-col`
- `font-mono font-semibold text-[13px] md:text-[16px] leading-6 whitespace-pre flex-1 overflow-hidden`
- `/g, '`
- `rounded-2xl ring-1 ring-black/5 bg-white p-5 md:p-6 h-[300px] md:h-[340px] flex flex-col`
- `text-2xl md:text-3xl font-semibold tracking-tight mb-4`
- `text-base md:text-lg space-y-2`
- `grid grid-cols-1 gap-4`
- `text-xl font-semibold mb-4`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5`
- `text-base font-semibold mb-2`
- `grid grid-cols-1 md:grid-cols-5 gap-4 items-start`
- `md:col-span-3 space-y-3 text-base leading-6`
- `relative md:col-span-2`
- `hidden md:block pointer-events-none absolute bottom-0 -right-[8px] lg:-right-[16px] flex items-end justify-end overflow-visible`
- `select-none block h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] object-contain drop-shadow-xl scale-[1.5] translate-y-[8px] origin-bottom-right`
- `md:h-[260px] lg:h-[300px]`
- `space-y-3 text-base leading-6 ${itemIdx >= 5 ? 'whitespace-pre-line' : ''}`
- `space-y-3 text-base leading-6 ${key >= 'q6' ? 'whitespace-pre-line' : ''}`
- `mx-auto max-w-6xl px-4 pb-6 pt-4 text-center`
- `btn btn-primary`
- `noopener noreferrer`
- `mt-4 text-sm text-textSubtle`
- `{sendMessages?.title || ''}`
- `{sendMessages?.hero?.use_cases_title || ''}`
- `{sendMessages?.hero?.use_cases_items?.map((line: string) => (`
- `{useStructured ? (
          // New structured format with sections
          faqVM.sections.map((sec, secIdx) => (`
- `{sec.title &&`
- `{
                // Q1 special layout with image
                const isFirst = secIdx === 0 && itemIdx === 0;
                return (`
- `{it.title &&`
- `}
                    {isFirst ? (`
- `{it.body?.map((line: string) => (`
- `) : (`
- `= 5 ? 'whitespace-pre-line' : ''}\`}>
                        {it.body?.map((line: string) => (`
- `);
              })}`
- `))
        ) : (
          // Fallback to old flat format`
- `{sendMessages?.faq?.q1_body?.map((para: string) => (`
- `{['q2','q3','q4','q5','q6','q7'].map((key) => (`
- `= 'q6' ? 'whitespace-pre-line' : ''}\`}>
                  {sendMessages?.faq?.[\`${key}_body\`]?.map((para: string) => (`
- `{sendMessages?.cta_button_prefix || ''}`
- `{sendMessages?.cta_button_suffix || ''}`
- `{sendMessages?.footer_tip && (`

## src/pages/[lang]/team.astro

- `mx-auto max-w-6xl px-4 py-12 grid sm:grid-cols-3 gap-6`
- `p-6 rounded-xl bg-white ring-1 ring-black/5`
- `text-sm text-textSubtle`
- `import(\`@/i18n/messages/${defaultLocale}/common.json\`));
const messages = (t as any).default;
const canonical = computeCanonical(Astro.url, (Astro.site && Astro.site.toString()) || undefined);
---`

## src/pages/[lang]/terms.astro

- `[legal-check] terms paragraphs:`
- `moonpacket 使用者條款（Terms of Service）`
- `moonpacket 隱私權條款（Privacy Policy）`
- `relative mx-auto max-w-6xl px-4 py-6 overflow-visible`
- `pointer-events-none absolute inset-0 z-[5]`
- `relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 items-center`
- `hidden md:block md:col-span-1`
- `text-xl font-semibold`
- `grid grid-cols-1 gap-4`
- `mb-4 max-w-screen-lg w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-textSubtle flex flex-row flex-wrap items-start`
- `inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-2 py-0.5 text-[10px] font-semibold leading-none text-black mr-2`
- `rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5`
- `text-base text-textSubtle leading-relaxed space-y-5 legal-prose`
- `版本`
- `更新`
- `border-l-2 pl-3`
- `本使用者條款（以下稱「本條款」）係您（以下稱「您」或「使用者」）與 <strong>moonpacket</strong>（以下稱「我們」或「本公司」）之間，就您使用 moonpacket 所提供之 Telegram Mini App、機器人（Bot）及網站等服務（以下合稱「本服務」）所訂立。請在使用前詳讀；您開始使用即視為同意受本條款拘束。`
- `text-base font-semibold`
- `適用範圍與契約成立`
- `list-decimal pl-5 space-y-1`
- `定義`
- `list-disc pl-5`
- `資格與帳號`
- `服務內容`
- `雲端錢包與資金`
- `手續費與計費`
- `活動規則與公平`
- `防刷與使用限制`
- `內容與智慧財產權`
- `第三方服務`
- `資料與隱私`
- `風險揭露`
- `免責聲明`
- `責任限制`
- `賠償`
- `暫停、終止與刪除`
- `不可抗力`
- `高風險用途禁止`
- `稅務與申報`
- `內容與資料正確性`
- `準據法與爭議處理`
- `聯絡方式`
- `條款變更`
- `服務調整與條款更新`
- `使用者內容與公開展示授權`
- `責任限制與賠償上限`
- `適用法律與爭議解決`
- `附錄｜定義與解釋`
- `{(lang !== 'en-US' && messages.legal?.terms?.notice?.disclaimer_binding) && (`
- `{messages.legal?.terms?.version_label || '版本'}`
- `: {(messages.terms && messages.terms.version) || 'v1.0.0'}`
- `{messages.legal?.terms?.updated_label || '更新'}`
- `: {(messages.terms && messages.terms.updated) || '2025-10-05'}`
- `{messages.legal?.terms?.owner_label || 'Owner'}`
- `（以下稱「我們」或「本公司」）之間，就您使用 moonpacket 所提供之 Telegram Mini App、機器人（Bot）及網站等服務（以下合稱「本服務」）所訂立。請在使用前詳讀；您開始使用即視為同意受本條款拘束。'} />`
- `1) {messages.legal?.sections?.scope || '適用範圍與契約成立'}`
- `{messages.legal?.terms?.intro?.map(item =>`
- `2) {messages.legal?.sections?.definitions || '定義'}`
- `{messages.legal?.terms?.definitions?.map(item =>`
- `3) {messages.legal?.sections?.eligibility || '資格與帳號'}`
- `{messages.legal?.terms?.eligibility?.map(item =>`
- `)}
              {messages.legal?.terms?.accounts?.map(item =>`
- `4) {messages.legal?.sections?.services || '服務內容'}`
- `{messages.legal?.terms?.service?.map(item =>`
- `)}
              {messages.legal?.terms?.features?.map(item =>`
- `5) {messages.legal?.sections?.wallet || '雲端錢包與資金'}`
- `{messages.legal?.terms?.cloudWallet?.map(item =>`
- `6) {messages.legal?.sections?.fees || '手續費與計費'}`
- `{messages.legal?.terms?.fees?.map(item =>`
- `7) {messages.legal?.sections?.rules || '活動規則與公平'}`
- `{messages.legal?.terms?.rules?.map(item =>`
- `8) {messages.legal?.sections?.restrictions || '防刷與使用限制'}`
- `{messages.legal?.terms?.abuse?.map(item =>`
- `9) {messages.legal?.sections?.ip || '內容與智慧財產權'}`
- `{messages.legal?.terms?.ip?.map(item =>`
- `10) {messages.legal?.sections?.third_party || '第三方服務'}`
- `{messages.legal?.terms?.thirdparty?.map(item =>`
- `11) {messages.legal?.sections?.data || '資料與隱私'}`
- `{messages.legal?.terms?.dataPrivacy?.map(item =>`
- `12) {messages.legal?.sections?.risks || '風險揭露'}`
- `{messages.legal?.terms?.risk?.map(item =>`
- `13) {messages.legal?.sections?.disclaimer || '免責聲明'}`
- `{messages.legal?.terms?.disclaimer?.map(item =>`
- `14) {messages.legal?.sections?.liability || '責任限制'}`
- `{messages.legal?.terms?.liability?.map(item =>`
- `15) {messages.legal?.sections?.indemnity || '賠償'}`
- `{messages.legal?.terms?.indemnity?.map(item =>`
- `16) {messages.legal?.sections?.termination || '暫停、終止與刪除'}`
- `{messages.legal?.terms?.suspension?.map(item =>`
- `)}
              {messages.legal?.terms?.compliance?.map(item =>`
- `17) {messages.legal?.sections?.force_majeure || '不可抗力'}`
- `{messages.legal?.terms?.forceMajeure?.map(item =>`
- `18) {messages.legal?.sections?.high_risk || '高風險用途禁止'}`
- `{messages.legal?.terms?.highRisk?.map(item =>`
- `19) {messages.legal?.sections?.tax || '稅務與申報'}`
- `{messages.legal?.terms?.tax?.map(item =>`
- `20) {messages.legal?.sections?.accuracy || '內容與資料正確性'}`
- `{messages.legal?.terms?.accuracy?.map(item =>`
- `21) {messages.legal?.sections?.governing_law || '準據法與爭議處理'}`
- `{messages.legal?.terms?.law?.map(item =>`
- `)}
              {messages.legal?.terms?.disputes?.map(item =>`
- `22) {messages.legal?.sections?.contact || '聯絡方式'}`
- `{messages.legal?.terms?.contact?.map(item =>`
- `23) {messages.legal?.sections?.changes || '條款變更'}`
- `{messages.legal?.terms?.changes?.map(item =>`
- `24) {messages.legal?.terms?.serviceChanges?.title || '服務調整與條款更新'}`
- `{messages.legal?.terms?.serviceChanges?.body?.map(item =>`
- `25) {messages.legal?.terms?.userContent?.title || '使用者內容與公開展示授權'}`
- `{messages.legal?.terms?.userContent?.body?.map(item =>`
- `26) {messages.legal?.terms?.liabilityCap?.title || '責任限制與賠償上限'}`
- `{messages.legal?.terms?.liabilityCap?.body?.map(item =>`
- `27) {messages.legal?.terms?.governingLaw?.title || '適用法律與爭議解決'}`
- `{messages.legal?.terms?.governingLaw?.body?.map(item =>`
- `{messages.legal?.terms?.appendix_title || '附錄｜定義與解釋'}`
- `{messages.legal?.terms?.appendix?.map(item =>`

## src/pages/favicon.ico.ts

- `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect rx='12' width='64' height='64' fill='#0C1E3A'/><circle cx='24' cy='24' r='12' fill='#E32521'/></svg>`
- `public, max-age=31536000, immutable`
- `{
  const svg = "`

## src/pages/robots.txt.ts

- `public, max-age=86400`

## src/pages/sitemap.xml.ts

- `public, max-age=3600`
- `${urls.map(url => \``

## src/utils/faq-vm.ts

- `k.includes('_title') || k.includes('_body'));
  
  if (hasNewFormat) {
    // New structured format: qN_title + qN_body
    const titleKeys: number[] = [];
    for (let i = 1; i`
- `= [];
    for (let i = 1; i`
- `= [];
    for (let s = 1; s`
- `a.idx - b.idx);
      sectionMarkers.sort((a, b) => a.s - b.s);
      
      for (let i = 0; i`
- `{
            if (!next) return x.idx >= cur.s;
            return x.idx >= cur.s && x.idx`

## src/utils/head.ts

- `<meta property="og:image" content="${meta.image}" />`
- `${meta.locale.replace('-', '_')}`
- `<meta name="twitter:image" content="${meta.image}" />`
- `<script type="application/ld+json">${JSON.stringify(data)}</script>`
- `${meta.image ? \``
- `\` : ''}`
- `\`;
}

export function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('`

## src/utils/metrics.ts

- `Failed to load placeholders`

## src/utils/number-format.ts

- `= 1) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(n);
  }
  //`

---
title: UI Guidelines
version: v1.2.0
updated: 2025-10-10
owner: moonpacket-core
---

Typography (SAFE):
- Brand/Headings: Sora Variable (lowercase brand word: "moonpacket")
- Body: Inter Variable
- Numerals: IBM Plex Sans (tabular-nums, lining-nums, slashed zero)
- Locale stacks: Latin=Inter; :lang(zh-TW)=Noto Sans TC; :lang(zh-CN)=Noto Sans SC; :lang(ja)=Noto Sans JP; :lang(ko)=Noto Sans KR; [dir="rtl"]=Vazirmatn (UI)
- Do NOT include Binance fonts unless licensed and approved

Numeric rules (GLOBAL):
- All `.num`/`.price` must be bold (font-weight:700) with exchange green `#16A34A` by default.
- Keep numeral features enabled: `tnum`, `lnum`, `zero`.
- Currency formatting (general): fiat uses 2 decimals.
- Waterfall module: crypto amounts display 8 decimals consistently (e.g., USDT/TON/SOL/ETH).

Sizing tokens (no fixed px):
- --fz-hero, --fz-h1, --fz-h2, --fz-h3 via clamp(); body 1rem; title line-heights 1.1–1.15

Brand tones:
- primary #E32521, navy #0C1E3A, gold #FFBA00, gradient primary→gold, on-dark white+subtle shadow

Colors: see `tailwind.config.js` and `src/styles.css`.


Logo & Brandmark:
- Files: `/favicon.ico`, `/favicon.png`, `/icons/logo-192.png` (used for PWA/apple-touch); additional sizes may be added under `/public/icons/`.
- Clearspace: keep padding equal to the height of the letter "m" around logo in composited layouts.
- Minimum size: 24×24px for UI controls; 48×48px recommended in headers.
- Do not: stretch, skew, rotate, alter proportions, or change brand colors outside of defined tones.
- Backgrounds: on light use brand tones; on dark use white or apply subtle shadow/outline for readability (see `.brand-word[data-tone="on-dark"]`).

Wordmark (標準字):
- Text: lowercase `moonpacket` only; avoid title/uppercase on the brand word.
- Component: `src/components/BrandWord.astro`.
- Typeface & weight: Sora, weight 700; letter-spacing −0.01em; line-height per `typography.css`.
- Tones: `primary` `navy` `gold` `gradient` `on-dark` (see `src/styles/typography.css`).

Fonts & Hosting:
- Primary families declared in `src/styles/typography.css` and preloaded in `src/layouts/BaseLayout.astro`.
- Self-host WOFF2 under `/public/fonts`. Temporary TTF fallbacks are present; remove once WOFF2 are available.

Loading Overlay (global route transition):
- Behavior: show on in-app navigations; hide on `load`/`pageshow` (bfcache restore). Non-blocking and accessible.
- Appearance: theme-aware background (light: white/0.8 blur; dark: black/0.5), spinner 2px stroke with gold `#FFBA00` top.
- Placement: defined globally in `BaseLayout.astro` as `#route-loading`; appears above content (`z-index` > header).
- Interaction: overlay disables pointer-events while visible; fades out within ~250–300ms.

Accessibility:
- Maintain AA contrast for text/buttons; see helpers in `typography.css` for `.btn`, `.btn-primary`, `.btn-outline`.
- Provide `aria-label` on social links and icons.

Where to find styles:
- Theme tokens & colors: `src/styles/theme.css`, `tailwind.config.js`.
- Typography rules & helpers: `src/styles/typography.css`.
- Layout & SEO wiring: `src/layouts/BaseLayout.astro` (fonts preload, favicons, hreflang, theme toggle).
- Brand assets: `/favicon.ico`, `/favicon.png`, `/icons/logo-192.png`.

### 元件級用法範例（Components）

#### BrandWord（標準字）
用途：展示 lowercase 品牌字樣 `moonpacket`。

```astro
---
import BrandWord from '@/components/BrandWord.astro';
---
<BrandWord as="span" size="h2" tone="navy" />
```

- `size`: `hero` | `h1` | `h2` | `nav`（見 `src/styles/typography.css` 的變數尺寸）。
- `tone`：`primary` | `navy` | `gold` | `gradient` | `on-dark`。
- 深色背景時使用：

```astro
<div class="bg-[#0C1E3A] p-4">
  <BrandWord as="span" size="h2" tone="on-dark" />
  <!-- on-dark 會套用白色 + subtle shadow，確保可讀性 -->
  </div>
```

#### Buttons（按鈕）
語意按鈕組合了無障礙聚焦樣式與品牌色：

```html
<a href="#" class="btn btn-primary">主要動作</a>
<a href="#" class="btn btn-outline">次要動作</a>
```

- 相關樣式在 `src/styles/typography.css`：`.btn`、`.btn-primary`、`.btn-outline`。
- 聚焦可見性（focus-visible）與 AA 對比已內建，避免覆蓋。

#### Numbers（數字/金額）
保持字體為 IBM Plex Sans/Inter，啟用表格數字，統一粗體與上升綠。

```html
<span class="num">91,234.56000000</span>
```

- `.num`/`.price` 已含 `font-variant-numeric: tabular-nums` 與 `font-weight:700`，顏色為 `#16A34A`。
- Waterfall 模組：所有加密幣顯示 8 位小數；格式化邏輯見 `src/islands/Waterfall.tsx`。

#### Loading（全局路由切換）
全局覆蓋層已在 `BaseLayout.astro` 內定義，不需頁面額外引入。

行為要點：
- 站內連結（非外部連結）點擊時顯示；頁面 `load/pageshow` 後自動隱藏。
- 依據 `<html data-theme>` 自動套用亮/暗樣式；切換主題時會即時調整。

測試建議：
1) 在 `http://localhost:4321/zh-TW/` 與子頁之間切換，觀察覆蓋層淡入淡出。
2) 切換主題按鈕（`#theme-toggle`）後再次導航，確認顏色自適配。

#### Theme（主題）
主題狀態保存在 `<html data-theme>` 與 localStorage `mp_theme`，開關在 `BaseLayout.astro`：

```html
<button id="theme-toggle" type="button">切換主題</button>
```

- 沒有用戶選擇時會依 `prefers-color-scheme` 與時間自動推斷；詳見 `BaseLayout.astro` 內聯腳本。

#### Logo（圖標）
- Header 使用 `/favicon.png`（48×48）作為快速示意；PWA 使用 `/icons/logo-192.png`。
- 最小尺寸：24×24（控制元件）；Header 推薦 48×48。
- 請保持原始比例，不拉伸或更改品牌色；深色背景下可加外發光/陰影以增強可讀。

### 圖片/截圖資源（建議）
- 建議在 `docs/assets/` 放置設計截圖（BrandWord 不同 tone/尺寸、按鈕狀態、Loading 覆蓋層亮/暗模式示例）。
- 文檔中可內嵌相對路徑引用，便於維護。



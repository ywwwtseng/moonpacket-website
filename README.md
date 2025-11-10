---
title: MoonPocket Static Site
version: v1.0.1
updated: 2025-10-03
owner: moonpacket-core
---

Production-ready Astro + TypeScript + Tailwind v4 static site. 34 locales (incl. RTL), SEO-first with SSR metric fallbacks and client enhancement. No GitHub Actions required.

## 🚀 快速開始

### 開發者（新功能開發）
```bash
pnpm i
pnpm dev:check          # 檢查開發環境
pnpm dev --port 4321    # 啟動開發服務器
```

**📚 重要**：新功能開發請先閱讀：
- [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) - 開發規範
- [docs/i18n-GUIDE.md](./docs/i18n-GUIDE.md) - 多語言規範

### 一般用戶
```bash
pnpm i
pnpm dev
```

## Build
```bash
# default: ./dist
pnpm build
# or output to /docs for GitHub Pages main branch
OUT_DIR=docs pnpm build
```

## Publish (No Actions)
- Option A: gh-pages branch
```bash
pnpm build
git subtree push --prefix dist origin gh-pages
```
- Option B: /docs on main
```bash
OUT_DIR=docs pnpm build
# commit ./docs and push main
```

## Configure SITE/base
Update `SITE` in `astro.config.mjs` to your GitHub Pages URL, e.g. `https://<user>.github.io/<repo>`. Internal links honor `BASE_URL` automatically.

## Live Metrics API
- SSR fallback from `public/data/placeholders.json`
- Client island `src/islands/LiveMetrics.tsx` fetches `data-api-src` every 60s
- Swap to your API by replacing `data-api-src` on each `MetricCard`

## Brand Assets
- Put OG image at `public/images/og-default.png`
- Logo SVG at `public/icons/logo.svg`

## Tests
- Unit: `pnpm test:unit`
- E2E: `pnpm build && pnpm preview & wait-on http://localhost:4321 && pnpm test:e2e`

## See also
- Contributing: `CONTRIBUTING.md`
- Code style: `CODESTYLE.md` (aligns with `.prettierrc`, `.eslint.config.mjs`)
- UI guidelines: `UI-GUIDELINES.md`
- Directory & naming: `DIRECTORY-NAMING.md`
- Tests overview: `tests/README.md`
- Metrics data shape: `public/data/README.md`
- i18n rule: No hardcoded copy (incl. SEO title/description) — read from `messages.*` only

## Backup & Private Repo (Safe by design)

### ⚠️ 核心原則：單向備份

**所有備份操作都是單向的，只從本地推送到遠程，絕對不會修改本地文件。**

詳細策略請參考：
- 備份策略：`docs/BACKUP-POLICY.md`
- 發布政策：`docs/PUBLICATION-POLICY.md`

### 推薦使用：智能備份 ⭐

```bash
# 智能備份（只提交核心變更到本地）
pnpm backup

# 智能備份並推送到私庫（推薦）
pnpm backup:push
```

**特點**：
- ✅ 只備份核心代碼文件
- ✅ 自動跳過構建產物和大文件
- ✅ 比較遠程，只上傳新文件
- ✅ 快速、高效、安全

### 傳統備份命令（已不推薦）

```bash
# Quick local backup (264MB, seconds)
pnpm run backup:simple

# Quick private repo backup (one-way push)
pnpm run backup:private-simple

# Full backup with git history
pnpm run backup:safe

# Push to private repo (may be slow)
pnpm run backup:moonpocket

# Deploy to GitHub Pages
pnpm run publish:public
```

### Advanced: Use "git bundle + temp clone + dry-run" to push to private repo without touching the working tree.
```bash
cd /Users/yichen/Downloads/cursor/moonpocket
mkdir -p backups
ts=$(date +%Y%m%d-%H%M%S)
bundle="backups/moonpocket-$ts.bundle"
git bundle create "$bundle" --all --tags && git bundle verify "$bundle"
tmpdir=$(mktemp -d)
git clone "$bundle" "$tmpdir/moonpocket-publish"
cd "$tmpdir/moonpocket-publish"
git remote add private git@github.com:ywwwtseng/moonpacket.git
git ls-remote --heads private && git fetch private --prune
git push --dry-run private --all && git push --dry-run private --tags
git push private --all && git push private --tags
```
Config hardening (in your main repo):
```bash
git config --local pull.ff only
git config --local fetch.prune false
```
# 版本號管理測試

## i18n：从 CSV 回写到 `locales/*/*.json`

> 工具脚本：`tools/i18n-apply-from-csv.mjs`  
> CSV 位置：仓库根目录 `i18n-export.csv`  
> 目录约定：每个 namespace 一个文件：`./locales/<locale>/<namespace>.json`  
> 保护与清理：去 HTML 标签、保护品牌词 `moonpacket` / `moonini`（保持小写），保护主流链/代币缩写（SOL、TON、TRON、BEP、ETH、BTC、USDT、USDC、BNB、XRP、DOGE、SHIB、meme）。  
> UI 不应被动到的路径会被忽略：包含 `marquee` / `waterfall` / `hero` / `animate` 的文件路径。

### 安装与脚本

在 `package.json` 中加入：

```jsonc
{
  "scripts": {
    "i18n:apply": "node tools/i18n-apply-from-csv.mjs --locale=zh-TW",
    "i18n:apply:locale": "node tools/i18n-apply-from-csv.mjs"
  }
}
```

### 基本用法

全量写回繁中：

```bash
npm run i18n:apply
# 等价：
node tools/i18n-apply-from-csv.mjs --locale=zh-TW
```

指定语言写回：

```bash
node tools/i18n-apply-from-csv.mjs --locale=en-US
```

### 选择性写回（无需全量）

只处理某些 key（namespace:key，可多个）：

```bash
node tools/i18n-apply-from-csv.mjs --locale=zh-TW --only="send:faq.q1_body.0,claim:faq.a16_title"
```

只处理 CSV 的某几行（支持范围）：

```bash
node tools/i18n-apply-from-csv.mjs --locale=zh-TW --rows=900
node tools/i18n-apply-from-csv.mjs --locale=zh-TW --rows=880-885,930
```

用正则筛选要处理的 key（匹配 namespace/key）：

```bash
node tools/i18n-apply-from-csv.mjs --locale=zh-TW --grep="^send/faq\\.q1_"
```

### 自动去"标题重复"

不少条目里首行标题会在正文第一行重复（例如 "1) 标题 …" 下一行又重复一次）。脚本会：

- 去掉各种编号样式（1) / 1. / １）/ Q1. 等、含全角）
- 如果前二个非空行在去编号/去标点/去标签后高度相似（≥90%）或相等，就自动删除第二行
- 仅处理内容，不影响 UI 结构（如瀑布流/跑马灯/hero 等）

### 运行后检查

```bash
git status
git diff --stat
# 如需查看具体变更：
git diff
```

若看到不该变更的文件（含 marquee / waterfall / hero / animate），请提 Issue。



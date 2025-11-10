---
title: Publication Policy — GitHub Pages & Private Backup
version: v1.3.1
updated: 2025-10-10
owner: moonpacket-core
---

目的：定義公開到 GitHub Pages（GH Pages）時的「可公開範圍」與「必須保密」清單，並提供部署與稽核流程，避免洩漏私密資訊。

可公開（Public）
- dist/ 產出之純靜態檔：.html、.css、.js、.svg、.png、.ico、manifest、webfonts（需確認授權）
- 官網頁面：首頁、領紅包、發紅包、隱私權條款、使用者條款
- 公開示意資料：public/data/metrics.json、public/data/waterfall.json（僅示意，無個資）
- 公開文件（可選）：README.md、UI-GUIDELINES.md、docs/CHANGELOG.md、本文件

嚴禁公開（Private）
- 原始碼與設定：src/**、scripts/**、tests/**、.husky/**、.github/**（若含私密憑證或內部流程）、任何 .env / 金鑰 / 憑證
- 備份：backups/**
- 開發相關：node_modules/**、.turbo/**、.astro/**、coverage/**、*.map（sourcemap）
- 受授權限制之字型檔（若授權不明）：public/fonts/**（未確認授權前，改走 Google Fonts CDN）

部署策略（建議）
- 單庫雙分支：main（私有） + gh-pages（公開）。CI 只將 dist/ 推到 gh-pages。
- 或「分離公開庫」：moonpocket-site-public（公開），僅接收 dist/ 與公開文件。

最小權限流程（人工作業）
1) 檢查與建置：pnpm i && pnpm build
2) 稽核 dist/：不得含 .map、.env、internal/ 私有內容；字型授權不明則排除
3) 發佈到 gh-pages：git subtree push --prefix dist origin gh-pages（或用 CI）

CI（參考）
- 在公開庫使用 GitHub Actions：
  - 安裝 PNPM → pnpm build
  - 移除 *.map / 私密檔 → 上傳 dist 到 gh-pages
  - 若部署到 repo 子路徑，請設定 build base：/REPO_NAME/

資安/法遵檢查清單（每次部署前）
- 配置/密鑰/個資：不在 dist/ 與 public/
- 字型授權：未確認授權則不打包，依賴 Google Fonts CDN
- Sourcemap：關閉或移除 *.map
- 協議頁：/{lang}/privacy/、/{lang}/terms/ 可正常存取

回滾與備份
- 每次部署前建立 tar.gz（排除 node_modules、dist、backups 內既有檔）：backups/backup-YYYYMMDD-HHMMSS.tar.gz + .sha256

執行原則（需明確指令）
- 所有「備份 / 推送 / 發佈」操作僅在「收到所有者明確指令」時執行。
- 預設不自動觸發任何遠端操作；任何動作皆以「只讀原工作樹」為前提。

## Moonpocket 專案備份策略（2025-10-07 更新）

### 問題識別
- Git 根目錄：`/Users/yichen/Downloads/cursor`（包含多個專案）
- Moonpocket 專案：`/Users/yichen/Downloads/cursor/moonpocket`
- 風險：`git push` 會推送整個 cursor 目錄的所有專案歷史

### 安全備份原則
- **專案隔離**：只備份 moonpocket 專案內容，不包含其他專案
- **版本保留**：保留最近 3 個版本（而非按天數），避免週末無開發時誤刪
- **不修改本地**：所有操作不影響本地工作目錄
- **明確指令**：只有用戶明確要求才執行備份/推送操作

### 備份指令

#### 方法一：簡單本地備份（推薦）⭐
```bash
# 快速本地備份（264MB，幾秒完成）
pnpm run backup:simple
# 或
node scripts/backup-simple.mjs
```

**特點：**
- ✅ 只備份當前專案文件
- ✅ 排除無用文件（node_modules、.git、.astro、dist）
- ✅ 文件大小約 264MB（vs 之前的 21GB）
- ✅ 備份速度快（幾秒鐘完成）
- ✅ 自動刪除舊備份（保留最新 2 個）
- ✅ 包含 SHA256 校驗和確保完整性

#### 方法二：簡單私庫備份（推薦）⭐
```bash
# 快速私庫備份（單向推送，不拉取）
pnpm run backup:private-simple
# 或
node scripts/backup-private-simple.mjs
```

**特點：**
- ✅ 只推送 moonpocket 專案內容
- ✅ 單向推送，不拉取遠端歷史
- ✅ 在臨時目錄操作，不影響本地文件
- ✅ 備份速度快（幾秒鐘完成）
- ✅ 自動清理臨時文件

#### 方法三：專案專用備份
```bash
# 專案專用備份（推送到私庫）
pnpm run backup:moonpocket
# 或
node scripts/backup-moonpocket-only.mjs
```

**特點：**
- ✅ 只推送 moonpocket 專案內容
- ✅ 推送到私庫備份分支
- ✅ 不影響本地文件
- ⚠️ 可能較慢（會拉取遠端歷史）

#### 方法四：完整備份（包含 git 歷史）
```bash
# 完整備份（包含所有 git 歷史）
pnpm run backup:safe
# 或
node scripts/backup-safe.mjs
```

**特點：**
- ⚠️ 包含完整 git 歷史和所有分支
- ⚠️ 文件較大（可能數 GB）
- ⚠️ 備份時間較長
- ✅ 包含完整的版本歷史

### 備份內容
- **本地**：`backups/backup-YYYYMMDD-HHMMSS.tar.gz` + SHA256
- **排除**：`node_modules`, `.astro`, `dist`, `backups`, `.git`, `.DS_Store`
- **私庫**：推送到 `backup/YYYYMMDD-HHMMSS` 分支（使用 git subtree）

私庫安全備份與推送（強制只讀原工作目錄）
1) 一律使用 git bundle 打包（只讀）：
```
cd /Users/yichen/Downloads/cursor/moonpocket
mkdir -p backups
ts=$(date +%Y%m%d-%H%M%S)
bundle="backups/moonpocket-$ts.bundle"
git bundle create "$bundle" --all --tags
git bundle verify "$bundle"
```
2) 於臨時目錄用 bundle 還原，所有推送在臨時倉庫進行：
```
tmpdir=$(mktemp -d)
git clone "$bundle" "$tmpdir/moonpocket-publish"
cd "$tmpdir/moonpocket-publish"
git remote add private git@github.com:ywwwtseng/moonpacket.git
git ls-remote --heads private
git fetch private --prune
# 差異檢視（若遠端已有 main）
git log --oneline --left-right --cherry-pick private/main...main || true
```
3) 推送前務必 dry-run：
```
git push --dry-run private --all
git push --dry-run private --tags
```
4) 確認後再正式推送（仍然不影響本地原工作樹）：
```
git push private --all
git push private --tags
```

零改動參考備份（最快）
- 在不碰本地工作樹的前提下，將當前 HEAD 指到遠端備份 refs：
```
ts=$(date +%Y%m%d-%H%M%S)
export GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes'
git push git@github.com:ywwwtseng/moonpacket.git HEAD:refs/heads/backups/$ts
git push git@github.com:ywwwtseng/moonpacket.git HEAD:refs/tags/backups/$ts
```
還原時：`git checkout backups/<timestamp>`。

防呆與禁止危險操作
- 在原倉庫設定：
```
git config --local pull.ff only      # 僅允許快轉式 pull，避免覆蓋/合併
git config --local fetch.prune false # 禁止自動 prune 遠端分支
```
- 可選 pre-push（拒絕 force push）：`.husky/pre-push`
```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
case "$*" in
  *--force*|*-f*) echo "[BLOCK] force push is disabled"; exit 1;;
esac
exit 0
```

風險說明
- 任何與遠端不同步的情況，都在臨時倉庫中解決；主工作目錄「絕不修改、絕不刪檔」。
- 僅在 dry-run 無異常且人工確認後，才做正式推送。

公開發佈（GitHub Pages）
1) 建置（需設定 SITE 為 Pages 路徑，並確保 `public/.nojekyll` 存在）：
```
cd /Users/yichen/Downloads/cursor/moonpocket
SITE=https://ywwwtseng.github.io/moonpacket-site pnpm build
```
2) 只把 dist 推到公開庫（臨時目錄、關閉 GPG 簽章）：
```
export GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes'
tmpdir=$(mktemp -d)
rsync -a dist/ "$tmpdir"/
cd "$tmpdir"
git init
git add -A
git -c user.name="moonpacket-deploy" -c user.email="deploy@local" -c commit.gpgsign=false commit -m "deploy: $(date +%Y-%m-%dT%H:%M:%S%z)"
git branch -M main
git remote add origin git@github.com:ywwwtseng/moonpacket-site.git
git push -f origin main
```
3) 若 Pages 仍 404 `_astro/*`，請確認公開庫根目錄存在 `.nojekyll`。

### moonpacket.com/gh-pages 標準流程（本地/對外一致）

- 變數
  - `SITE`：公開站基底（例：`https://moonpacket.com/`）
  - `CNAME`：自訂網域（例：`moonpacket.com`）
  - `PUBLIC_ONLY`：`1`=只公開語言；`0`=34 語言
  - `GITHUB_TOKEN`：用於 HTTPS 非互動推送

- 本地預覽（不推送）
  - 只公開語言：`SITE=http://localhost:4321/ PUBLIC_ONLY=1 pnpm build:public && pnpm preview`
  - 34 語言：`SITE=http://localhost:4321/ PUBLIC_ONLY=0 pnpm build && pnpm preview`

- 對外部署（推薦：簡化、不卡 SSH）
  - `SITE=https://moonpacket.com/ CNAME=moonpacket.com GITHUB_TOKEN=*** pnpm publish:simple`
  - 腳本 `scripts/publish-simple.mjs`：
    - 以 /tmp 初始化臨時 repo → 複製 dist → commit → 以 HTTPS+Token 推送到 `gh-pages`
    - 自動寫入 `.nojekyll` 與 `CNAME`

- 對外部署（原 deploy.sh 流程）
  - 只公開語言：`GITHUB_TOKEN=*** PUBLIC_ONLY=1 ./deploy.sh "deploy: public-only to gh-pages"`
  - 34 語言：`GITHUB_TOKEN=*** PUBLIC_ONLY=0 ./deploy.sh "deploy: all locales to gh-pages"`
  - 說明：在 `__deploy_tmp/` clone 公庫後推送；不改動本地 .git

責任人與聯絡
- Owner：moonpacket-core
- 隱私：privacy@moonpacket.example
- 法務：legal@moonpacket.example
- 支援：support@moonpacket.example

## 最近更新（2025-10-10）

- 新增：本地快速備份與私庫單向推送備份的落地記錄（僅備份本專案）
  - 本地：`backups/backup-YYYYMMDD-HHMMSS.tar.gz`（含 `.sha256`）
  - 私庫：分支 `backup/YYYYMMDD-HHMMSS`
- 校驗私庫遠端是否已存在最新備份分支：

```bash
# 列出遠端備份分支（示例）
git ls-remote --heads git@github.com:ywwwtseng/moonpacket.git | grep backup/
```

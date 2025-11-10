# 備份策略文檔

## 核心原則

### ⚠️ 單向備份原則

**這是最重要的原則：備份是單向操作，只從本地推送到遠程，絕對不會修改本地文件。**

### 安全保證

1. **絕對不會修改本地文件**
   - 不執行任何會改變工作區文件的 Git 命令
   - 不執行 `git pull`、`git fetch`、`git merge`
   - 不執行 `git reset --hard`、`git checkout -f`
   - 不刪除、不移動、不修改任何本地文件

2. **只執行安全操作**
   - ✅ `git status` - 讀取狀態
   - ✅ `git ls-tree` - 讀取遠程文件列表
   - ✅ `git reset`（不帶參數）- 只重置 staging area，不影響工作區
   - ✅ `git add` - 只添加到 staging area
   - ✅ `git commit` - 只創建提交
   - ✅ `git push` - 只推送到遠程

3. **智能文件過濾**
   - 只備份核心代碼文件（`.astro`, `.ts`, `.json`, `.css` 等）
   - 跳過構建產物（`dist/`, `node_modules/` 等）
   - 對於圖片等資源文件，只備份本地有但遠程沒有的新文件

## 使用方式

### 本地備份（推薦日常使用）

```bash
pnpm backup
```

- 只提交到本地 Git 倉庫
- 不推送到遠程
- 快速保存工作進度

### 備份並推送到私庫

```bash
pnpm backup:push
```

- 提交到本地 Git 倉庫
- 自動推送到私庫（`git push private master`）
- 用於重要里程碑或需要異地備份時

## 智能過濾規則

### 永遠排除的文件

```
dist/
build/
.astro/
node_modules/
.DS_Store
*.log
*.pid
backups/
.tmp-*
test-results/
tests/
```

### 大文件（需檢查遠程）

```
public/fonts/**
public/images-optimized/**
public/images/**/*.png
public/images/**/*.jpg
public/images/**/*.webp
public/images/**/*.avif
public/images/**/*.gif
public/images/**/*.svg
```

對於這些文件：
- 如果本地有但遠程沒有 → 備份
- 如果遠程已存在 → 跳過

### 始終包含的核心文件

- 所有 `src/` 目錄下的代碼文件
- 配置文件（`package.json`, `astro.config.mjs` 等）
- 腳本文件（`scripts/*.mjs`, `scripts/*.sh`）
- i18n 文件（`src/i18n/**/*.json`）
- 樣式文件（`src/**/*.css`）

## 故障恢復

如果備份過程中出現錯誤：

1. **腳本會自動停止** - 不會繼續執行可能有風險的操作
2. **本地文件完全不受影響** - 工作區文件狀態不變
3. **可以安全重試** - 修正問題後重新執行 `pnpm backup`

## 開發者注意事項

### ⚠️ 修改 `backup-smart.mjs` 時必須遵守

1. **永遠不要添加會修改本地文件的命令**
   - 禁止：`git pull`, `git fetch`, `git merge`
   - 禁止：`git reset --hard`, `git checkout -f`
   - 禁止：任何刪除或修改工作區文件的操作

2. **只使用安全的讀取和推送操作**
   - 允許：讀取 Git 狀態和歷史
   - 允許：添加、提交和推送變更
   - 允許：重置 staging area（`git reset` 不帶 `--hard`）

3. **添加新功能前請先確認**
   - 是否符合「單向備份」原則？
   - 是否可能修改本地文件？
   - 是否需要在文檔中記錄？

## 更新歷史

- **2025-10-11**: 初始版本，建立單向備份原則
  - 實現智能文件過濾
  - 實現遠程文件比較
  - 明確禁止任何修改本地文件的操作


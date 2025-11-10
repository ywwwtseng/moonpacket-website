# MoonPocket ZIP 备份规范

## 概述

本文档定义了 MoonPocket 项目的标准化 ZIP 备份流程，确保备份文件大小合理且包含所有必要内容。

## 备份大小分析

### 当前项目结构
- **源代码**: 2.4MB (`src/`)
- **图片资源**: 135MB (`public/images/`)
- **数据文件**: 36KB (`public/data/`)
- **脚本**: 116KB (`scripts/`)
- **文档**: 80KB (`docs/`)
- **配置文件**: ~300KB (各种 .json, .js, .md 文件)
- **依赖锁定**: 220KB (`pnpm-lock.yaml`)

**总计**: ~138MB（包含图片）

## 备份策略

### 1. 完整备份（推荐）
包含所有核心文件，适合完整项目备份：

```bash
# 创建时间戳
timestamp=$(date +%Y%m%d-%H%M%S)

# 完整备份（包含图片）
zip -r "moonpocket-complete-$timestamp.zip" \
  src/ \
  public/ \
  scripts/ \
  docs/ \
  package.json \
  pnpm-lock.yaml \
  astro.config.mjs \
  tailwind.config.js \
  tsconfig.json \
  postcss.config.cjs \
  README.md \
  DEVELOPMENT-GUIDE.md \
  CODESTYLE.md \
  CONTRIBUTING.md \
  DIRECTORY-NAMING.md \
  UI-GUIDELINES.md \
  FINAL-SUMMARY.md \
  HARDCODED-TEXT-REPORT.md \
  translations-template.csv \
  .eslint.config.mjs \
  .prettierrc

echo "✅ 完整备份完成: moonpocket-complete-$timestamp.zip"
```

**预期大小**: ~140MB

### 2. 代码备份（不含图片）
仅包含代码和配置，适合代码备份：

```bash
# 创建时间戳
timestamp=$(date +%Y%m%d-%H%M%S)

# 代码备份（排除图片）
zip -r "moonpocket-code-$timestamp.zip" \
  src/ \
  public/data/ \
  public/favicon.ico \
  public/site.webmanifest \
  public/icons/ \
  public/sitemap.xml \
  public/robots.txt \
  public/.nojekyll \
  scripts/ \
  docs/ \
  package.json \
  pnpm-lock.yaml \
  astro.config.mjs \
  tailwind.config.js \
  tsconfig.json \
  postcss.config.cjs \
  README.md \
  DEVELOPMENT-GUIDE.md \
  CODESTYLE.md \
  CONTRIBUTING.md \
  DIRECTORY-NAMING.md \
  UI-GUIDELINES.md \
  FINAL-SUMMARY.md \
  HARDCODED-TEXT-REPORT.md \
  translations-template.csv \
  .eslint.config.mjs \
  .prettierrc

echo "✅ 代码备份完成: moonpocket-code-$timestamp.zip"
```

**预期大小**: ~5MB

### 3. 最小备份（仅核心）
仅包含最核心的文件：

```bash
# 创建时间戳
timestamp=$(date +%Y%m%d-%H%M%S)

# 最小备份
zip -r "moonpocket-minimal-$timestamp.zip" \
  src/ \
  public/data/ \
  package.json \
  pnpm-lock.yaml \
  astro.config.mjs \
  README.md

echo "✅ 最小备份完成: moonpocket-minimal-$timestamp.zip"
```

**预期大小**: ~3MB

## 排除规则

### 始终排除
- `node_modules/` - 依赖模块
- `dist/` - 构建产物
- `backups/` - 备份目录
- `.git/` - Git历史
- `.venv/` - Python虚拟环境
- `.astro/` - Astro构建缓存
- `*.log` - 日志文件
- `*.pid` - 进程ID文件
- `.DS_Store` - 系统文件
- `test-results/` - 测试结果
- `.tmp-*` - 临时文件
- `*.map` - Source map文件

### 可选排除
- `public/images/` - 图片资源（如果不需要）
- `docs/` - 文档（如果只需要代码）
- `scripts/` - 脚本（如果只需要核心功能）

## 使用建议

### 开发备份
使用**代码备份**，快速且包含所有开发必要文件。

### 发布备份
使用**完整备份**，确保包含所有资源文件。

### 传输备份
根据网络情况选择：
- 快速传输：代码备份（5MB）
- 完整传输：完整备份（140MB）

## 自动化脚本

### 创建备份脚本
```bash
#!/bin/bash
# backup-moonpocket.sh

BACKUP_TYPE=${1:-"complete"}  # complete, code, minimal
timestamp=$(date +%Y%m%d-%H%M%S)

case $BACKUP_TYPE in
  "complete")
    echo "创建完整备份..."
    zip -r "moonpocket-complete-$timestamp.zip" \
      src/ public/ scripts/ docs/ \
      package.json pnpm-lock.yaml astro.config.mjs tailwind.config.js \
      tsconfig.json postcss.config.cjs \
      README.md DEVELOPMENT-GUIDE.md CODESTYLE.md CONTRIBUTING.md \
      DIRECTORY-NAMING.md UI-GUIDELINES.md FINAL-SUMMARY.md \
      HARDCODED-TEXT-REPORT.md translations-template.csv \
      .eslint.config.mjs .prettierrc
    ;;
  "code")
    echo "创建代码备份..."
    zip -r "moonpocket-code-$timestamp.zip" \
      src/ public/data/ public/favicon.ico public/site.webmanifest \
      public/icons/ public/sitemap.xml public/robots.txt public/.nojekyll \
      scripts/ docs/ package.json pnpm-lock.yaml astro.config.mjs \
      tailwind.config.js tsconfig.json postcss.config.cjs \
      README.md DEVELOPMENT-GUIDE.md CODESTYLE.md CONTRIBUTING.md \
      DIRECTORY-NAMING.md UI-GUIDELINES.md FINAL-SUMMARY.md \
      HARDCODED-TEXT-REPORT.md translations-template.csv \
      .eslint.config.mjs .prettierrc
    ;;
  "minimal")
    echo "创建最小备份..."
    zip -r "moonpocket-minimal-$timestamp.zip" \
      src/ public/data/ package.json pnpm-lock.yaml astro.config.mjs README.md
    ;;
  *)
    echo "用法: $0 [complete|code|minimal]"
    exit 1
    ;;
esac

echo "✅ 备份完成: moonpocket-$BACKUP_TYPE-$timestamp.zip"
```

### 使用方法
```bash
# 完整备份
./backup-moonpocket.sh complete

# 代码备份
./backup-moonpocket.sh code

# 最小备份
./backup-moonpocket.sh minimal
```

## 验证备份

### 检查备份内容
```bash
# 查看备份内容
unzip -l moonpocket-*.zip

# 检查备份大小
ls -lh moonpocket-*.zip
```

### 测试恢复
```bash
# 创建测试目录
mkdir test-restore
cd test-restore

# 解压备份
unzip ../moonpocket-*.zip

# 验证关键文件
ls -la src/ public/ package.json
```

## 版本控制

### 备份命名规范
- 格式：`moonpocket-{type}-{timestamp}.zip`
- 类型：`complete`, `code`, `minimal`
- 时间戳：`YYYYMMDD-HHMMSS`

### 保留策略
- 本地保留：最近 5 个备份
- 远程保留：最近 10 个备份
- 自动清理：超过 30 天的备份

## 注意事项

1. **图片优化**：如果图片过大，考虑使用 `scripts/images-optimize.mjs` 优化
2. **依赖更新**：定期更新 `pnpm-lock.yaml` 确保依赖一致性
3. **文档同步**：确保文档与代码同步更新
4. **测试验证**：备份后应测试恢复流程

## 总结

- **142MB 是正常的**，主要因为包含 135MB 的图片资源
- **代码备份**（5MB）适合日常开发备份
- **完整备份**（140MB）适合发布和完整项目备份
- 使用标准化脚本确保备份一致性

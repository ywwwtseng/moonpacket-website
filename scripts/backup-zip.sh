#!/bin/bash
# MoonPocket ZIP 备份脚本
# 用法: ./backup-moonpocket.sh [complete|code|minimal]

BACKUP_TYPE=${1:-"complete"}  # complete, code, minimal
timestamp=$(date +%Y%m%d-%H%M%S)

echo "🚀 MoonPocket ZIP 备份工具"
echo "备份类型: $BACKUP_TYPE"
echo "时间戳: $timestamp"
echo ""

case $BACKUP_TYPE in
  "complete")
    echo "📦 创建完整备份（包含图片，~140MB）..."
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
    ;;
  "code")
    echo "💻 创建代码备份（不含图片，~5MB）..."
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
    ;;
  "minimal")
    echo "⚡ 创建最小备份（仅核心，~3MB）..."
    zip -r "moonpocket-minimal-$timestamp.zip" \
      src/ \
      public/data/ \
      package.json \
      pnpm-lock.yaml \
      astro.config.mjs \
      README.md
    ;;
  *)
    echo "❌ 错误：未知的备份类型 '$BACKUP_TYPE'"
    echo ""
    echo "用法: $0 [complete|code|minimal]"
    echo ""
    echo "备份类型说明："
    echo "  complete  - 完整备份（包含图片，~140MB）"
    echo "  code      - 代码备份（不含图片，~5MB）"
    echo "  minimal   - 最小备份（仅核心，~3MB）"
    echo ""
    echo "示例："
    echo "  $0 complete    # 完整备份"
    echo "  $0 code        # 代码备份"
    echo "  $0 minimal     # 最小备份"
    exit 1
    ;;
esac

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 备份完成: moonpocket-$BACKUP_TYPE-$timestamp.zip"
  
  # 显示备份文件信息
  if [ -f "moonpocket-$BACKUP_TYPE-$timestamp.zip" ]; then
    size=$(ls -lh "moonpocket-$BACKUP_TYPE-$timestamp.zip" | awk '{print $5}')
    echo "📊 文件大小: $size"
    echo "📍 位置: $(pwd)/moonpocket-$BACKUP_TYPE-$timestamp.zip"
  fi
  
  echo ""
  echo "💡 提示："
  case $BACKUP_TYPE in
    "complete")
      echo "  - 适合发布和完整项目备份"
      echo "  - 包含所有图片和资源文件"
      ;;
    "code")
      echo "  - 适合日常开发备份"
      echo "  - 快速传输，包含所有代码"
      ;;
    "minimal")
      echo "  - 适合快速代码备份"
      echo "  - 最小文件，仅核心功能"
      ;;
  esac
else
  echo ""
  echo "❌ 备份失败"
  exit 1
fi

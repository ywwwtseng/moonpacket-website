#!/bin/bash
# === 0) 安全快照 ===
git checkout -b fix/i18n-sync-$(date +%Y%m%d-%H%M)

# === 1) 還原非文字檔（只還原，不 commit；確保之前被誤改的版型/動畫/瀑布流回來）===
git restore \
  src/**/*.astro \
  src/components/** \
  src/lib/waterfall/** \
  src/styles/** || true

# === 2) 三語言逐一處理（audit -> dry-run -> restore -> check）===
for L in zh-TW zh-CN en-US; do
  echo "=== ${L}: audit ==="
  pnpm i18n:audit --lang=${L}

  echo "=== ${L}: restore (dry-run) ==="
  pnpm i18n:restore --lang=${L} --dry-run

  echo "=== ${L}: restore (real) ==="
  pnpm i18n:restore --lang=${L}

  echo "=== ${L}: check ==="
  pnpm i18n:check --lang=${L}
done

# === 3) 檢視報告（選看）===
ls -lah scripts/reports || true

# === 4) 構建公開版本，驗證只有 3 種語言 ===
pnpm build:public

# === 5) Commit ===
git add -A
git commit -m "i18n: CSV-as-source, per-lang restore (strings only), keep layout/animations protected"


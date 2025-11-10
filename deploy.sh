#!/usr/bin/env bash
#
# 安全部署腳本：從私庫 build，推到公開 moonpacket-site，
# 並更新 moonpacket.com。
#
# 用法：
#   GITHUB_TOKEN=你的token ./deploy.sh "deploy message"
#
# 注意：
# - 不會動你私庫 .git
# - 只會在 __deploy_tmp/ 裡面 clone 公庫、commit、push
# - 自動寫入 CNAME=moonpacket.com
# - 在暫存 repo 關掉 gpg 簽署，避免卡住
#
set -e

ROOT=$(pwd)

### ====== 依你的情況調整的參數 ======

# 用 HTTPS + token 的 remote，避免 SSH key 問題
# 我們把 token 從環境變數塞進 URL，讓 git push 不會再互動詢問密碼
if [ -z "$GITHUB_TOKEN" ]; then
  echo "請用：GITHUB_TOKEN=你的PAT ./deploy.sh \"message\""
  exit 1
fi
PUBLIC_REPO_GIT="https://$GITHUB_TOKEN@github.com/ywwwtseng/moonpacket-site.git"

PUBLIC_BRANCH="gh-pages"

BUILD_DIR="dist"

CUSTOM_DOMAIN="moonpacket.com"

SITE_URL="https://moonpacket.com/"

### ===================================

# 1. 取得部署訊息
if [ -z "$1" ]; then
  echo "請提供部署訊息，例如："
  echo "GITHUB_TOKEN=xxx ./deploy.sh \"deploy: update zh-TW copy\""
  exit 1
fi
DEPLOY_MSG="$1"

echo "=== [0] 確認私庫狀態 (僅提醒，沒有自動 commit) ==="
git status
echo "如果上面還有未 commit 的修改，Ctrl+C 中止，先 commit & push 私庫。"
sleep 2

echo "=== [1] Build 專案 (SITE=$SITE_URL, PUBLIC_ONLY=${PUBLIC_ONLY:-1}) ==="
if [ "${PUBLIC_ONLY:-1}" = "0" ]; then
  SITE="$SITE_URL" pnpm astro build
else
  SITE="$SITE_URL" PUBLIC_ONLY=1 pnpm astro build
fi

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ 找不到 $BUILD_DIR/ ，build 可能失敗，停止部署。"
  exit 1
fi

echo "=== [2] 準備暫存資料夾 __deploy_tmp ==="
rm -rf __deploy_tmp
mkdir __deploy_tmp

echo "=== [3] Clone 公庫 ($PUBLIC_BRANCH) ==="
git clone --branch "$PUBLIC_BRANCH" --depth 1 "$PUBLIC_REPO_GIT" __deploy_tmp/repo || {
  echo "gh-pages 不存在，clone main/master"
  git clone --depth 1 "$PUBLIC_REPO_GIT" __deploy_tmp/repo
  cd __deploy_tmp/repo
  git checkout -b "$PUBLIC_BRANCH" 2>/dev/null || git checkout "$PUBLIC_BRANCH"
  cd "$ROOT"
}

echo "=== [4] 清空公庫內容 (保留 .git) ==="
cd __deploy_tmp/repo
find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +

echo "=== [5] 複製 build 結果到公庫 ==="
cd "$ROOT"
cp -R "$BUILD_DIR"/. __deploy_tmp/repo/

echo "=== [6] 寫入 CNAME 和 .nojekyll ==="
echo "$CUSTOM_DOMAIN" > __deploy_tmp/repo/CNAME
touch __deploy_tmp/repo/.nojekyll

echo "=== [7] 設定臨時 git config (user, 關掉 GPG 簽名) ==="
cd __deploy_tmp/repo

# 這些只套用在 __deploy_tmp/repo 這個暫存 clone
git config user.name "yveschen001"
git config user.email "yveschen001@users.noreply.github.com"
git config commit.gpgsign false

echo "=== [8] Commit & Push ==="
git add .
git commit -m "$DEPLOY_MSG" || echo "沒有變更，跳過 commit"
git push origin "$PUBLIC_BRANCH"

echo "=== [9] 清理暫存資料夾 ==="
cd "$ROOT"
rm -rf __deploy_tmp

echo "✅ 部署完成：已推到 moonpacket-site/$PUBLIC_BRANCH，GitHub Pages 會更新 moonpacket.com"

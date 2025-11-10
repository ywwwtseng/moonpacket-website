#!/usr/bin/env bash
#
# deploy-prod.sh
# 這個是你平常要執行的指令。
# 用法：
#   ./deploy-prod.sh "deploy message"
#
# 它會：
# 1. 從 .env.deploy.local 載入本地的 GITHUB_TOKEN（不在 git 內）
# 2. 呼叫 deploy.sh，把 message 傳下去
#
set -e

# 1. 載入本地私密 token
if [ ! -f .env.deploy.local ]; then
  echo "❌ 找不到 .env.deploy.local。請先建立，並放 export GITHUB_TOKEN=... "
  exit 1
fi
# 把 token load 進環境變數
. ./.env.deploy.local

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ GITHUB_TOKEN 沒有載進來。請檢查 .env.deploy.local 內容格式："
  echo 'export GITHUB_TOKEN="your_token_here"'
  exit 1
fi

# 2. 把第一個參數當成 commit / deploy 訊息
if [ -z "$1" ]; then
  echo '請給部署訊息，例如:'
  echo './deploy-prod.sh "deploy: 更新 zh-TW FAQ + 修正首頁 copy"'
  exit 1
fi
DEPLOY_MSG="$1"

# 3. 呼叫真正的部署腳本（我們之前做的 deploy.sh 那支 HTTPS+token版）
GITHUB_TOKEN="$GITHUB_TOKEN" ./deploy.sh "$DEPLOY_MSG"


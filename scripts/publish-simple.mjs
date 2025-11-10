#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = process.cwd();
const OUT = resolve(ROOT, 'dist');

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

function safeRun(cmd, opts = {}) {
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8', ...opts });
  return { code: res.status ?? 0, stdout: res.stdout || '', stderr: res.stderr || '' };
}

try {
  console.log('🔄 开始公开部署...');

  // 1) 构建项目
  console.log('📦 构建项目...');
  const SITE_URL = process.env.SITE || 'https://ywwwtseng.github.io/moonpacket-site/';
  run(`SITE=${SITE_URL} pnpm build`);

  // 2) 检查dist目录
  if (!existsSync(OUT)) {
    throw new Error('构建失败：dist目录不存在');
  }

  // 3) 创建临时目录（避免权限/残留问题）
  const TMP = '/tmp/moonpacket-public-deploy';
  run(`rm -rf "${TMP}"`);
  run(`mkdir -p "${TMP}"`);

  // 4) 复制dist内容到临时目录（使用 "." 確保包含隱藏檔，並處理空白檔名）
  console.log('📋 复制文件...');
  run(`cp -R "${OUT}/." "${TMP}/"`);

  // 5) 添加.nojekyll文件與可選 CNAME
  writeFileSync(join(TMP, '.nojekyll'), '');
  const cname = process.env.CNAME || (SITE_URL.includes('moonpacket.com') ? 'moonpacket.com' : '');
  if (cname) writeFileSync(join(TMP, 'CNAME'), cname + '\n');

  // 6) 準備遠端倉庫資訊
  const OWNER = process.env.GH_OWNER || 'ywwwtseng';
  const NAME = process.env.GH_REPO || 'moonpacket_site';
  const TOKEN = process.env.GITHUB_TOKEN || '';
  // 使用 x-access-token 形式，兼容 Fine-grained PAT 推送
  const PUBLIC_REPO = process.env.PUBLIC_REPO || (TOKEN ? `https://x-access-token:${TOKEN}@github.com/${OWNER}/${NAME}.git` : `git@github.com:${OWNER}/${NAME}.git`);

  // 7) 以 gh-pages 為基礎做「增量」部署（clone 現有分支 → 覆蓋 dist → commit 變更 → push）
  console.log('🔧 初始化git仓库...');
  const CLONE_CMD = TOKEN
    ? `git clone --depth 1 --branch gh-pages ${PUBLIC_REPO} ${TMP}`
    : `GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes' git clone --depth 1 --branch gh-pages ${PUBLIC_REPO} ${TMP}`;
  let cloned = safeRun(CLONE_CMD);
  if (cloned.code !== 0) {
    // 若分支不存在，初始化空倉庫
    run(`cd "${TMP}" && git init`);
    run(`cd "${TMP}" && git checkout -b gh-pages`);
    run(`cd "${TMP}" && git remote add origin ${PUBLIC_REPO}`);
  }
  run(`cd "${TMP}" && git config user.name "moonpacket-deploy"`);
  run(`cd "${TMP}" && git config user.email "deploy@moonpacket.dev"`);
  run(`cd "${TMP}" && git config commit.gpgsign false`);

  // 清空（保留 .git）再覆蓋 dist
  run(`cd "${TMP}" && find . -mindepth 1 -maxdepth 1 ! -name ".git" -exec rm -rf {} +`);
  run(`cp -R "${OUT}/." "${TMP}/"`);

  let success = false;
  // noop 檢查：沒有差異就跳過
  const status = run(`cd "${TMP}" && git status --porcelain`).trim();
  if (!status) {
    console.log('ℹ️  沒有變更，跳過推送');
    success = true;
  } else {
    run(`cd "${TMP}" && git add -A`);
    run(`cd "${TMP}" && git commit -m "Deploy moonpacket site $(date +%Y%m%d-%H%M%S)"`);

    console.log('🚀 推送到GitHub Pages...');
    function doPush() {
      const cmd = TOKEN
        ? `cd "${TMP}" && git push origin gh-pages`
        : `cd "${TMP}" && GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes' git push origin gh-pages`;
      return safeRun(cmd);
    }
    let pushRes = doPush();
    if (pushRes.code !== 0) {
      try {
        console.warn('⚠️ 推送失敗，嘗試 git gc/repack 後重試...');
        run(`cd "${TMP}" && git gc --prune=now || true`);
        run(`cd "${TMP}" && git repack -adf || true`);
      } catch {}
      pushRes = doPush();
    }
    if (pushRes.code !== 0) {
      // 若仍被拒，最後以 --force-with-lease 作為保底（避免歷史衝突阻擋發布）
      console.warn('⚠️ 推送仍失敗，先 fetch 更新遠端資訊，再以 --force-with-lease 作為保底...');
      try { run(`cd "${TMP}" && git fetch --prune origin gh-pages --depth=1 || true`); } catch {}
      const cmd = TOKEN
        ? `cd "${TMP}" && git push --force-with-lease origin gh-pages`
        : `cd "${TMP}" && GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes' git push --force-with-lease origin gh-pages`;
      const forced = safeRun(cmd);
      if (forced.code !== 0) {
        console.error('❌ 部署失败:', (forced.stderr || 'unknown error'));
        process.exit(1);
      }
    }
    success = true;
  }

  // 9) 清理临时目录
  run(`rm -rf "${TMP}"`);

  if (success) {
  console.log('✅ 公开部署完成！');
  console.log(`🌐 网站地址: ${SITE_URL}`);
  } else {
    console.error('❌ 部署失败: 未能完成推送');
    process.exit(1);
  }

} catch (err) {
  console.error('❌ 部署失败:', err.message || String(err));
  process.exit(1);
}



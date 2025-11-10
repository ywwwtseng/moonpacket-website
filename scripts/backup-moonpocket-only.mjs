#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

function safeRun(cmd, opts = {}) {
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8', ...opts });
  return { code: res.status ?? 0, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + '-' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function listBackups(dir) {
  const out = safeRun(`ls -1t ${dir}/backup-*.tar.gz 2>/dev/null`);
  const files = out.stdout
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  return files;
}

function humanSize(p) {
  const out = safeRun(`du -h ${p} | awk '{print $1}'`);
  return out.stdout.trim();
}

try {
  const root = process.cwd();
  const backupsDir = resolve(root, 'backups');
  ensureDir(backupsDir);

  const LOG = resolve(backupsDir, 'backup.log');
  const STAMP = nowStamp();
  const ARCHIVE = resolve(backupsDir, `backup-${STAMP}.tar.gz`);

  console.log(`[${STAMP}] 開始備份 moonpocket 專案...`);

  // 1) 保留最近3個版本：刪除多餘的
  const existing = listBackups(backupsDir);
  if (existing.length > 3) {
    const toDelete = existing.slice(3);
    for (const f of toDelete) {
      const sum = `${f}.sha256`;
      safeRun(`rm -f ${f}`);
      safeRun(`rm -f ${sum}`);
    }
    console.log(`清理了 ${toDelete.length} 個舊備份`);
    writeFileSync(LOG, `[${STAMP}] pruned old archives: ${toDelete.map((p) => basename(p)).join(', ')}\n`, { flag: 'a' });
  }

  // 2) 只備份 moonpocket 專案內容（排除大型目錄）
  const excludeArgs = [
    '--exclude=node_modules',
    '--exclude=.astro', 
    '--exclude=dist',
    '--exclude=backups',
    '--exclude=.git',
    '--exclude=.DS_Store'
  ].join(' ');

  run(`tar -czf ${ARCHIVE} ${excludeArgs} .`);
  run(`shasum -a 256 ${ARCHIVE} > ${ARCHIVE}.sha256`);

  const archiveSize = humanSize(ARCHIVE);
  console.log(`本地備份完成: ${basename(ARCHIVE)} (${archiveSize})`);

  // 3) 推送到私庫（使用 git subtree 或 git bundle 方式）
  console.log('準備推送到私庫...');
  
  // 方法1: 使用 git subtree 推送（只推送 moonpocket 目錄）
  const BACKUP_BRANCH = `backup/${STAMP}`;
  
  // 先檢查是否在正確的 git 倉庫中
  const gitRoot = run('git rev-parse --show-toplevel').trim();
  if (gitRoot !== root) {
    console.log(`警告: Git 根目錄是 ${gitRoot}，不是 ${root}`);
    console.log('使用 git subtree 方式推送...');
    
    // 使用 git subtree 推送當前目錄到備份分支
    const pushRes = safeRun(
      `GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes' git subtree push --prefix=moonpocket git@github.com:ywwwtseng/moonpacket.git ${BACKUP_BRANCH}`
    );
    
    if (pushRes.code !== 0) {
      console.log('subtree push 失敗，嘗試創建新分支...');
      // 備用方案：創建臨時分支推送
      const tempBranch = `temp-moonpocket-${STAMP}`;
      run(`git checkout -b ${tempBranch}`);
      run(`git add .`);
      run(`git commit -m "Backup moonpocket project ${STAMP}" || true`);
      
      const pushRes2 = safeRun(
        `GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes' git push git@github.com:ywwwtseng/moonpacket.git ${tempBranch}:refs/heads/${BACKUP_BRANCH}`
      );
      
      if (pushRes2.code === 0) {
        console.log(`推送完成: ${BACKUP_BRANCH}`);
        run(`git checkout main || git checkout master`);
        run(`git branch -D ${tempBranch}`);
      } else {
        console.error('推送失敗:', pushRes2.stderr);
        writeFileSync(LOG, `[${STAMP}] push failed: ${pushRes2.stderr}\n`, { flag: 'a' });
      }
    } else {
      console.log(`推送完成: ${BACKUP_BRANCH}`);
    }
  } else {
    // 如果在正確的 git 倉庫中，直接推送
    const pushRes = safeRun(
      `GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes' git push git@github.com:ywwwtseng/moonpacket.git HEAD:refs/heads/${BACKUP_BRANCH}`
    );
    
    if (pushRes.code === 0) {
      console.log(`推送完成: ${BACKUP_BRANCH}`);
    } else {
      console.error('推送失敗:', pushRes.stderr);
      writeFileSync(LOG, `[${STAMP}] push failed: ${pushRes.stderr}\n`, { flag: 'a' });
    }
  }

  console.log(`DONE ${STAMP}`);
  writeFileSync(LOG, `[${STAMP}] backup completed: ${basename(ARCHIVE)} (${archiveSize})\n`, { flag: 'a' });

} catch (err) {
  console.error('ERROR:', err.message || String(err));
  process.exit(1);
}

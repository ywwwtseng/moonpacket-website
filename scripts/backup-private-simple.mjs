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

try {
  const root = process.cwd();
  const backupsDir = resolve(root, 'backups');
  ensureDir(backupsDir);

  const LOG = resolve(backupsDir, 'backup.log');
  const STAMP = nowStamp();
  const BACKUP_BRANCH = `backup/${STAMP}`;

  console.log(`🔄 开始备份到私库...`);

  // 1) 创建临时目录
  const tempDir = `/tmp/moonpocket-backup-${STAMP}`;
  run(`rm -rf ${tempDir}`);
  run(`mkdir -p ${tempDir}`);

  // 2) 复制项目文件到临时目录（排除无用文件）
  const excludePatterns = [
    '--exclude=node_modules',
    '--exclude=.git',
    '--exclude=.astro',
    '--exclude=dist',
    '--exclude=backups',
    '--exclude=.DS_Store',
    '--exclude=*.log'
  ].join(' ');

  run(`tar -czf ${tempDir}/moonpocket.tar.gz ${excludePatterns} .`);
  run(`cd ${tempDir} && tar -xzf moonpocket.tar.gz`);
  run(`rm ${tempDir}/moonpocket.tar.gz`);

  // 3) 在临时目录初始化git仓库
  run(`cd ${tempDir} && git init`);
  run(`cd ${tempDir} && git config user.name "moonpocket-backup"`);
  run(`cd ${tempDir} && git config user.email "backup@moonpacket.dev"`);
  run(`cd ${tempDir} && git config commit.gpgsign false`); // 禁用GPG签名
  run(`cd ${tempDir} && git add .`);
  run(`cd ${tempDir} && git commit -m "Backup moonpocket project ${STAMP}"`);

  // 4) 添加远程仓库并推送（单向推送）
  const remoteUrl = 'git@github.com:ywwwtseng/moonpacket.git';
  const sshKey = '~/.ssh/id_ed25519_yves';
  
  run(`cd ${tempDir} && git remote add origin ${remoteUrl}`);
  
  // 5) 推送新分支（不拉取任何远程内容）
  const pushRes = safeRun(
    `cd ${tempDir} && GIT_SSH_COMMAND='ssh -i ${sshKey} -o IdentitiesOnly=yes' git push origin HEAD:refs/heads/${BACKUP_BRANCH}`
  );

  // 6) 清理临时目录
  run(`rm -rf ${tempDir}`);

  if (pushRes.code === 0) {
    console.log(`✅ 私库备份完成: ${BACKUP_BRANCH}`);
    writeFileSync(LOG, `[${STAMP}] 私库备份成功: ${BACKUP_BRANCH}\n`, { flag: 'a' });
  } else {
    console.error(`❌ 私库备份失败:`, pushRes.stderr);
    writeFileSync(LOG, `[${STAMP}] 私库备份失败: ${pushRes.stderr}\n`, { flag: 'a' });
    process.exit(1);
  }

  console.log(`🎉 备份完成！`);

} catch (err) {
  console.error('❌ 备份失败:', err.message || String(err));
  process.exit(1);
}

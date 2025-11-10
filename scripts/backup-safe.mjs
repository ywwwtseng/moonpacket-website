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

function dfFreeGB(cwd = '.') {
  const out = safeRun(`df -g ${cwd} | awk 'NR==2{print $4}'`);
  const n = parseInt(out.stdout.trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function humanSize(p) {
  const out = safeRun(`du -h ${p} | awk '{print $1}'`);
  return out.stdout.trim();
}

try {
  // Pre-flight
  run('git rev-parse --is-inside-work-tree >/dev/null 2>&1');
  const root = process.cwd();
  const backupsDir = resolve(root, 'backups');
  ensureDir(backupsDir);

  const LOG = resolve(backupsDir, 'backup.log');
  const STAMP = nowStamp();
  const BUNDLE = resolve(backupsDir, `moonpocket-${STAMP}.bundle`);
  const ARCHIVE = resolve(backupsDir, `backup-${STAMP}.tar.gz`);

  // 1) 保留最近3個版本：刪除多餘的（依時間排序）
  const existing = listBackups(backupsDir);
  if (existing.length > 3) {
    const toDelete = existing.slice(3);
    for (const f of toDelete) {
      const sum = `${f}.sha256`;
      safeRun(`rm -f ${f}`);
      safeRun(`rm -f ${sum}`);
    }
    writeFileSync(LOG, `[${STAMP}] pruned old archives: ${toDelete.map((p) => basename(p)).join(', ')}\n`, { flag: 'a' });
  }

  // 2) 空間檢查
  const freeGB = dfFreeGB(root);
  const skipArchive = freeGB < 20; // <20GB 僅做 bundle
  if (skipArchive) {
    writeFileSync(LOG, `[${STAMP}] WARN: Free space ${freeGB}G < 20G, skip archive.\n`, { flag: 'a' });
  }

  // 3) 生成 bundle（完整歷史）
  run(`git -c gc.auto=0 bundle create ${BUNDLE} --all`);
  run(`shasum -a 256 ${BUNDLE} > ${BUNDLE}.sha256`);

  // 4) 生成 HEAD 快照（若不跳過）
  if (!skipArchive) {
    run(`git archive --format=tar.gz -o ${ARCHIVE} HEAD`);
    run(`shasum -a 256 ${ARCHIVE} > ${ARCHIVE}.sha256`);
  }

  // 5) 推送到私庫備份分支（永不推 main）
  const BACKUP_BRANCH = `backup/${STAMP}`;
  const pushRes = safeRun(
    `GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519_yves -o IdentitiesOnly=yes' git push git@github.com:ywwwtseng/moonpacket.git HEAD:refs/heads/${BACKUP_BRANCH}`
  );
  if (pushRes.code !== 0) {
    writeFileSync(LOG, `[${STAMP}] push failed: ${pushRes.stderr}\n`, { flag: 'a' });
    console.error('Push failed. See backups/backup.log');
  }

  // Minimal console output
  const bundleSize = humanSize(BUNDLE);
  console.log(`Local bundle: ${basename(BUNDLE)} (${bundleSize})`);
  if (!skipArchive) {
    const archiveSize = humanSize(ARCHIVE);
    console.log(`Local archive: ${basename(ARCHIVE)} (${archiveSize})`);
  }
  console.log(`Pushed branch: ${BACKUP_BRANCH}`);
  console.log(`DONE ${STAMP}`);
} catch (err) {
  console.error('ERROR:', err.message || String(err));
  process.exit(1);
}



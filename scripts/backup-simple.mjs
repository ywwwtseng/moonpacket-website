#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
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
  try {
    const out = run(`ls -1t ${dir}/backup-*.tar.gz 2>/dev/null`);
    const files = out
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return files;
  } catch {
    return [];
  }
}

function humanSize(p) {
  try {
    const out = run(`du -h ${p} | awk '{print $1}'`);
    return (typeof out === 'string' ? out : String(out)).trim();
  } catch {
    return 'unknown';
  }
}

try {
  const root = process.cwd();
  const backupsDir = resolve(root, 'backups');
  ensureDir(backupsDir);

  const LOG = resolve(backupsDir, 'backup.log');
  const STAMP = nowStamp();
  const ARCHIVE = resolve(backupsDir, `backup-${STAMP}.tar.gz`);

  console.log(`🔄 开始备份 moonpocket 项目...`);

  // 1) 保留最近3個版本：刪除多餘的
  const existing = listBackups(backupsDir);
  if (existing.length > 3) {
    const toDelete = existing.slice(3); // 保留最新的3個，刪除其他的
    for (const f of toDelete) {
      const sum = `${f}.sha256`;
      try {
        run(`rm -f ${f}`);
        run(`rm -f ${sum}`);
        console.log(`🗑️  刪除舊備份: ${basename(f)}`);
      } catch (e) {
        // 忽略删除错误
      }
    }
    if (toDelete.length) {
      writeFileSync(LOG, `[${STAMP}] 刪除舊備份: ${toDelete.map((p) => basename(p)).join(', ')}\n`, { flag: 'a' });
    }
  }

  // 2) 创建当前项目的tar.gz备份（排除node_modules, .git等）
  const excludePatterns = [
    '--exclude=node_modules',
    '--exclude=.git',
    '--exclude=.astro',
    '--exclude=dist',
    '--exclude=backups',
    '--exclude=.DS_Store',
    '--exclude=*.log'
  ].join(' ');

  run(`tar -czf ${ARCHIVE} ${excludePatterns} .`);
  
  // 3) 生成SHA256校验和
  run(`shasum -a 256 ${ARCHIVE} > ${ARCHIVE}.sha256`);

  // 4) 记录日志
  const archiveSize = humanSize(ARCHIVE);
  const logEntry = `[${STAMP}] 备份完成: ${basename(ARCHIVE)} (${archiveSize})\n`;
  writeFileSync(LOG, logEntry, { flag: 'a' });

  console.log(`✅ 备份完成: ${basename(ARCHIVE)} (${archiveSize})`);
  console.log(`📁 备份位置: ${ARCHIVE}`);
  console.log(`🔐 校验文件: ${ARCHIVE}.sha256`);
  console.log(`📝 日志文件: ${LOG}`);
  console.log(`🎉 备份成功！`);

} catch (err) {
  console.error('❌ 备份失败:', err.message || String(err));
  process.exit(1);
}
